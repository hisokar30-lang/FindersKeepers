// ============================================================
// STRIPE API ROUTES - Server-side handlers
// Phase 1.3: Payment Integration
// Place in: src/app/api/stripe/create-payment-intent/route.ts
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Initialize Stripe (server-side only)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * POST /api/stripe/create-payment-intent
 * Create a PaymentIntent for reward deposit
 */
export async function POST(req: Request) {
  try {
    const { incidentId, amount, rewardAmount, platformFee } = await req.json();

    // Validate inputs
    if (!incidentId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount or incident ID' },
        { status: 400 }
      );
    }

    // Get user session
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Verify user owns this incident
    const { data: incident, error: incidentError } = await supabaseAdmin
      .from('incidents')
      .select('reporter_id')
      .eq('id', incidentId)
      .single();

    if (incidentError || !incident || incident.reporter_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized for this incident' },
        { status: 403 }
      );
    }

    // Create or get Stripe customer
    let customerId = user.user_metadata?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;

      // Store customer ID in user metadata
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { stripe_customer_id: customerId },
      });
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      customer: customerId,
      automatic_payment_methods: { enabled: true },
      metadata: {
        incident_id: incidentId,
        user_id: user.id,
        reward_amount: rewardAmount,
        platform_fee: platformFee,
        type: 'reward_deposit',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: unknown) {
    console.error('Stripe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
