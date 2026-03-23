// ============================================================
// REWARDS SERVICE LAYER
// Phase 1.2: Database Service Layer
// Handles reward preferences and claim verification
// ============================================================

import { supabase } from './supabase';
import type {
  RewardPreference,
  RewardPreferenceInsert,
  VerificationQuestion,
} from './monetizationTypes';

// bcrypt simulation for client-side (use proper bcrypt in production)
async function hashAnswer(answer: string): Promise<string> {
  // In production: use bcrypt.hash(answer, 10)
  // For now: simple hash for demonstration
  const encoder = new TextEncoder();
  const data = encoder.encode(answer.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyAnswer(answer: string, hash: string): Promise<boolean> {
  const computedHash = await hashAnswer(answer);
  return computedHash === hash;
}

/**
 * Create reward preferences for an incident
 * Called when owner enables a reward
 */
export async function createRewardPreference(
  incidentId: string,
  rewardAmount: number,
  options: {
    anonymous?: boolean;
    minClaimerRating?: number;
    verificationQuestions?: { question: string; answer: string; hint?: string }[];
  } = {}
): Promise<{ preference: RewardPreference | null; error: Error | null }> {
  const {
    anonymous = false,
    minClaimerRating = 0,
    verificationQuestions = [],
  } = options;

  // Hash verification questions
  const hashedQuestions: VerificationQuestion[] = await Promise.all(
    verificationQuestions.map(async (q) => ({
      question: q.question,
      answer_hash: await hashAnswer(q.answer),
      hint: q.hint,
    }))
  );

  const insertData: RewardPreferenceInsert = {
    incident_id: incidentId,
    reward_enabled: true,
    reward_amount: rewardAmount,
    anonymous_reward: anonymous,
    min_claimer_rating: minClaimerRating,
    verification_questions: hashedQuestions,
  };

  const { data, error } = await supabase
    .from('reward_preferences')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Failed to create reward preference:', error);
    return { preference: null, error: new Error(error.message) };
  }

  // Create matching priority entry
  await createMatchingPriority(incidentId, rewardAmount);

  return { preference: data as RewardPreference, error: null };
}

/**
 * Get reward preference for an incident
 */
export async function getRewardPreference(
  incidentId: string
): Promise<{ preference: RewardPreference | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('reward_preferences')
    .select('*')
    .eq('incident_id', incidentId)
    .maybeSingle();

  if (error) {
    return { preference: null, error: new Error(error.message) };
  }

  return { preference: data as RewardPreference | null, error: null };
}

/**
 * Update reward preferences
 */
export async function updateRewardPreference(
  preferenceId: string,
  updates: Partial<{
    reward_amount: number;
    min_claimer_rating: number;
    anonymous_reward: boolean;
    verification_questions: VerificationQuestion[];
  }>
): Promise<{ preference: RewardPreference | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('reward_preferences')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', preferenceId)
    .select()
    .single();

  if (error) {
    return { preference: null, error: new Error(error.message) };
  }

  // Update matching priority if reward amount changed
  if (updates.reward_amount !== undefined) {
    await updateMatchingPriority(data.incident_id, updates.reward_amount);
  }

  return { preference: data as RewardPreference, error: null };
}

/**
 * Disable reward for an incident (refund flow)
 */
export async function disableReward(
  preferenceId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('reward_preferences')
    .update({
      reward_enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', preferenceId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Verify claim answers against stored questions
 */
export async function verifyClaimAnswers(
  preferenceId: string,
  answers: string[]
): Promise<{
  success: boolean;
  attemptsRemaining: number;
  error: Error | null;
}> {
  // Get the reward preference
  const { data: preference, error } = await supabase
    .from('reward_preferences')
    .select('*')
    .eq('id', preferenceId)
    .single();

  if (error) {
    return { success: false, attemptsRemaining: 0, error: new Error(error.message) };
  }

  const questions = preference.verification_questions as VerificationQuestion[];

  if (answers.length !== questions.length) {
    return {
      success: false,
      attemptsRemaining: 3, // Allow up to 3 attempts
      error: new Error('Answer count mismatch'),
    };
  }

  // Verify each answer
  const allCorrect = await Promise.all(
    questions.map((q, i) => verifyAnswer(answers[i], q.answer_hash))
  );

  const success = allCorrect.every(Boolean);

  return {
    success,
    attemptsRemaining: success ? 0 : 2, // Track in database for production
    error: null,
  };
}

/**
 * Create matching priority entry
 */
async function createMatchingPriority(
  incidentId: string,
  rewardAmount: number
): Promise<void> {
  const rewardWeight = Math.min(rewardAmount / 100, 1.0); // Cap at 1.0

  const { error } = await supabase.from('matching_priorities').insert({
    incident_id: incidentId,
    has_reward: true,
    reward_amount: rewardAmount,
    reward_weight: rewardWeight,
    base_score: 100,
    priority_score: Math.floor(100 + rewardAmount * 0.1),
  });

  if (error) {
    console.error('Failed to create matching priority:', error);
  }
}

/**
 * Update matching priority when reward changes
 */
async function updateMatchingPriority(
  incidentId: string,
  rewardAmount: number
): Promise<void> {
  const rewardWeight = Math.min(rewardAmount / 100, 1.0);

  const { error } = await supabase
    .from('matching_priorities')
    .update({
      reward_amount: rewardAmount,
      reward_weight: rewardWeight,
      priority_score: Math.floor(100 + rewardAmount * 0.1),
      last_calculated_at: new Date().toISOString(),
    })
    .eq('incident_id', incidentId);

  if (error) {
    console.error('Failed to update matching priority:', error);
  }
}

/**
 * Purchase priority boost for an item
 */
export async function purchasePriorityBoost(
  incidentId: string,
  hours: number
): Promise<{ success: boolean; error: Error | null }> {
  const boostExpiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('matching_priorities')
    .update({
      has_boost: true,
      boost_multiplier: 1.5, // 50% boost
      boost_expires_at: boostExpiresAt,
      last_calculated_at: new Date().toISOString(),
    })
    .eq('incident_id', incidentId);

  if (error) {
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Get priority score for an incident
 */
export async function getPriorityScore(
  incidentId: string
): Promise<number> {
  const { data, error } = await supabase
    .from('matching_priorities')
    .select('priority_score')
    .eq('incident_id', incidentId)
    .maybeSingle();

  if (error || !data) {
    return 0;
  }

  return data.priority_score || 0;
}

/**
 * Get items sorted by priority (for browse page)
 */
export async function getItemsByPriority(
  limit: number = 50,
  offset: number = 0
): Promise<{
  items: { incident_id: string; priority_score: number }[];
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from('matching_priorities')
    .select('incident_id, priority_score, has_reward, reward_amount, has_boost')
    .order('priority_score', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return { items: [], error: new Error(error.message) };
  }

  return { items: data, error: null };
}

/**
 * Get reward statistics for an owner
 */
export async function getOwnerRewardStats(
  ownerId: string
): Promise<{
  totalRewardsOffered: number;
  activeRewards: number;
  totalPaidOut: number;
  averageRewardAmount: number;
  error: Error | null;
}> {
  // Join with incidents to get owner rewards
  const { data, error } = await supabase
    .from('reward_preferences')
    .select(`
      *,
      incidents!inner(reporter_id),
      escrow_transactions(amount, status)
    `)
    .eq('incidents.reporter_id', ownerId)
    .eq('reward_enabled', true);

  if (error) {
    return {
      totalRewardsOffered: 0,
      activeRewards: 0,
      totalPaidOut: 0,
      averageRewardAmount: 0,
      error: new Error(error.message),
    };
  }

  const preferences = data as (RewardPreference & {
    incidents: { reporter_id: string };
    escrow_transactions?: { amount: number; status: string }[];
  })[];

  const totalRewardsOffered = preferences.length;
  const activeRewards = preferences.filter(p => p.reward_enabled).length;
  const totalPaidOut = preferences.reduce((sum, p) => {
    const released = p.escrow_transactions?.filter(t => t.status === 'released') || [];
    return sum + released.reduce((s, t) => s + t.amount, 0);
  }, 0);
  const averageRewardAmount =
    preferences.length > 0
      ? preferences.reduce((sum, p) => sum + (p.reward_amount || 0), 0) /
        preferences.length
      : 0;

  return {
    totalRewardsOffered,
    activeRewards,
    totalPaidOut,
    averageRewardAmount,
    error: null,
  };
}
