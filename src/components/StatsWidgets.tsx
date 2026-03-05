"use client";

import { motion } from "framer-motion";
import { TrendingUp, Shield, Package, Zap } from "lucide-react";

interface StatProps {
    label: string;
    value: string;
    change?: string;
    icon: React.ReactNode;
}

function StatWidget({ label, value, change, icon }: StatProps) {
    return (
        <motion.div
            className="glass-card rounded-2xl p-5 flex flex-col gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</p>
                <div className="p-2 rounded-lg bg-white/5 text-zinc-400">{icon}</div>
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            {change && (
                <p className="text-xs font-semibold text-[#CCFF00] flex items-center gap-1">
                    <TrendingUp size={12} /> {change}
                </p>
            )}
        </motion.div>
    );
}

export default function StatsWidgets() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatWidget
                label="Community Impact"
                value="1,240"
                change="↑ 12% vs last week"
                icon={<Zap size={16} />}
            />
            <StatWidget
                label="Trust Score"
                value="982"
                change="Top 2% in your area"
                icon={<Shield size={16} />}
            />
            <StatWidget
                label="Active Items"
                value="7"
                icon={<Package size={16} />}
            />
        </div>
    );
}
