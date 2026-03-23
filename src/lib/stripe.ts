// ============================================================
// STRIPE PAYMENT SERVICE
// Phase 1.3: Payment Integration
// Handles Stripe Connect and payment processing
// ============================================================

// Note: In production, these calls should go through API routes
// for security (never expose secret keys in client code)

import type {
  StripeConnectedAccount,
} from './monetizationTypes';
import { calculatePaymentSummary } from './escrow';

// Stripe configuration
const STRIPE_API_URL = '/api/stripe'; // API route base

/**
 * Interface for Stripe API responses
 */
interface StripeAPIResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

/**
 * Create a payment intent for reward deposit
 * This holds the reward amount + platform fee
 */
export async function createRewardPaymentIntent(
  incidentId: string,
  rewardAmount: number
): Promise<StripeAPIResponse<{ clientSecret: string; paymentIntentId: string }>> {
  const summary = calculatePaymentSummary(rewardAmount);

  try {
    const response = await fetch(`${STRIPE_API_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId,
        amount: summary.totalCharge, // Charge includes fee
        rewardAmount, // Store for reference
        platformFee: summary.platformFee,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Confirm payment and hold in escrow
 */
export async function confirmRewardPayment(
  paymentIntentId: string,
  incidentId: string
): Promise<StripeAPIResponse<{ success: boolean; escrowId: string }>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/confirm-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentIntentId,
        incidentId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to confirm payment');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Create Stripe Connected account for finder payouts
 */
export async function createConnectedAccount(
  userId: string,
  email: string
): Promise<StripeAPIResponse<{ accountId: string; onboardingUrl: string }>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-connected-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create connected account');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Get connected account status
 */
export async function getConnectedAccountStatus(
  accountId: string
): Promise<StripeAPIResponse<StripeConnectedAccount>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/account-status?accountId=${accountId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get account status');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Transfer funds to finder (payout)
 */
export async function payoutToFinder(
  escrowId: string,
  connectedAccountId: string,
  amount: number
): Promise<StripeAPIResponse<{ transferId: string; success: boolean }>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/payout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escrowId,
        connectedAccountId,
        amount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process payout');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Create Stripe Checkout session for subscription
 */
export async function createSubscriptionCheckout(
  userId: string,
  tier: 'basic' | 'business',
  interval: 'monthly' | 'yearly' = 'monthly'
): Promise<StripeAPIResponse<{ sessionId: string; url: string }>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        tier,
        interval,
        successUrl: typeof window !== 'undefined' ? `${window.location.origin}/profile/billing?success=true` : '/profile/billing?success=true',
        cancelUrl: typeof window !== 'undefined' ? `${window.location.origin}/pricing?canceled=true` : '/pricing?canceled=true',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Create Stripe Customer Portal session
 */
export async function createCustomerPortalSession(
  customerId: string,
  returnUrl?: string
): Promise<StripeAPIResponse<{ url: string }>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, returnUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create portal session');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Purchase item boost
 */
export async function purchaseBoost(
  incidentId: string,
  hours: number
): Promise<StripeAPIResponse<{ clientSecret: string; boostId: string }>> {
  const boostPrice = hours * 2.99; // $2.99 per hour of boost

  try {
    const response = await fetch(`${STRIPE_API_URL}/purchase-boost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incidentId,
        hours,
        amount: boostPrice,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to purchase boost');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

/**
 * Request refund for unrewarded item
 */
export async function requestRefund(
  escrowId: string,
  reason: string
): Promise<StripeAPIResponse<{ refundId: string; status: string }>> {
  try {
    const response = await fetch(`${STRIPE_API_URL}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        escrowId,
        reason,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process refund');
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    };
  }
}

// ============================================================
// WEBHOOK HANDLERS (Server-side only)
// These would be implemented in API routes
// ============================================================

/**
 * Example webhook handler structure
 * Place this in: src/app/api/stripe/webhook/route.ts
 * 
 * export async function POST(req: Request) {
 *   const payload = await req.text();
 *   const sig = req.headers.get('stripe-signature');
 *   
 *   // Verify webhook signature
 *   // Handle events:
 *   // - payment_intent.succeeded -> Hold in escrow
 *   // - payment_intent.payment_failed -> Notify user
 *   // - transfer.paid -> Payout to finder complete
 *   // - customer.subscription.created/updated/canceled -> Update DB
 *   // - invoice.payment_succeeded -> Renew subscription
 * }
 */

/**
 * Stripe event types we handle
 */
export type StripeWebhookEvent =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'transfer.paid'
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
  | 'account.updated'; // Connected account

// ============================================================
// ERROR HANDLING
// ============================================================

export class StripeError extends Error {
  constructor(
    message: string,
    public code: string,
    public type: 'payment' | 'payout' | 'subscription' | 'webhook'
  ) {
    super(message);
    this.name = 'StripeError';
  }
}

/**
 * Map Stripe error codes to user-friendly messages
 */
export function getStripeErrorMessage(error: { code?: string; message: string }): string {
  const errorMessages: Record<string, string> = {
    'card_declined': 'Your card was declined. Please try a different payment method.',
    'insufficient_funds': 'Your card has insufficient funds.',
    'expired_card': 'Your card has expired.',
    'incorrect_cvc': 'Your card security code is incorrect.',
    'processing_error': 'An error occurred while processing your payment. Please try again.',
    'requires_action': 'Additional authentication required. Please complete the verification.',
    'authentication_required': 'Your bank requires additional verification.',
  };

  return errorMessages[error.code || ''] || error.message || 'An unexpected error occurred.';
}

