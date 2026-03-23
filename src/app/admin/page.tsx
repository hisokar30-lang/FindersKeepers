"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Users,
    Package,
    Trash2,
    Shield,
    User,
} from "lucide-react";
import Image from "next/image";

type AdminTab = "items" | "users";

export default function AdminPage() {
    const { currentUser, items, users, removeItem, updateItemStatus, fetchItems } = useStore();
    const router = useRouter();
    const [tab, setTab] = useState<AdminTab>("items");

    useEffect(() => {
        if (!currentUser) router.push("/login");
        else if (currentUser.role !== "admin") router.push("/");
        fetchItems();
    }, [currentUser, router, fetchItems]);

    if (!currentUser || currentUser.role !== "admin") return null;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] font-sans text-white">
            {/* Navbar in RootLayout */}
            <main className="px-[8%] py-12">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-4xl font-bold mb-2">Admin Control</h2>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)]">
                            <Shield size={14} className="text-purple-400" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Authorized Access</span>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-10 bg-[rgba(255,255,255,0.03)] p-1.5 rounded-2xl w-fit border border-[rgba(255,255,255,0.05)]">
                    {([
                        { key: "items" as AdminTab, label: "Listings", icon: Package, count: items.length },
                        { key: "users" as AdminTab, label: "Users", icon: Users, count: users.length },
                    ]).map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${tab === t.key
                                ? "bg-[rgba(255,255,255,0.08)] text-white shadow-[0_4px_12px_rgba(34,211,238,0.1)]"
                                : "text-slate-500 hover:text-slate-300"
                                }`}
                        >
                            <t.icon size={16} />
                            {t.label}
                            <span
                                className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${tab === t.key ? "bg-[var(--primary-brand)] text-black" : "bg-[rgba(255,255,255,0.05)] text-slate-400"
                                    }`}
                            >
                                {t.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="glass-card rounded-[2rem] border border-[rgba(255,255,255,0.08)] overflow-hidden">
                    {tab === "items" ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)]">
                                    <tr>
                                        {["Type", "Details", "Status", "Actions"].map((h) => (
                                            <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                                    {items.map((item) => (
                                        <tr key={item.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${item.type === 'lost'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-[var(--primary-brand)]/10 text-[var(--primary-brand)] border-[var(--primary-brand)]/20'
                                                    }`}>
                                                    {item.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-white mb-0.5">{item.title}</p>
                                                <p className="text-xs text-slate-500">{item.category} • {item.locationName}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateItemStatus(item.id, e.target.value as 'Reported' | 'Found' | 'Resolved')}
                                                    className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none"
                                                >
                                                    <option value="Reported">Reported</option>
                                                    <option value="Found">Found</option>
                                                    <option value="Resolved">Resolved</option>
                                                </select>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex gap-2">
                                                    <button onClick={() => removeItem(item.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[rgba(255,255,255,0.02)] border-b border-[rgba(255,255,255,0.05)]">
                                    <tr>
                                        {["User", "Role", "Joined"].map((h) => (
                                            <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-[rgba(255,255,255,0.01)] transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <div className="w-10 h-10 rounded-full border border-white/10 relative overflow-hidden">
                                                            <Image
                                                                src={user.avatar}
                                                                alt={user.name || "User avatar"}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"><User size={20} /></div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-white mb-0.5">{user.name}</p>
                                                        <p className="text-xs text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-500">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
