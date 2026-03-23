import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', errorMessage);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log('Processing Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePayment(invoice);
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleConnectedAccountUpdate(account);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { incident_id, user_id, reward_amount, platform_fee } = paymentIntent.metadata;

  if (!incident_id || paymentIntent.metadata.type !== 'reward_deposit') {
    return;
  }

  const { data: existingEscrow } = await supabaseAdmin
    .from('escrow_transactions')
    .select('id')
    .eq('payment_intent_id', paymentIntent.id)
    .maybeSingle();

  if (existingEscrow) {
    await supabaseAdmin
      .from('escrow_transactions')
      .update({
        status: 'held',
        held_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq('id', existingEscrow.id);
  } else {
    await supabaseAdmin.from('escrow_transactions').insert({
      incident_id,
      owner_id: user_id,
      amount: parseFloat(reward_amount || '0'),
      platform_fee: parseFloat(platform_fee || '0'),
      net_amount: parseFloat(reward_amount || '0'),
      status: 'held',
      payment_provider: 'stripe',
      payment_intent_id: paymentIntent.id,
      held_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  await supabaseAdmin
    .from('incidents')
    .update({
      reward_enabled: true,
      reward_amount: parseFloat(reward_amount || '0'),
    })
    .eq('id', incident_id);

  await supabaseAdmin.from('notifications').insert({
    user_id: user_id,
    type: 'reward_activated',
    title: 'Reward Activated',
    message: `Your $${reward_amount} reward is now held in escrow and active.`,
    data: { incident_id, amount: reward_amount },
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { user_id, incident_id } = paymentIntent.metadata;

  if (!user_id) return;

  await supabaseAdmin.from('notifications').insert({
    user_id: user_id,
    type: 'payment_failed',
    title: 'Payment Failed',
    message: 'Your reward payment could not be processed. Please try again.',
    data: { incident_id },
  });
}

async function handlePayoutSuccess(transfer: Stripe.Transfer) {
  const { escrow_id } = transfer.metadata;

  if (!escrow_id) return;

  await supabaseAdmin
    .from('escrow_transactions')
    .update({
      status: 'released',
      released_at: new Date().toISOString(),
      payout_transfer_id: transfer.id,
    })
    .eq('id', escrow_id);
}

async function handleSubscriptionUpdate(stripeSubscription: Stripe.Subscription) {
  const customerId = stripeSubscription.customer as string;

  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId);

  if (!users || users.length === 0) return;

  const userId = users[0].id;
  const tier = stripeSubscription.metadata?.tier || 'basic';
  const status = stripeSubscription.status === 'active' ? 'active' : stripeSubscription.status;

  const { data: existingSub } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const currentPeriodStart = (stripeSubscription as any).current_period_start;
  const currentPeriodEnd = (stripeSubscription as any).current_period_end;

  const subscriptionData = {
    user_id: userId,
    tier,
    stripe_customer_id: customerId,
    stripe_subscription_id: stripeSubscription.id,
    stripe_price_id: stripeSubscription.items.data[0]?.price?.id,
    current_period_start: currentPeriodStart ? new Date(currentPeriodStart * 1000).toISOString() : null,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    status,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
  };

  if (existingSub) {
    await supabaseAdmin
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSub.id);
  } else {
    await supabaseAdmin.from('subscriptions').insert(subscriptionData);
  }
}

async function handleSubscriptionCancellation(stripeSubscription: Stripe.Subscription) {
  const { data: subscription } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', stripeSubscription.id)
    .single();

  if (subscription) {
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);
  }
}

async function handleInvoicePayment(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId);

  if (!users || users.length === 0) return;

  await supabaseAdmin
    .from('subscriptions')
    .update({
      items_used_this_period: 0,
      boosts_used_this_period: 0,
    })
    .eq('user_id', users[0].id);
}

async function handleConnectedAccountUpdate(account: Stripe.Account) {
  const { data: users } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('stripe_connected_account_id', account.id);

  if (!users || users.length === 0) return;

  await supabaseAdmin
    .from('profiles')
    .update({
      stripe_account_charges_enabled: account.charges_enabled,
      stripe_account_payouts_enabled: account.payouts_enabled,
      stripe_account_status: account.charges_enabled ? 'verified' : 'pending',
    })
    .eq('id', users[0].id);
}
