"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
    {
        title: "Report Listing",
        description: "Post a lost or found item with precise geo-coordinates and descriptive metadata.",
        icon: Globe,
        color: "#A5A6FF"
    },
    {
        title: "AI Matching",
        description: "Our Geo-Intelligence engine automatically notifies you of proximity matches and relevant categories.",
        icon: Zap,
        color: "#818cf8"
    },
    {
        title: "Private Verification",
        description: "Secure chat allows finders and owners to verify item details through unique security questions.",
        icon: Lock,
        color: "#6366f1"
    },
    {
        title: "Community Trust",
        description: "Build reputation through verified successful returns and positive community feedback.",
        icon: ShieldCheck,
        color: "#6264F0"
    }
];

export default function HowItWorks() {
    return (
        <div className="bg-[var(--bg-main)] min-h-screen">
            {/* Header Section */}
            <section className="px-[8%] pt-20 pb-16 text-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[11px] font-bold tracking-[0.2em] text-[var(--primary-brand)] uppercase mb-4 block"
                >
                    The Protocol
                </motion.span>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-black mb-6 tracking-tighter text-gradient"
                >
                    How FindersKeepers Works
                </motion.h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    A decentralized approach to reuniting people with their belongings.
                    Built on transparency, security, and community trust.
                </p>
            </section>

            {/* Steps Grid */}
            <section className="px-[8%] py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 border border-white/5 hover:border-white/10 transition-all group"
                    >
                        <div
                            className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${step.color}22` }}
                        >
                            <step.icon size={24} style={{ color: step.color }} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                    </motion.div>
                ))}
            </section>

            {/* Policy Details */}
            <section className="px-[8%] py-24">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold text-white tracking-tight">The Reputation Protocol</h2>
                            <p className="text-slate-400 leading-relaxed">
                                Our platform is built on community goodwill. Users earn XP and Trust Score for every successful
                                return. These metrics help others identify the most reliable members of the network.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    "100% Free - No fees or commissions",
                                    "Automatic reputation building",
                                    "Anti-fraud verification",
                                    "24/7 Community support"
                                ].map((item) => (
                                    <li key={item} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                        <CheckCircle2 size={16} className="text-cyan-400" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="glass-card p-8 border border-[#6264F0]/20 bg-[#6264F0]/5 relative overflow-hidden group">
                            <div className="absolute -right-8 -bottom-8 opacity-10 transition-transform group-hover:scale-110">
                                <ShieldCheck size={160} color="#6264F0" />
                            </div>
                            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                <ShieldCheck size={18} className="text-[#A5A6FF]" />
                                Verified Returns
                            </h4>
                            <p className="text-sm text-slate-400 mb-6">
                                Your safety is our priority. We encourage all handovers to take place in public locations
                                and use our internal verification system to confirm item ownership.
                            </p>
                            <div className="pt-6 border-t border-white/5">
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Trust Metric</span>
                                <div className="text-xl font-mono text-white mt-1">Proof of Return = Global Trust Rank</div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5">
                        <h3 className="text-2xl font-bold text-white mb-8 text-center">Trust & Safety Guidelines</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: "Meet Safely", desc: "Always choose high-traffic, well-lit public locations for item handovers." },
                                { title: "Verify First", desc: "Use the 'Flag' feature in chat if a user provides suspicious verification answers." },
                                { title: "Protocol Only", desc: "Never exchange personal phone numbers until verification is complete." }
                            ].map((tip) => (
                                <div key={tip.title} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                                    <h4 className="text-sm font-bold text-white mb-2">{tip.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed">{tip.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
