"use client";

import { useStore } from "@/store/useStore";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    MapPin,
    Calendar,
    ChevronLeft,
    ShieldCheck,
    Crown,
    Sparkles,
    MessageSquare,
    Flag,
    Tag,
    User as UserIcon,
    AlertCircle
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useMatching, type MatchResult } from "@/hooks/useMatching";
import { formatTimeAgo } from "@/lib/timeUtils";
import ChatRequestModal from "@/components/ChatRequestModal";

export default function ItemDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { items, matches: storeMatches } = useStore();
    const [item, setItem] = useState(items.find(i => i.id === id));
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const potentialMatches = useMatching(item || null);

    // In case items aren't loaded or id changes
    useEffect(() => {
        const found = items.find(i => i.id === id);
        if (found) setTimeout(() => setItem(found), 0);
    }, [id, items]);

    if (!item) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
                <div className="text-center space-y-4">
                    <AlertCircle size={48} className="mx-auto text-slate-500 animate-pulse" />
                    <h2 className="text-2xl font-bold text-white">Protocol Item Not Found</h2>
                    <p className="text-slate-400">The requested intelligence packet does not exist or has been archived.</p>
                    <button
                        onClick={() => router.push('/browse')}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
                    >
                        Return to Discovery
                    </button>
                </div>
            </div>
        );
    }

    const isBoosted = item.isBoosted;
    const hasMatch = storeMatches.some(m => m.itemId1 === item.id || m.itemId2 === item.id);

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-white font-sans selection:bg-[var(--primary-brand)]/30">
            <main className="max-w-[1200px] mx-auto px-6 py-12">

                {/* Navigation Header */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
                >
                    <div className="p-2 rounded-full bg-white/5 border border-white/5 group-hover:border-white/10 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Registry</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Image & Basic Info */}
                    <div className="lg:col-span-7 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`relative aspect-[4/3] rounded-[32px] overflow-hidden border backdrop-blur-3xl transition-all duration-500 ${isBoosted ? "border-yellow-500/30 shadow-[0_20px_40px_rgba(234,179,8,0.1)]" : "border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                }`}
                        >
                            {'photoUrl' in item && item.photoUrl ? (
                                <Image
                                    src={item.photoUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-slate-500 space-y-4">
                                    <AlertCircle size={64} />
                                    <span className="font-bold uppercase tracking-widest text-xs">No Visual Reference Available</span>
                                </div>
                            )}

                            {/* Priority Overlay */}
                            {isBoosted && (
                                <div className="absolute top-6 left-6 z-10 bg-yellow-500 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,1)] flex items-center gap-2 border border-yellow-200/50">
                                    <Sparkles size={12} fill="currentColor" />
                                    Priority Status Active
                                </div>
                            )}

                            {/* Type Badge */}
                            <div className={`absolute bottom-6 right-6 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-md border ${item.type === 'lost' ? 'bg-red-500/80 border-red-500/50' : 'bg-green-500/80 border-green-500/50'
                                }`}>
                                {item.type} Item Registry
                            </div>
                        </motion.div>

                        {/* Interactive Stats Ribbon */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <span className="block text-[10px] text-slate-500 uppercase font-black mb-1">Status</span>
                                <span className="text-sm font-bold text-white uppercase tracking-wider">{item.status}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <span className="block text-[10px] text-slate-500 uppercase font-black mb-1">ID Protocol</span>
                                <span className="text-sm font-mono text-cyan-400">{item.id.split('_').pop()?.toUpperCase()}</span>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <span className="block text-[10px] text-slate-500 uppercase font-black mb-1">Visibility</span>
                                <span className="text-sm font-bold text-white uppercase tracking-wider">{isBoosted ? 'Premium' : 'Standard'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Metadata & Actions */}
                    <div className="lg:col-span-5 space-y-8">

                        {/* Title Section */}
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-4xl md:text-5xl font-black tracking-tight leading-none"
                            >
                                {item.title}
                            </motion.h1>

                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-slate-300">
                                    <Tag size={14} className="text-cyan-400" />
                                    {item.category}
                                </div>
                                {hasMatch && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-black uppercase tracking-tighter shadow-lg shadow-amber-400/20">
                                        <Sparkles size={12} fill="currentColor" />
                                        Smart Match Found
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-lg text-slate-300 leading-relaxed font-medium">
                            {item.description}
                        </p>

                        {/* Metadata Grid */}
                        <div className="space-y-4 p-6 rounded-[24px] bg-white/[0.03] border border-white/10">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <MapPin size={18} className="text-[var(--primary-brand)]" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Location</span>
                                </div>
                                <span className="text-sm font-bold">{item.locationName}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Calendar size={18} className="text-[var(--primary-brand)]" />
                                    <span className="text-sm font-bold uppercase tracking-widest">Date Reported</span>
                                </div>
                                <span className="text-sm font-bold">{formatTimeAgo(item.date || item.createdAt)}</span>
                            </div>
                        </div>

                        {/* User Profile Section */}
                        <div className="flex items-center gap-4 p-5 rounded-[24px] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 group cursor-pointer hover:border-[var(--primary-brand)]/30 transition-all">
                            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white/10 border-2 border-white/5 group-hover:border-[var(--primary-brand)]/20">
                                {item.userAvatar ? (
                                    <Image src={item.userAvatar} alt={item.userName || ""} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <UserIcon size={24} className="text-slate-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">{item.userName || "Protocol Member"}</span>
                                    {((item.userTrustScore || 0) >= 90) && (
                                        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${isBoosted ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                            }`}>
                                            {isBoosted ? <Crown size={10} fill="currentColor" /> : <ShieldCheck size={10} />}
                                            {isBoosted ? 'Verified Elite' : 'Verified'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        Trust Score: <span className="text-[var(--primary-brand)]">{item.userTrustScore}%</span>
                                    </div>
                                    <div className="h-1 w-1 bg-slate-700 rounded-full" />
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest border-b border-dotted border-slate-700">
                                        View Profile
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => setIsChatModalOpen(true)}
                                className="flex items-center justify-center gap-3 py-4 rounded-[20px] bg-[var(--primary-brand)] text-black font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(34,211,238,0.2)]"
                            >
                                <MessageSquare size={18} />
                                {item.type === 'lost' ? 'I Found This — Contact Owner' : 'I Know the Owner — Return Item'}
                            </button>
                            <button className="flex items-center justify-center gap-3 py-4 rounded-[20px] bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                                <Flag size={18} />
                                Report Anomaly
                            </button>
                        </div>

                        {/* Verification Info (If any) */}
                        {item.type === 'found' && (
                            <div className="p-4 rounded-xl bg-amber-400/5 border border-amber-400/10 flex gap-3">
                                <AlertCircle className="text-amber-400 flex-shrink-0" size={20} />
                                <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest leading-relaxed">
                                    Protocol Note: Verification details (like serial numbers or unique marks) are hidden. You must answer the owner&#39;s security question during recovery.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Potential Matches Section */}
                <div className="mt-20 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                <Sparkles className="text-amber-400" size={28} />
                                Smart Intelligence Matches
                            </h2>
                            <p className="text-slate-400 font-medium mt-1">Cross-referencing telemetry for similar reports in this sector (5km radius)</p>
                        </div>
                        {potentialMatches.length > 0 && (
                            <div className="px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-black uppercase tracking-widest">
                                {potentialMatches.length} Match{potentialMatches.length > 1 ? 'es' : ''} Detected
                            </div>
                        )}
                    </div>

                    {potentialMatches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {potentialMatches.map((match: MatchResult) => (
                                <motion.div
                                    key={match.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => router.push(`/browse/${match.id}`)}
                                    className="p-4 rounded-[24px] bg-white/[0.03] border border-white/10 hover:border-amber-400/30 transition-all cursor-pointer group"
                                >
                                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/5">
                                        {match.photoUrl ? (
                                            <Image src={match.photoUrl} alt={match.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-slate-600">
                                                <AlertCircle size={32} />
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md">
                                                {match.locationName}
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight mb-2 truncate">{match.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/10">
                                                    {match.userAvatar && (
                                                        <Image src={match.userAvatar} alt={match.userName || ""} width={20} height={20} className="object-cover" />
                                                    )}
                                                </div>
                                                <span className="text-[9px] font-bold text-slate-400">{match.userName || "Unknown User"}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-500/80">
                                                <MapPin size={10} />
                                                {match.distanceKm}km Away
                                            </div>
                                        </div>
                                        <button className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black text-[10px] font-black uppercase tracking-widest transition-all">
                                            Investigate
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 rounded-[32px] border border-dashed border-white/10 bg-white/[0.01] text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                                <AlertCircle size={24} className="text-slate-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-300">No Current Matches Detected</h4>
                                <p className="text-xs text-slate-500 max-w-[300px] mx-auto mt-2 italic">Scanning the global grid... As more members report anomalies, our intelligence engine will connect matching packets automatically.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <ChatRequestModal
                isOpen={isChatModalOpen}
                onClose={() => setIsChatModalOpen(false)}
                userName={item.userName || "Protocol Member"}
                userId={item.userId}
                itemId={item.id}
            />
        </div>
    );
}
