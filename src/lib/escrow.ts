// ============================================================
// ESCROW SERVICE LAYER
// Phase 1.2: Database Service Layer
// Handles all escrow transaction operations
// ============================================================

import { supabase } from './supabase';
import type {
  EscrowTransaction,
  EscrowTransactionInsert,
  EscrowTransactionUpdate,
  EscrowStatus,
  PaymentSummary,
} from './monetizationTypes';

// Platform fee configuration
const PLATFORM_FEE_PERCENTAGE = 0.10; // 10%
const MIN_PLATFORM_FEE = 0.50; // $0.50 minimum
const MAX_PLATFORM_FEE = 50.00; // $50 maximum

/**
 * Calculate platform fee for a given amount
 * Formula: 10% with min $0.50 and max $50
 */
export function calculatePlatformFee(amount: number): number {
  const percentageFee = amount * PLATFORM_FEE_PERCENTAGE;
  return Math.min(Math.max(percentageFee, MIN_PLATFORM_FEE), MAX_PLATFORM_FEE);
}

/**
 * Calculate payment summary for display
 */
export function calculatePaymentSummary(rewardAmount: number): PaymentSummary {
  const platformFee = calculatePlatformFee(rewardAmount);
  const totalCharge = rewardAmount + platformFee; // Owner pays fee separately
  const netToFinder = rewardAmount; // Finder gets full reward

  return {
    rewardAmount,
    platformFee,
    totalCharge,
    netToFinder,
  };
}

/**
 * Create a new escrow transaction
 * Called when owner enables a reward
 */
export async function createEscrowTransaction(
  data: Omit<EscrowTransactionInsert, 'platform_fee' | 'net_amount' | 'status'>
): Promise<{ transaction: EscrowTransaction | null; error: Error | null }> {
  const platformFee = calculatePlatformFee(data.amount);
  const netAmount = data.amount; // Finder gets full reward

  const insertData: EscrowTransactionInsert = {
    ...data,
    platform_fee: platformFee,
    net_amount: netAmount,
    status: 'pending',
  };

  const { data: transaction, error } = await supabase
    .from('escrow_transactions')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Failed to create escrow transaction:', error);
    return { transaction: null, error: new Error(error.message) };
  }

  return { transaction: transaction as EscrowTransaction, error: null };
}

/**
 * Get escrow transaction by ID
 */
export async function getEscrowTransaction(
  transactionId: string
): Promise<{ transaction: EscrowTransaction | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('id', transactionId)
    .single();

  if (error) {
    return { transaction: null, error: new Error(error.message) };
  }

  return { transaction: data as EscrowTransaction, error: null };
}

/**
 * Get escrow transaction by incident ID
 */
export async function getEscrowByIncident(
  incidentId: string
): Promise<{ transaction: EscrowTransaction | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { transaction: null, error: new Error(error.message) };
  }

  return { transaction: data as EscrowTransaction | null, error: null };
}

/**
 * Hold funds in escrow (after payment confirmed)
 */
export async function holdEscrowFunds(
  transactionId: string,
  paymentIntentId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('escrow_transactions')
    .update({
      status: 'held',
      held_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      payment_intent_id: paymentIntentId,
    })
    .eq('id', transactionId)
    .eq('status', 'pending'); // Only from pending

  if (error) {
    console.error('Failed to hold escrow funds:', error);
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Release escrow to finder (after verified return)
 */
export async function releaseEscrowToFinder(
  transactionId: string,
  finderId: string,
  payoutTransferId?: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('escrow_transactions')
    .update({
      status: 'released',
      finder_id: finderId,
      released_at: new Date().toISOString(),
      payout_transfer_id: payoutTransferId || null,
    })
    .eq('id', transactionId)
    .eq('status', 'held'); // Only from held

  if (error) {
    console.error('Failed to release escrow:', error);
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Refund escrow to owner (if no claim or dispute resolved in owner favor)
 */
export async function refundEscrowToOwner(
  transactionId: string,
  reason: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('escrow_transactions')
    .update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      refund_reason: reason,
    })
    .eq('id', transactionId)
    .in('status', ['held', 'pending']);

  if (error) {
    console.error('Failed to refund escrow:', error);
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Mark escrow as disputed
 */
export async function disputeEscrow(
  transactionId: string,
  reason: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('escrow_transactions')
    .update({
      status: 'disputed',
      disputed_at: new Date().toISOString(),
      dispute_reason: reason,
    })
    .eq('id', transactionId)
    .eq('status', 'held');

  if (error) {
    console.error('Failed to dispute escrow:', error);
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Resolve disputed escrow
 */
export async function resolveEscrowDispute(
  transactionId: string,
  resolution: 'owner_wins' | 'finder_wins',
  notes: string,
  resolvedBy: string
): Promise<{ success: boolean; error: Error | null }> {
  const updates: Partial<EscrowTransactionUpdate> = {
    dispute_resolved_at: new Date().toISOString(),
    dispute_resolution: resolution,
    resolved_by: resolvedBy,
  };

  if (resolution === 'finder_wins') {
    updates.status = 'released';
    updates.released_at = new Date().toISOString();
  } else {
    updates.status = 'refunded';
    updates.refunded_at = new Date().toISOString();
    updates.refund_reason = `Dispute resolved in owner favor: ${notes}`;
  }

  const { error } = await supabase
    .from('escrow_transactions')
    .update(updates)
    .eq('id', transactionId)
    .eq('status', 'disputed');

  if (error) {
    console.error('Failed to resolve dispute:', error);
    return { success: false, error: new Error(error.message) };
  }

  return { success: true, error: null };
}

/**
 * Get user's escrow transactions (as owner or finder)
 */
export async function getUserEscrowTransactions(
  userId: string,
  status?: EscrowStatus
): Promise<{ transactions: EscrowTransaction[]; error: Error | null }> {
  let query = supabase
    .from('escrow_transactions')
    .select('*')
    .or(`owner_id.eq.${userId},finder_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return { transactions: [], error: new Error(error.message) };
  }

  return { transactions: data as EscrowTransaction[], error: null };
}

/**
 * Check if incident has active escrow
 */
export async function hasActiveEscrow(incidentId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('escrow_transactions')
    .select('id')
    .eq('incident_id', incidentId)
    .in('status', ['pending', 'held'])
    .maybeSingle();

  if (error) {
    console.error('Failed to check escrow status:', error);
    return false;
  }

  return !!data;
}

/**
 * Get platform revenue stats (admin only)
 */
export async function getPlatformRevenueStats(
  startDate?: string,
  endDate?: string
): Promise<{
  totalFees: number;
  totalVolume: number;
  successfulReturns: number;
  refundedAmount: number;
  error: Error | null;
}> {
  let query = supabase.from('escrow_transactions').select('*');

  if (startDate) {
    query = query.gte('created_at', startDate);
  }
  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query;

  if (error) {
    return {
      totalFees: 0,
      totalVolume: 0,
      successfulReturns: 0,
      refundedAmount: 0,
      error: new Error(error.message),
    };
  }

  const transactions = data as EscrowTransaction[];
  const totalFees = transactions.reduce((sum, t) => sum + t.platform_fee, 0);
  const totalVolume = transactions.reduce((sum, t) => sum + t.amount, 0);
  const successfulReturns = transactions.filter(t => t.status === 'released').length;
  const refundedAmount = transactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalFees,
    totalVolume,
    successfulReturns,
    refundedAmount,
    error: null,
  };
}
