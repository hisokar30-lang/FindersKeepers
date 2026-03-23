// ============================================================
// SUBSCRIPTIONS SERVICE LAYER
// Phase 1.2: Database Service Layer
// Handles user tiers, feature limits, and subscription management
// ============================================================

import { supabase } from './supabase';
import type {
  Subscription,
  SubscriptionInsert,
  SubscriptionTier,
  SubscriptionTierConfig,
  FeatureLimits,
  UserSubscriptionState,
} from './monetizationTypes';

/**
 * Get subscription tier configuration
 */
export async function getTierConfig(
  tier: SubscriptionTier
): Promise<{ config: SubscriptionTierConfig | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('tier_name', tier)
    .eq('is_active', true)
    .single();

  if (error) {
    return { config: null, error: new Error(error.message) };
  }

  return { config: data as SubscriptionTierConfig, error: null };
}

/**
 * Get all tier configurations
 */
export async function getAllTierConfigs(): Promise<{
  tiers: SubscriptionTierConfig[];
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('subscription_tiers')
    .select('*')
    .eq('is_active', true)
    .order('monthly_price', { ascending: true });

  if (error) {
    return { tiers: [], error: new Error(error.message) };
  }

  return { tiers: data as SubscriptionTierConfig[], error: null };
}

/**
 * Convert tier config to feature limits object
 */
export function tierConfigToLimits(config: SubscriptionTierConfig): FeatureLimits {
  return {
    maxActiveItems: config.max_active_items,
    maxStorageDays: config.max_storage_days,
    maxBoostsPerMonth: config.max_boosts_per_month,
    maxMessageHistoryDays: config.max_message_history_days,
    maxPhotosPerItem: config.max_photos_per_item,
    hasAnalytics: config.has_analytics,
    hasCustomBranding: config.has_custom_branding,
    hasApiAccess: config.has_api_access,
    hasPrioritySupport: config.has_priority_support,
  };
}

/**
 * Get user's subscription
 */
export async function getUserSubscription(
  userId: string
): Promise<{ subscription: Subscription | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    return { subscription: null, error: new Error(error.message) };
  }

  // If no subscription, return free tier default
  if (!data) {
    const freeSub: Subscription = {
      id: '',
      user_id: userId,
      tier: 'free',
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_start: null,
      current_period_end: null,
      status: 'active',
      cancel_at_period_end: false,
      items_used_this_period: 0,
      boosts_used_this_period: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      canceled_at: null,
    };
    return { subscription: freeSub, error: null };
  }

  return { subscription: data as Subscription, error: null };
}

/**
 * Create subscription record (called after Stripe checkout)
 */
export async function createSubscription(
  data: SubscriptionInsert
): Promise<{ subscription: Subscription | null; error: Error | null }> {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .insert(data)
    .select()
    .single();

  if (error) {
    return { subscription: null, error: new Error(error.message) };
  }

  return { subscription: subscription as Subscription, error: null };
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  updates: Partial<{
    tier: SubscriptionTier;
    stripe_subscription_id: string | null;
    stripe_price_id: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    status: Subscription['status'];
    cancel_at_period_end: boolean;
    canceled_at: string | null;
  }>
): Promise<{ subscription: Subscription | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) {
    return { subscription: null, error: new Error(error.message) };
  }

  return { subscription: data as Subscription, error: null };
}

/**
 * Get feature limits for a user
 */
export async function getUserFeatureLimits(
  userId: string
): Promise<{ limits: FeatureLimits | null; error: Error | null }> {
  const { subscription } = await getUserSubscription(userId);

  if (!subscription) {
    // Return free tier limits
    const { config, error } = await getTierConfig('free');
    if (error || !config) {
      return { limits: null, error: error || new Error('No free tier config') };
    }
    return { limits: tierConfigToLimits(config), error: null };
  }

  const { config, error } = await getTierConfig(subscription.tier);
  if (error || !config) {
    return { limits: null, error: error || new Error('Tier config not found') };
  }

  return { limits: tierConfigToLimits(config), error: null };
}

/**
 * Check if user can access a feature
 */
export async function canAccessFeature(
  userId: string,
  feature: keyof FeatureLimits
): Promise<boolean> {
  const { limits, error } = await getUserFeatureLimits(userId);

  if (error || !limits) {
    return false;
  }

  const value = limits[feature];

  // For boolean features
  if (typeof value === 'boolean') {
    return value;
  }

  // For numeric limits (null means unlimited)
  if (value === null) {
    return true;
  }

  // For numeric limits, check if user has remaining
  return value > 0;
}

/**
 * Check if user has reached item limit
 */
export async function hasReachedItemLimit(userId: string): Promise<boolean> {
    const { state } = await getUserSubscriptionState(userId);
  if (!state) return false; const limits = state.limits;

    if (!state || !limits || limits.maxActiveItems === null) {
    return false; // Unlimited
  }
  return state.usage.itemsUsed >= limits.maxActiveItems;
}

