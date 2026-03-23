"use client";

import { motion } from "framer-motion";
import { DollarSign, Shield, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { EscrowStatus } from "@/lib/monetizationTypes";

interface EscrowStatusBadgeProps {
  status: EscrowStatus;
  amount?: number;
  className?: string;
}

const statusConfig: Record<
  EscrowStatus,
  { label: string; icon: React.ElementType; color: string; bgColor: string }
> = {
  pending: {
    label: "Payment Pending",
    icon: Clock,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  held: {
    label: "In Escrow",
    icon: Shield,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  released: {
    label: "Reward Claimed",
    icon: CheckCircle,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
  },
  refunded: {
    label: "Refunded",
    icon: DollarSign,
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
  },
  disputed: {
    label: "Under Review",
    icon: AlertCircle,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
};

export function EscrowStatusBadge({ status, amount, className = "" }: EscrowStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} border-current/20 ${config.color} ${className}`}
    >
      <Icon size={14} className={status === "held" ? "animate-pulse" : ""} />
      <span className="text-xs font-bold tracking-wide uppercase">{config.label}</span>
      {amount && status !== "refunded" && (
        <span className="text-xs font-medium">${amount.toFixed(2)}</span>
      )}
    </motion.div>
  );
}

export function RewardBadge({ amount, boosted = false }: { amount: number; boosted?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
        boosted
          ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
          : "bg-emerald-500/10 border border-emerald-500/20"
      }`}
    >
      <DollarSign size={14} className={boosted ? "text-amber-400" : "text-emerald-400"} />
      <span className={`text-sm font-bold ${boosted ? "text-amber-400" : "text-emerald-400"}`}>
        {amount.toFixed(0)}
      </span>
      {boosted && (
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider ml-1">
          Boosted
        </span>
      )}
    </motion.div>
  );
}

export function PriorityIndicator({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 200) return "text-amber-400";
    if (score >= 100) return "text-emerald-400";
    return "text-slate-400";
  };

  return (
    <div className="flex items-center gap-1" title={`Priority Score: ${score}`}>
      <div className={`w-2 h-2 rounded-full ${getColor().replace("text", "bg")} ${score >= 100 ? "animate-pulse" : ""}`} />
      <span className={`text-[10px] font-bold uppercase tracking-wider ${getColor()}`}>
        {score >= 200 ? "High Priority" : score >= 100 ? "Priority" : "Standard"}
      </span>
    </div>
  );
}
