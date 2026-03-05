"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Award, MapPin, Camera, Upload, ArrowLeft, CheckCircle2, History, ExternalLink, Trash2, X, Package, Settings2 } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import ReportForm from "@/components/ReportForm";
import { Item } from "@/lib/types";
import { ImageUploader } from "@/components/ImageUploader";

export default function ProfilePage() {
    const { currentUser, logout, updateProfile } = useStore();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [name, setName] = useState(currentUser?.name || "");

    if (!currentUser) {
        router.push("/login");
        return null;
    }

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    const [isUploading, setIsUploading] = useState(false);

    const handleSave = () => {
        updateProfile({ name });
        setIsProfileEditing(false);
    };

    const statCardStyle = {
        background: "rgba(255,255,255,0.03)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(10px)",
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition-colors">
                        <ArrowLeft size={24} className="text-zinc-400" />
                    </Link>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                </div>

                {/* Main Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-3xl p-8 shadow-2xl"
                    style={{
                        background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                        border: "1px solid rgba(255,255,255,0.08)"
                    }}
                >
                    <div className="absolute top-0 right-0 p-32 bg-[var(--neon-green)] opacity-[0.03] blur-3xl rounded-full" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar Section */}
                        <div className="relative group">
                            <div className={`w-32 h-32 rounded-full border-4 border-[#00f2fe]/30 overflow-hidden relative ${isUploading ? 'opacity-50' : ''}`}>
                                <Image
                                    src={currentUser?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00f2fe]"></div>
                                    </div>
                                )}
                            </div>

                            <div className="absolute -bottom-2 -right-2 scale-75 origin-bottom-right">
                                <ImageUploader
                                    onUploadSuccess={(url: string) => {
                                        setIsUploading(true);
                                        updateProfile({ avatar: url });
                                        setIsUploading(false);
                                    }}
                                    label="Edit"
                                />
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="flex-1 text-center md:text-left space-y-3">
                            {isProfileEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-transparent border-b border-white/20 text-2xl font-bold px-1 py-0.5 focus:outline-none focus:border-[var(--neon-green)] text-white"
                                        autoFocus
                                    />
                                    <button onClick={handleSave} className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors">Save</button>
                                </div>
                            ) : (
                                <h2 className="text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-3 group">
                                    {currentUser.name}
                                    <button onClick={() => setIsProfileEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-zinc-500 font-normal border border-white/10 px-2 py-1 rounded-full hover:bg-white/5 transition-colors">Edit</span>
                                    </button>
                                </h2>
                            )}

                            <p className="text-zinc-400 flex items-center justify-center md:justify-start gap-2 text-sm">
                                <Mail size={14} className="text-zinc-500" /> {currentUser.email}
                            </p>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                                <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-[rgba(204,255,0,0.1)] text-[var(--neon-green)] border border-[rgba(204,255,0,0.2)]">
                                    Trust Score: {currentUser.trustScore}
                                </span>
                                {currentUser.trustScore >= 90 && (
                                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1.5 shadow-lg shadow-blue-500/5">
                                        <CheckCircle2 size={12} />
                                        Verified Hero
                                    </span>
                                )}
                                {currentUser.itemsFound >= 3 && (
                                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1.5 shadow-lg shadow-purple-500/5">
                                        <Award size={12} />
                                        Swift Returner
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Protocol Standing</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-400">Trust Rating</span>
                                <span className="text-sm font-bold text-white">Elite</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-[var(--neon-green)] w-[100%]" />
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Community Vetting</h4>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-400">Response Rate</span>
                                <span className="text-sm font-bold text-white">Fast</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-cyan-400 w-[95%]" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-2xl flex flex-col items-center justify-center gap-2"
                        style={statCardStyle}
                    >
                        <div className="p-3 rounded-full bg-orange-500/10 text-orange-400">
                            <MapPin size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white">{currentUser.itemsReported}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Items Reported</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="p-6 rounded-2xl flex flex-col items-center justify-center gap-2"
                        style={statCardStyle}
                    >
                        <div className="p-3 rounded-full bg-green-500/10 text-green-400">
                            <Award size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white">{currentUser.itemsFound}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Items Found</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -5 }}
                        className="col-span-2 md:col-span-1 p-6 rounded-2xl flex flex-col items-center justify-center gap-2"
                        style={statCardStyle}
                    >
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-400">
                            <Upload size={24} />
                        </div>
                        <span className="text-2xl font-bold text-white">{currentUser.itemsReported + currentUser.itemsFound}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Impact</span>
                    </motion.div>
                </div>

                {/* My Items Management Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Package size={16} />
                            <h3 className="text-sm font-bold uppercase tracking-wider">My Protocol Reports</h3>
                        </div>
                        <span className="text-[10px] text-zinc-500 bg-white/5 px-2 py-1 rounded-full uppercase tracking-tighter">
                            Active Ops
                        </span>
                    </div>

                    <div className="space-y-3">
                        {useStore.getState().items.filter(i => i.userId === currentUser.id).length === 0 ? (
                            <div className="p-12 rounded-3xl border border-dashed border-white/10 text-center space-y-3 bg-white/[0.01]">
                                <p className="text-zinc-500 text-sm italic">No reports filed in terminal.</p>
                                <Link href="/report" className="inline-block text-xs text-[var(--neon-green)] hover:underline font-bold">
                                    File new report →
                                </Link>
                            </div>
                        ) : (
                            useStore.getState().items
                                .filter(i => i.userId === currentUser.id)
                                .map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.04] transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-zinc-900 flex-shrink-0 relative">
                                                {item.photoUrl ? (
                                                    <Image src={item.photoUrl} alt={item.title} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                                        <Camera size={16} />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white leading-tight">{item.title}</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter ${item.type === 'lost' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-500">• {new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Bar */}
                                        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setEditingItem(item)}
                                                className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                                                title="Full Protocol Edit"
                                            >
                                                <Settings2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const status: any = item.status === 'Resolved' ? 'Reported' : 'Resolved';
                                                    useStore.getState().updateItemStatus(item.id, status);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${item.status === 'Resolved'
                                                    ? 'bg-[var(--neon-green)]/20 text-[var(--neon-green)]'
                                                    : 'bg-white/5 text-zinc-400 hover:text-white'
                                                    }`}
                                            >
                                                {item.status === 'Resolved' ? 'Completed' : 'Mark Resolved'}
                                            </button>
                                            <div className="w-[1px] h-4 bg-white/10 mx-1" />
                                            <button
                                                onClick={() => {
                                                    if (confirm("Permanently delete this report? This cannot be undone.")) {
                                                        useStore.getState().removeItem(item.id);
                                                    }
                                                }}
                                                className="p-2 rounded-lg bg-red-500/5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Delete Report"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                        )}
                    </div>
                </div>

                {/* Account Actions */}
                <div className="pt-8 border-t border-white/5 space-y-6">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 opacity-50">Support & Feedback</h3>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                            <p className="text-xs text-zinc-400 leading-relaxed italic">
                                Found an issue or want to support the protocol developer? Reach out directly via encrypted mail.
                            </p>
                            <a
                                href="mailto:hisokar30@gmail.com"
                                className="flex items-center gap-3 text-sm font-bold text-[var(--neon-green)] hover:brightness-110 transition-all group"
                            >
                                <Mail size={16} />
                                hisokar30@gmail.com
                                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 opacity-50">Account Configuration</h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-between group"
                            >
                                <span className="font-bold text-sm">Terminate Session</span>
                                <ArrowLeft size={16} className="rotate-180 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Edit Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditingItem(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl p-6 md:p-10 custom-scrollbar"
                        >
                            <div className="flex items-center justify-between mb-8 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md pb-4 z-10">
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                        <Settings2 className="text-[var(--neon-green)]" size={20} />
                                        Protocol Identification
                                    </h2>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Modify security clearance data</p>
                                </div>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="p-3 rounded-full bg-white/5 text-zinc-400 hover:text-white transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <ReportForm
                                initialData={editingItem || undefined}
                                onCancel={() => setEditingItem(null)}
                                onSuccess={() => setEditingItem(null)}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
