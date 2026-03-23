"use client";

import { useStore } from "@/store/useStore";
import { Bell, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function Header({ title }: { title: string }) {
    const { currentUser } = useStore();

    if (!currentUser) return null;

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 sticky top-0 z-20 bg-[var(--bg-main)]/90 backdrop-blur-md py-4 -mx-6 px-6 md:-mx-10 md:px-10 border-b border-[var(--border-subtle)]">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                    {title}
                </h2>
                <p className="text-xs mt-1 font-medium text-[var(--text-secondary)]">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Link
                    href="/messages"
                    className="relative p-2.5 rounded-xl bg-white border border-[var(--border-subtle)] shadow-sm hover:bg-gray-50 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Messages"
                >
                    <MessageSquare size={20} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white bg-[var(--primary-brand)] animate-pulse" />
                </Link>
                <button
                    className="relative p-2.5 rounded-xl bg-white border border-[var(--border-subtle)] shadow-sm hover:bg-gray-50 transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white bg-[var(--status-lost)]" />
                </button>
                {/* XP & Level */}
                <div className="hidden md:flex items-center gap-3 mr-2 bg-[var(--primary-brand)]/5 border border-[var(--primary-brand)]/10 rounded-xl px-4 py-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-tighter text-[var(--primary-brand)] leading-none">{currentUser.rank || "Rookie Finder"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] leading-none mt-1">Lvl {currentUser.level || 1}</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[var(--primary-brand)] flex items-center justify-center text-black font-black text-xs shadow-[0_0_15px_rgba(204,255,0,0.2)] border border-[var(--primary-brand)]/50">
                        {currentUser.xp || 0}
                    </div>
                </div>

            </div>
        </header>
    );
}