/**
 * Get remaining boosts for current period
 */
export async function getRemainingBoosts(userId: string): Promise<number> {
    const { state } = await getUserSubscriptionState(userId);
  if (!state) return 0; const limits = state.limits;

  if (!limits || limits.maxBoostsPerMonth === null) {
    return Infinity; // Unlimited
  }

  return Math.max(0, limits.maxBoostsPerMonth - state.usage.boostsUsed);
}

/**
 * Increment usage counters
 */
export async function incrementUsage(
  subscriptionId: string,
  type: 'items' | 'boosts'
): Promise<{ success: boolean; error: Error | null }> {
  const field = type === 'items' ? 'items_used_this_period' : 'boosts_used_this_period';

  const { error } = await supabase.rpc('increment_usage', {
    p_subscription_id: subscriptionId,
    p_field: field,
  });

  if (error) {
    // Fallback: direct update if RPC fails
    const { data: sub } = await supabase
      .from('subscriptions')
      .select(field)
      .eq('id', subscriptionId)
      .single();

    if (sub) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ [field]: (sub[field as keyof typeof sub] as number || 0) + 1 })
        .eq('id', subscriptionId);

      if (updateError) {
        return { success: false, error: new Error(updateError.message) };
      }
    }
  }

  return { success: true, error: null };
}

/**
 * Reset usage counters (called at billing period end)
 */
export async function resetUsageCounters(
  subscriptionId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      items_used_this_period: 0,
      boosts_used_this_period: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Get complete user subscription state
 */
export async function getUserSubscriptionState(
  userId: string
): Promise<{ state: UserSubscriptionState | null; error: Error | null }> {
  const { subscription, error: subError } = await getUserSubscription(userId);

  if (subError) {
    return { state: null, error: subError };
  }

  const { limits, error: limitsError } = await getUserFeatureLimits(userId);

  if (limitsError) {
    return { state: null, error: limitsError };
  }

  if (!subscription || !limits) {
    return { state: null, error: new Error('Failed to load subscription') };
  }

  // Calculate remaining usage
  const itemsRemaining =
    limits.maxActiveItems === null
      ? null
      : Math.max(0, limits.maxActiveItems - subscription.items_used_this_period);

  const boostsRemaining =
    limits.maxBoostsPerMonth === null
      ? null
      : Math.max(0, limits.maxBoostsPerMonth - subscription.boosts_used_this_period);

  const state: UserSubscriptionState = {
    tier: subscription.tier,
    status: subscription.status,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    limits,
    usage: {
      itemsUsed: subscription.items_used_this_period,
      itemsRemaining,
      boostsUsed: subscription.boosts_used_this_period,
      boostsRemaining: boostsRemaining ?? 0,
      storageDaysUsed: 0, // Calculate based on oldest item
      storageDaysRemaining: limits.maxStorageDays,
    },
  };

  return { state, error: null };
}

/**
 * Cancel subscription (at period end)
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Check if subscription is active (and not expired)
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return false;
  }

  if (subscription.current_period_end) {
    const periodEnd = new Date(subscription.current_period_end);
    if (periodEnd < new Date()) {
      return false;
    }
  }

  return true;
}

/**
 * Get subscription analytics (admin only)
 */
export async function getSubscriptionAnalytics(): Promise<{
  totalSubscribers: number;
  tierBreakdown: Record<SubscriptionTier, number>;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('status', 'active');

  if (error) {
    return {
      totalSubscribers: 0,
      tierBreakdown: { free: 0, basic: 0, business: 0 },
      mrr: 0,
      arr: 0,
      error: new Error(error.message),
    };
  }

  const subscriptions = data as { tier: SubscriptionTier; status: string }[];

  const tierBreakdown = subscriptions.reduce((acc, sub) => {
    acc[sub.tier] = (acc[sub.tier] || 0) + 1;
    return acc;
  }, {} as Record<SubscriptionTier, number>);

  // Get tier prices for MRR calculation
  const { data: tiers } = await supabase
    .from('subscription_tiers')
    .select('tier_name, monthly_price');

  const tierPrices: Record<string, number> = {};
  tiers?.forEach((t) => {
    tierPrices[t.tier_name] = t.monthly_price || 0;
  });

  const mrr = subscriptions.reduce((sum, sub) => {
    return sum + (tierPrices[sub.tier] || 0);
  }, 0);

  return {
    totalSubscribers: subscriptions.length,
    tierBreakdown: { free: tierBreakdown.free || 0, basic: tierBreakdown.basic || 0, business: tierBreakdown.business || 0 },
    mrr,
    arr: mrr * 12,
    error: null,
  };
}

/**
 * Create customer portal session for managing subscription
 * Called by the billing page to redirect to Stripe Customer Portal
 */
export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: stripeCustomerId,
        returnUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { url: null, error: new Error(error.error || 'Failed to create portal session') };
    }

    const data = await response.json();
    return { url: data.url, error: null };
  } catch (err) {
    return { url: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

