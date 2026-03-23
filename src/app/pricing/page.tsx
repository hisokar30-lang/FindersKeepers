"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function PricingPage() {
  const { currentUser } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tiers = [
    {
      name: "Free",
      tier: "free" as const,
      price: "$0",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Up to 5 active items",
        "30-day storage",
        "2 boosts per month",
        "Basic match alerts",
        "Community support"
      ]
    },
    {
      name: "Basic",
      tier: "basic" as const,
      price: "$9",
      monthlyPrice: 9,
      yearlyPrice: 90,
      features: [
        "Up to 50 active items",
        "90-day storage",
        "10 boosts per month",
        "Priority support",
        "Advanced analytics",
        "Custom branding"
      ]
    },
    {
      name: "Business",
      tier: "business" as const,
      price: "$29",
      monthlyPrice: 29,
      yearlyPrice: 290,
      features: [
        "Unlimited active items",
        "Unlimited storage",
        "Unlimited boosts",
        "API access",
        "White-label solution",
        "Dedicated account manager",
        "Priority feature requests"
      ]
    }
  ];

  const handleSubscribe = async (tier: "basic" | "business", interval: "monthly" | "yearly") => {
    if (!currentUser) {
      router.push("/login");
      return;
    }

    setLoading(tier);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          tier,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        window.location.href = `/api/stripe/checkout?session_id=${data.sessionId}`;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Protocol</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Unlock premium features to enhance your recovery operations and support the community.
            All plans include a 14-day free trial.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.tier}
              className={`rounded-2xl p-8 border transition-all ${
                tier.tier === "basic" || tier.tier === "business"
                  ? "bg-white/5 border-[var(--primary-brand)]/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">{tier.name}</h2>
                {tier.tier === "basic" && (
                  <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                    POPULAR
                  </span>
                )}
                {tier.tier === "business" && (
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs font-bold">
                    ENTERPRISE
                  </span>
                )}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                <span className="text-zinc-500">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check size={16} className="text-[var(--primary-brand)] mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (tier.tier === "basic") {
                    handleSubscribe("basic", "monthly");
                  } else if (tier.tier === "business") {
                    handleSubscribe("business", "monthly");
                  }
                }}
                disabled={loading === tier.tier || tier.tier === "free"}
                className={`w-full py-3 rounded-xl font-bold transition-all ${
                  tier.tier === "basic" || tier.tier === "business"
                    ? "bg-[var(--primary-brand)] text-black hover:bg-cyan-400"
                    : "bg-white/10 text-white hover:bg-white/20"
                } disabled:opacity-50`}
              >
                {loading === tier.tier ? "Processing..." : tier.tier === "free" ? "Current Plan" : "Subscribe Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
