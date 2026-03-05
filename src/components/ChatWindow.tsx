"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageCircle, User as UserIcon, ShieldAlert, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import DisputeModal from "./DisputeModal";
import { User, Message } from "@/lib/types";

interface ChatWindowProps {
    recipientId: string;
    recipientName: string;
    recipientAvatar?: string;
    itemId?: string;
    onClose: () => void;
}

export default function ChatWindow({ recipientId, recipientName, recipientAvatar, itemId, onClose }: ChatWindowProps) {
    const { currentUser, messages, sendMessage, uploadChatPhoto, items } = useStore();
    const [newMessage, setNewMessage] = useState("");
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const relatedItem = itemId ? items.find(i => i.id === itemId) : null;

    // Filter messages between current user and recipient
    const chatMessages = messages.filter(
        (m) =>
            ((m.senderId === currentUser?.id && m.receiverId === recipientId) ||
                (m.senderId === recipientId && m.receiverId === currentUser?.id)) &&
            (!itemId || m.itemId === itemId)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSend = async (e?: React.FormEvent, imageUrl?: string) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !imageUrl) return;

        await sendMessage(recipientId, newMessage, itemId, imageUrl);
        setNewMessage("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const publicUrl = await uploadChatPhoto(file);
            if (publicUrl) {
                await handleSend(undefined, publicUrl);
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-[var(--border-subtle)] font-sans"
        >
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        {recipientAvatar ? (
                            <img src={recipientAvatar} alt={recipientName} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-brand)]/10 flex items-center justify-center border border-gray-100">
                                <UserIcon size={20} className="text-[var(--primary-brand)]" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">{recipientName}</h3>
                        {relatedItem ? (
                            <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-tight">Regarding: {relatedItem.title}</p>
                        ) : (
                            <p className="text-xs text-[var(--status-found)] font-medium">Active Session</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsDisputeOpen(true)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                        title="Flag Transaction"
                    >
                        <ShieldAlert size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <DisputeModal
                    isOpen={isDisputeOpen}
                    onClose={() => setIsDisputeOpen(false)}
                    recipientName={recipientName}
                />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-main)]">
                {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] text-sm">
                        <div className="w-16 h-16 rounded-full bg-[var(--bg-hover)] flex items-center justify-center mb-3">
                            <MessageCircle size={28} className="opacity-50" />
                        </div>
                        <p className="font-medium">No messages yet.</p>
                        <p className="text-xs mt-1">Say hello to {recipientName.split(' ')[0]}!</p>
                    </div>
                ) : (
                    chatMessages.map((msg) => {
                        const isMe = msg.senderId === currentUser?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl p-0.5 shadow-sm group relative ${isMe
                                        ? "bg-[var(--primary-brand)] text-white rounded-br-none"
                                        : "bg-white text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-bl-none"
                                        }`}
                                >
                                    {msg.imageUrl && (
                                        <div className="overflow-hidden rounded-xl bg-slate-100">
                                            <img src={msg.imageUrl} alt="Verification Evidence" className="max-w-full h-auto max-h-60 object-cover" />
                                            <div className="p-2 flex items-center gap-2 bg-black/5 text-[10px] uppercase font-bold tracking-wider">
                                                <CheckCircle2 size={12} className="text-cyan-400" />
                                                Verification Evidence
                                            </div>
                                        </div>
                                    )}
                                    <div className="px-4 py-3">
                                        <p className="text-sm font-medium">{msg.content}</p>
                                        <div className={`text-[10px] mt-1 text-right font-medium ${isMe ? "text-indigo-100" : "text-[var(--text-muted)]"}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-[var(--border-subtle)]">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*"
                />
                <div className="relative flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/5 rounded-xl transition-all border border-slate-100"
                        title="Share Verification Photo"
                        aria-label="Share Verification Photo"
                    >
                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Share proof or item details..."
                            className="w-full pl-4 pr-12 py-3.5 rounded-xl bg-[var(--bg-hover)] border-none focus:ring-2 focus:ring-[var(--primary-brand)]/20 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all outline-none font-medium"
                        />
                        <button
                            type="submit"
                            disabled={(!newMessage.trim() && !isUploading) || isUploading}
                            className="absolute right-2 top-1.5 p-2 bg-[var(--primary-brand)] text-white rounded-lg hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all shadow-md active:scale-95"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </form>
        </motion.div>
    );
}
