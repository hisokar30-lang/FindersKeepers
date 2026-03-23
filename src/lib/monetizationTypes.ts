// ============================================================
// MONETIZATION TYPES
// Phase 1: Escrow, Rewards, Subscriptions
// Generated: 2026-03-10
// ============================================================

// ============================================================
// ESCROW TRANSACTIONS
// ============================================================

export type EscrowStatus = 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
export type PaymentProvider = 'stripe' | 'paypal';

export interface EscrowTransaction {
  id: string;
  incident_id: string;
  owner_id: string;
  finder_id: string | null;
  amount: number;
  platform_fee: number;
  net_amount: number;
  currency: string;
  status: EscrowStatus;
  payment_provider: PaymentProvider;
  payment_intent_id: string | null;
  payout_transfer_id: string | null;
  created_at: string;
  updated_at: string;
  held_at: string | null;
  released_at: string | null;
  refunded_at: string | null;
  expires_at: string | null;
  disputed_at: string | null;
  dispute_reason: string | null;
  dispute_resolved_at: string | null;
  dispute_resolution: string | null;
  resolved_by: string | null;
  refund_reason: string | null;
}

export interface EscrowTransactionInsert {
  id?: string;
  incident_id: string;
  owner_id: string;
  finder_id?: string | null;
  amount: number;
  platform_fee?: number;
  net_amount?: number;
  currency?: string;
  status?: EscrowStatus;
  payment_provider?: PaymentProvider;
  payment_intent_id?: string | null;
  payout_transfer_id?: string | null;
  expires_at?: string | null;
}

export interface EscrowTransactionUpdate {
  finder_id?: string | null;
  status?: EscrowStatus;
  payment_intent_id?: string | null;
  payout_transfer_id?: string | null;
  held_at?: string | null;
  released_at?: string | null;
  refunded_at?: string | null;
  disputed_at?: string | null;
  dispute_reason?: string | null;
  dispute_resolved_at?: string | null;
  dispute_resolution?: string | null;
  resolved_by?: string | null;
  refund_reason?: string | null;
}

// ============================================================
// REWARD PREFERENCES
// ============================================================

export interface VerificationQuestion {
  question: string;
  answer_hash: string; // bcrypt hash of answer
  hint?: string;
}

export interface RewardPreference {
  id: string;
  incident_id: string;
  reward_enabled: boolean;
  reward_amount: number | null;
  min_claimer_rating: number;
  anonymous_reward: boolean;
  priority_boost_hours: number;
  boost_expires_at: string | null;
  verification_questions: VerificationQuestion[];
  created_at: string;
  updated_at: string;
}

export interface RewardPreferenceInsert {
  id?: string;
  incident_id: string;
  reward_enabled?: boolean;
  reward_amount?: number | null;
  min_claimer_rating?: number;
  anonymous_reward?: boolean;
  priority_boost_hours?: number;
  boost_expires_at?: string | null;
  verification_questions?: VerificationQuestion[];
}

// ============================================================
// SUBSCRIPTIONS
// ============================================================

export type SubscriptionTier = 'free' | 'basic' | 'business';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  status: SubscriptionStatus;
  cancel_at_period_end: boolean;
  items_used_this_period: number;
  boosts_used_this_period: number;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
}

export interface SubscriptionInsert {
  id?: string;
  user_id: string;
  tier?: SubscriptionTier;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
  status?: SubscriptionStatus;
  cancel_at_period_end?: boolean;
  items_used_this_period?: number;
  boosts_used_this_period?: number;
}

// ============================================================
// SUBSCRIPTION TIERS
// ============================================================

export interface SubscriptionTierConfig {
  id: string;
  tier_name: SubscriptionTier;
  max_active_items: number | null; // null = unlimited
  max_storage_days: number;
  max_boosts_per_month: number;
  max_message_history_days: number | null;
  max_photos_per_item: number | null;
  has_analytics: boolean;
  has_custom_branding: boolean;
  has_api_access: boolean;
  has_priority_support: boolean;
  monthly_price: number | null;
  yearly_price: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// MATCHING PRIORITIES
// ============================================================

export interface MatchingPriority {
  id: string;
  incident_id: string;
  base_score: number;
  priority_score: number;
  has_reward: boolean;
  reward_amount: number | null;
  reward_weight: number;
  has_boost: boolean;
  boost_multiplier: number;
  boost_expires_at: string | null;
  owner_tier_boost: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

// ============================================================
// FEATURE LIMITS (Computed from tier)
// ============================================================

export interface FeatureLimits {
  maxActiveItems: number | null;
  maxStorageDays: number;
  maxBoostsPerMonth: number;
  maxMessageHistoryDays: number | null;
  maxPhotosPerItem: number | null;
  hasAnalytics: boolean;
  hasCustomBranding: boolean;
  hasApiAccess: boolean;
  hasPrioritySupport: boolean;
}

// ============================================================
// STRIPE INTEGRATION TYPES
// ============================================================

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
}

export interface StripeConnectedAccount {
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    past_due: string[];
  };
}

// ============================================================
// API REQUEST/RESPONSE TYPES
// ============================================================

export interface CreateRewardRequest {
  incident_id: string;
  amount: number;
  anonymous?: boolean;
  verification_questions?: Omit<VerificationQuestion, 'answer_hash'>[];
  verification_answers?: string[]; // Plain text, hashed server-side
}

export interface CreateRewardResponse {
  reward_preference: RewardPreference;
  escrow_transaction: EscrowTransaction;
  client_secret: string; // Stripe client secret
}

export interface ClaimRewardRequest {
  incident_id: string;
  answers: string[];
}

export interface ClaimRewardResponse {
  success: boolean;
  message: string;
  escrow_transaction?: EscrowTransaction;
}

export interface BoostItemRequest {
  incident_id: string;
  hours: number;
}

export interface SubscriptionChangeRequest {
  tier: SubscriptionTier;
  interval?: 'monthly' | 'yearly';
}

export interface SubscriptionChangeResponse {
  subscription: Subscription;
  client_secret?: string; // For checkout if upgrading
}

// ============================================================
// ITEM WITH REWARD DATA (extended from existing LostItem)
// ============================================================

export interface ItemWithReward {
  id: string;
  title: string;
  description: string;
  reward_enabled?: boolean;
  reward_amount?: number | null;
  escrow_transaction_id?: string | null;
  priority_score?: number;
  visibility_boost_expires_at?: string | null;
}

// ============================================================
// PAYMENT SUMMARY
// ============================================================

export interface PaymentSummary {
  rewardAmount: number;
  platformFee: number;
  totalCharge: number;
  netToFinder: number;
}

// ============================================================
// USER SUBSCRIPTION STATE
// ============================================================

export interface UserSubscriptionState {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: FeatureLimits;
  usage: {
    itemsUsed: number;
    itemsRemaining: number | null;
    boostsUsed: number;
    boostsRemaining: number;
    storageDaysUsed: number;
    storageDaysRemaining: number;
  };
}
