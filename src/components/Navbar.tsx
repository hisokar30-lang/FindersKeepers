"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { Search } from "lucide-react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";

export default function Navbar() {
    const { currentUser, searchQuery, setSearchQuery } = useStore();
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "/" && (e.target as HTMLElement).tagName !== "INPUT" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <nav className="flex items-center h-14 px-6 lg:px-[5%] backdrop-blur-xl bg-[var(--bg-nav)] border-b border-[var(--border-subtle)] sticky top-0 z-50">
            {/* Logo */}
            <div className="flex-shrink-0 mr-8">
                <Link href="/" className="text-lg font-black tracking-tighter transition-all group">
                    <span className="bg-gradient-to-l from-[#A5A6FF] to-[#6264F0] bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(165,166,255,0.3)]">
                        FindersKeepers
                    </span>
                </Link>
            </div>

            {/* Global Search Bar (OpenRouter Style) */}
            <div className="hidden md:flex flex-1 max-w-sm relative group">
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Search size={14} className="text-slate-500 group-focus-within:text-[var(--primary-brand)] transition-colors" />
                </div>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-9 pr-10 py-1.5 bg-white/[0.02] border border-white/[0.05] rounded-md text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[var(--primary-brand)]/30 focus:border-[var(--primary-brand)]/50 focus:bg-white/[0.04] transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                    {searchQuery ? (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="p-1 rounded-md hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={12} />
                        </button>
                    ) : (
                        <span className="px-1 py-0.5 rounded border border-white/[0.05] text-[9px] font-mono text-slate-600 bg-white/[0.01]">/</span>
                    )}
                </div>
            </div>

            {/* Navigation Links & Actions */}
            <div className="flex items-center gap-1 ml-auto">
                <ul className="flex gap-1 items-center list-none p-0 m-0 mr-4">
                    <li>
                        <Link href="/" className="nav-item">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/browse" className="nav-item">
                            Browse
                        </Link>
                    </li>
                    <li>
                        <Link href="/map" className="nav-item">
                            Intelligence
                        </Link>
                    </li>
                    <li>
                        <Link href="/how-it-works" className="nav-item">
                            Protocol
                        </Link>
                    </li>
                </ul>

                <Link href="/report" className="btn-primary" style={{ backgroundImage: "var(--gitogradiant)", color: "#161618" }}>
                    Post Item
                </Link>


                <div className="h-4 w-[1px] bg-white/10 mx-2 hidden sm:block" />

                {currentUser ? (
                    <div className="flex items-center gap-3">
                        <Link href="/profile" className="flex items-center gap-2.5 p-1 px-2.5 rounded-full border border-white/5 bg-white/5 hover:border-[var(--primary-brand)]/50 transition-all relative group">
                            <div className="relative">
                                <Image
                                    src={currentUser.avatar || '/default-avatar.png'}
                                    alt="Profile"
                                    width={28}
                                    height={28}
                                    className="w-7 h-7 rounded-full object-cover"
                                    unoptimized
                                />
                            </div>
                            <span className="text-[10px] font-bold tracking-widest uppercase hidden lg:block text-white/60">
                                {currentUser.name.split(' ')[0]}
                            </span>
                        </Link>
                    </div>
                ) : (
                    <Link href="/login" className="nav-item">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}
