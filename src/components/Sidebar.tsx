"use client";

import { useStore } from "@/store/useStore";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    Map,
    Search,
    Shield,
    LogOut,
    Menu,
    X,
    Plus,
    LayoutDashboard,
    MessageCircle,
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Browse Items", href: "/browse", icon: Search },
    { label: "Report Item", href: "/report", icon: Plus },
    { label: "Map View", href: "/map", icon: Map },
    { label: "Messages", href: "/messages", icon: MessageCircle },
];

const ADMIN_ITEMS = [
    { label: "Admin Panel", href: "/admin", icon: Shield },
];

export default function Sidebar() {
    const { currentUser, logout, sidebarOpen, toggleSidebar } = useStore();
    const pathname = usePathname();
    const router = useRouter();

    if (!currentUser) return null;

    const allItems = [
        ...NAV_ITEMS,
        ...(currentUser.role === "admin" ? ADMIN_ITEMS : []),
    ];

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md md:hidden hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
            >
                {sidebarOpen ? <X size={20} className="text-gray-900" /> : <Menu size={20} className="text-gray-900" />}
            </button>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ x: sidebarOpen ? 0 : -280 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] z-40 bg-[var(--bg-sidebar)] flex flex-col border-r border-[var(--border-subtle)] shadow-xl md:shadow-none"
            >
                {/* Logo */}
                <div className="p-6 flex items-center gap-3 border-b border-[var(--border-subtle)]">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-sm bg-gradient-to-br from-[var(--primary-brand)] to-[var(--accent-secondary)]">
                        FK
                    </div>
                    <div>
                        <h1 className="font-bold text-base tracking-tight text-[var(--text-primary)]">
                            FindersKeepers
                        </h1>
                        <p className="text-[11px] font-medium text-[var(--text-muted)]">
                            Community Platform
                        </p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {allItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => {
                                    router.push(item.href);
                                    if (window.innerWidth < 768) toggleSidebar();
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 group relative overflow-hidden ${isActive
                                        ? "bg-[var(--primary-brand)] text-white shadow-md shadow-indigo-200"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                                    }`}
                            >
                                <item.icon size={18} className={isActive ? "text-white" : "group-hover:text-[var(--primary-brand)] transition-colors"} />
                                <span className={isActive ? "font-semibold" : "font-medium"}>{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* User info */}
                <div className="p-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-gray-50 border border-[var(--border-subtle)]">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm bg-gradient-to-br from-[var(--primary-brand)] to-[var(--accent-secondary)]">
                            {currentUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-[var(--text-primary)]">
                                {currentUser.name}
                            </p>
                            <p className="text-[11px] truncate text-[var(--text-muted)]">
                                {currentUser.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push("/login"); }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            </motion.aside>
        </>
    );
}
