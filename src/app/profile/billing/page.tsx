"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { cancelSubscription as cancelSub, reactivateSubscription as reactivateSub, createCustomerPortalSession, getUserSubscription } from "@/lib/subscriptions";
import { RefreshCw, CreditCard, CheckCircle, XCircle } from "lucide-react";

import type { Subscription } from "@/lib/monetizationTypes";

export default function BillingPage() {
  const { currentUser } = useStore();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubscription = async () => {
    if (!currentUser) return;
    try {
      const { subscription: sub, error: fetchError } = await getUserSubscription(currentUser.id);
      if (fetchError) throw fetchError;
      setSubscription(sub);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription';
      setError(errorMessage);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    loadSubscription();
  }, [currentUser, router]);

  const handleCancel = async () => {
    if (!subscription?.id) return;
    setLoading(true);
    const { error } = await cancelSub(subscription.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      loadSubscription();
    }
  };

  const handleReactivate = async () => {
    if (!subscription?.id) return;
    setLoading(true);
    const { error } = await reactivateSub(subscription.id);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      loadSubscription();
    }
  };

  const handlePortal = async () => {
    if (!subscription?.stripe_customer_id) return;
    setLoading(true);
    const { url, error } = await createCustomerPortalSession(
      subscription.stripe_customer_id,
      window.location.href
    );
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (url) {
      window.location.href = url;
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Billing & Subscription</h1>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400">
            {error}
          </div>
        )}

        {subscription ? (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white capitalize">{subscription.tier} Plan</h2>
                  <p className="text-sm text-zinc-400">
                    Status: <span className={`font-bold ${subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>{subscription.status}</span>
                  </p>
                </div>
                <div className="text-right">
                  {subscription.cancel_at_period_end ? (
                    <div className="flex items-center gap-1 text-yellow-400 text-sm">
                      <XCircle size={16} />
                      Cancels at period end
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle size={16} />
                      Active
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Current Period</p>
                  <p className="text-sm text-white">
                    {subscription.current_period_start ? new Date(subscription.current_period_start).toLocaleDateString() : 'N/A'} – {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Usage This Period</p>
                  <p className="text-sm text-white">
                    {subscription.items_used_this_period} items • {subscription.boosts_used_this_period} boosts
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {subscription.status === 'active' && !subscription.cancel_at_period_end && (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Cancel Subscription
                  </button>
                )}
                {subscription.status === 'active' && subscription.cancel_at_period_end && (
                  <button
                    onClick={handleReactivate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={16} />
                    Reactivate
                  </button>
                )}
                {subscription.stripe_customer_id && (
                  <button
                    onClick={handlePortal}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
                  >
                    <CreditCard size={16} />
                    Payment Methods
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 rounded-2xl border border-dashed border-white/10 text-center">
            <p className="text-zinc-500 mb-4">No active subscription found.</p>
            <button
              onClick={() => router.push("/pricing")}
              className="px-6 py-2 rounded-xl bg-[var(--primary-brand)] text-black font-bold"
            >
              View Plans
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
