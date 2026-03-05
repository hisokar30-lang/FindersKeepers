"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MessageSquare, Shield, Check } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/store/useStore";

interface ChatRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userId: string;
    itemId?: string;
}

export default function ChatRequestModal({ isOpen, onClose, userName, userId, itemId }: ChatRequestModalProps) {
    const { sendMessage } = useStore();
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    const handleSendRequest = async () => {
        setStatus('sending');
        try {
            await sendMessage(userId, "I'm reaching out regarding your listing. Protocol verification requested.", itemId);
            setStatus('sent');
            setTimeout(onClose, 2500);
        } catch (error) {
            console.error("Failed to initiate link:", error);
            setStatus('idle');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 text-white"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#0f172a]/90 backdrop-blur-2xl rounded-[32px] p-8 w-full max-w-md shadow-2xl relative overflow-hidden border border-white/10"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            <div className="text-center pt-4">
                                <div className="w-20 h-20 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-cyan-400 border border-cyan-500/20">
                                    {status === 'sent' ? <Check size={40} /> : <MessageSquare size={40} />}
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2 leading-tight">
                                    {status === 'sent' ? "Signal Transmitted" : "Initiate Secure Link"}
                                </h3>

                                <p className="text-sm text-slate-400 mb-8 px-4 font-medium leading-relaxed">
                                    {status === 'sent'
                                        ? `Protocol request sent to ${userName}. Initializing secure channel...`
                                        : `To maintain zero-knowledge privacy, ${userName} must authorize this uplink.`
                                    }
                                </p>

                                {status === 'idle' && (
                                    <div className="bg-white/5 rounded-2xl p-5 mb-8 text-left border border-white/10">
                                        <div className="flex gap-4">
                                            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                                                <Shield size={20} className="text-emerald-400 shrink-0" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-white uppercase tracking-wider">Encrypted Uplink</h4>
                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                    End-to-end protocol active. Peer-to-peer data remains outside public registries.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSendRequest}
                                    disabled={status !== 'idle'}
                                    className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform active:scale-95 disabled:opacity-50"
                                    style={{
                                        background: status === 'sent' ? "#10B981" : "var(--primary-brand)",
                                        color: status === 'sent' ? "white" : "black"
                                    }}
                                >
                                    {status === 'idle' && "Request Access"}
                                    {status === 'sending' && "Transmitting..."}
                                    {status === 'sent' && "Secure Link Sent"}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
