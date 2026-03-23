"use client";

import ChatWindow from "@/components/ChatWindow";
import { useStore } from "@/store/useStore";
import { Message } from "@/lib/types";
import { useState, useMemo } from "react";
import { MessageCircle, User } from "lucide-react";
import Image from "next/image";

export default function MessagesPage() {
    const { currentUser, messages, users, items, fetchMessages } = useStore();
    const [selectedChat, setSelectedChat] = useState<{ partnerId: string; itemId?: string } | null>(null);

    useState(() => {
        if (currentUser) {
            fetchMessages();
        }
    });

    // Group messages by chat partner AND item
    const conversations = useMemo(() => {
        if (!currentUser) return [];

        const groups = new Map<string, Message[]>();

        messages.forEach(msg => {
            const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
            const groupKey = `${partnerId}-${msg.itemId || 'general'}`;

            if (!groups.has(groupKey)) {
                groups.set(groupKey, []);
            }
            groups.get(groupKey)?.push(msg);
        });

        return Array.from(groups.entries()).map(([key, groupMessages]) => {
            const [partnerId, itemId] = key.split('-');
            const partner = users.find(u => u.id === partnerId) || {
                id: partnerId,
                name: `User ${partnerId.substring(0, 5)}`,
                avatar: undefined
            };

            const item = items.find(i => i.id === itemId);
            const lastMessage = [...groupMessages].sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];

            return {
                partner,
                item,
                itemId: itemId === 'general' ? undefined : itemId,
                lastMessage,
            };
        }).sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
    }, [messages, currentUser, users, items]);

    if (!currentUser) return null;

    const selectedPartner = selectedChat ? users.find(u => u.id === selectedChat.partnerId) : null;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] font-sans text-white">
            <main className="px-[8%] py-12">
                <div className="glass-card rounded-[2.5rem] border border-white/10 overflow-hidden min-h-[700px] flex shadow-2xl">
                    {/* Sidebar: Chat List */}
                    <div className="w-[400px] border-r border-white/5 bg-slate-950/40 flex flex-col">
                        <div className="p-8 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-2xl tracking-tight text-white">Inbound</h3>
                                <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black text-cyan-400 uppercase tracking-widest">
                                    {conversations.length} Active
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {conversations.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                        <MessageCircle size={32} className="text-slate-600" />
                                    </div>
                                    <p className="text-slate-400 font-bold">No signal detected</p>
                                    <p className="text-xs text-slate-600 mt-2">Browse items to initiate protocol</p>
                                </div>
                            ) : (
                                conversations.map(({ partner, item, itemId, lastMessage }) => (
                                    <button
                                        key={`${partner.id}-${itemId || 'general'}`}
                                        onClick={() => setSelectedChat({ partnerId: partner.id, itemId })}
                                        className={`w-full p-6 flex items-start gap-4 transition-all text-left border-b border-white/[0.03] group ${selectedChat?.partnerId === partner.id && selectedChat?.itemId === itemId
                                            ? "bg-white/[0.07] shadow-[inset_4px_0_0_#22d3ee]"
                                            : "hover:bg-white/[0.04] border-l-4 border-l-transparent"
                                            }`}
                                    >
                                        <div className="relative shrink-0">
                                            {partner.avatar ? (
                                                <Image src={partner.avatar} alt={partner.name} width={56} height={56} className="w-14 h-14 rounded-2xl object-cover shadow-xl border border-white/10" unoptimized />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-white/10">
                                                    <User size={24} className="text-slate-600" />
                                                </div>
                                            )}
                                            {item && (
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                                                    <div className="text-[10px] font-black text-white">{item.type === 'lost' ? 'L' : 'F'}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="text-sm font-black truncate text-white group-hover:text-cyan-400 transition-colors">
                                                    {partner.name}
                                                </h4>
                                                <span className="text-[10px] text-slate-500 font-bold shrink-0">
                                                    {new Date(lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            {item && (
                                                <p className="text-[10px] font-black text-cyan-500/80 uppercase tracking-tighter mb-1 truncate">
                                                    Sub: {item.title}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-400 truncate font-medium leading-relaxed opacity-80">
                                                {lastMessage.senderId === currentUser.id && <span className="text-cyan-500/50 mr-1 font-black underline decoration-cyan-500/30 line-offset-2">SENT</span>}
                                                {lastMessage.content}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Area / Empty State */}
                    <div className="flex-1 bg-black/20 flex flex-col relative overflow-hidden">
                        {selectedChat ? (
                            <div className="h-full flex flex-col">
                                <div className="absolute inset-0 bg-[#0f172a] z-0 opacity-40" />
                                <div className="relative z-10 h-full">
                                    <ChatWindow
                                        recipientId={selectedChat.partnerId}
                                        recipientName={selectedPartner?.name || "Unknown"}
                                        recipientAvatar={selectedPartner?.avatar}
                                        itemId={selectedChat.itemId}
                                        onClose={() => setSelectedChat(null)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
                                <div className="text-center relative z-10 px-12">
                                    <div className="w-24 h-24 bg-white/[0.03] rounded-[2.5rem] border border-white/10 flex items-center justify-center mx-auto mb-8 shadow-2xl">
                                        <MessageCircle size={48} className="text-slate-800" />
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Portal Inbound</h2>
                                    <p className="text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                                        Secure high-bandwidth communication channel. All transmissions are end-to-end encrypted and purged after 7 planetary cycles.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
