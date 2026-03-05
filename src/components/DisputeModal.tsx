"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, ShieldAlert, CheckCircle2, MessageSquare } from "lucide-react";
import { useState } from "react";

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipientName: string;
}

const DISPUTE_REASONS = [
    "Item not as described",
    "User unreachable / Unresponsive",
    "Fraudulent matching claim",
    "Harassment / Policy violation",
    "False ownership claim"
];

export default function DisputeModal({ isOpen, onClose, recipientName }: DisputeModalProps) {
    const [step, setStep] = useState<"reason" | "submitted">("reason");
    const [selectedReason, setSelectedReason] = useState<string | null>(null);

    const handleSubmit = () => {
        if (!selectedReason) return;
        setStep("submitted");
        // In a real app, this would send an event to Supabase
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-[#020617] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {step === "reason" ? (
                        <>
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                        <ShieldAlert size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Report an Issue</h3>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Community Support</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 text-orange-200 text-xs leading-relaxed">
                                    <AlertCircle size={14} className="inline mr-2 text-orange-400" />
                                    You are reporting an issue with your interaction with <strong>{recipientName}</strong>.
                                    A community moderator will review the case within 24 hours.
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 block">Reason for Dispute</label>
                                    {DISPUTE_REASONS.map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => setSelectedReason(reason)}
                                            className={`w-full text-left p-4 rounded-xl text-sm font-medium transition-all border ${selectedReason === reason
                                                ? "bg-white/[0.08] border-white/20 text-white shadow-lg"
                                                : "bg-white/[0.02] border-white/5 text-slate-400 hover:bg-white/[0.04] hover:border-white/10"
                                                }`}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedReason}
                                    className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold transition-all shadow-xl shadow-red-900/20"
                                >
                                    Submit Formal Dispute
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 mx-auto"
                            >
                                <CheckCircle2 size={40} />
                            </motion.div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Dispute Received</h3>
                                <p className="text-sm text-slate-400">
                                    Case #FK-{Math.floor(Math.random() * 100000)} has been opened.
                                    Our protocol intelligence team will review your chat logs within 24 hours.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
                            >
                                Back to Chat
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
