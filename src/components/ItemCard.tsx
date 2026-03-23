"use client";

import { useStore } from "@/store/useStore";
import { Item } from "@/lib/types";
import { MapPin, Clock, ArrowRight, Heart, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface ItemCardProps {
    item: Item;
    onClick?: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
    const { toggleLike, matches } = useStore();
    const hasMatch = matches.some(m => m.itemId1 === item.id || m.itemId2 === item.id);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -10, boxShadow: "0 20px 40px rgba(34, 211, 238, 0.15)" }}
            transition={{ duration: 0.4 }}
            className="group relative backdrop-blur-md rounded-[20px] p-6 border transition-all cursor-pointer overflow-hidden bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.05)] hover:border-[var(--primary-brand)]/30"
            onClick={onClick}
        >
            {/* Smart Match Glow Indicator */}
            {hasMatch && (
                <div className="absolute top-4 left-4 z-10 bg-amber-400 text-black px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse border border-amber-200/50">
                    Smart Match Found
                </div>
            )}

            {/* Image Section */}
            <div className="relative w-full h-[180px] mb-4 rounded-[15px] overflow-hidden bg-[rgba(0,0,0,0.3)]">
                {'photoUrl' in item && item.photoUrl ? (
                    <Image
                        src={item.photoUrl}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            // Fallback to a high-quality placeholder if the specific Unsplash ID fails
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532619675605-1fea6d25208b?auto=format&fit=crop&w=800&q=80';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] bg-[rgba(255,255,255,0.02)]">
                        No Image
                    </div>
                )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-[var(--primary-brand)] transition-colors">
                {item.title}
            </h3>

            {item.reward_amount && item.reward_amount > 0 && (
                <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[9px] font-bold uppercase tracking-wider">
                        Reward: ${item.reward_amount}
                    </span>
                </div>
            )}

            {/* Poster Info Layer */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex-shrink-0 border border-white/5">
                    {item.userAvatar ? (
                        <Image src={item.userAvatar} alt={item.userName || ""} width={24} height={24} className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-500">
                            {item.userName?.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-300">
                        {item.userName || "Protocol Member"}
                    </span>
                    {((item.userTrustScore || 0) >= 90) && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-tighter bg-blue-500/10 border-blue-500/20 text-blue-400">
                            <CheckCircle2 size={10} />
                            Verified
                        </div>
                    )}
                </div>
            </div>

            <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 min-h-[40px]">
                {item.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-5">
                <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-[var(--primary-brand)]" />
                    {item.locationName}
                </span>
                <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {new Date(item.date || item.createdAt).toLocaleDateString()}
                </span>
            </div>

            {/* Action Button */}
            <button className="w-full py-3 rounded-[15px] bg-[var(--primary-brand)] text-black font-bold text-sm tracking-wide hover:translate-y-[-2px] hover:shadow-[0_10px_20px_rgba(34,211,238,0.2)] transition-all flex items-center justify-center gap-2">
                {item.type === 'lost' ? 'I Found This' : 'Claim Item'}
                <ArrowRight size={16} />
            </button>

            {/* Simple Social Actions Overlay */}
            <div className="absolute bottom-24 right-4 flex gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                    }}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${item.userHasLiked ? "bg-[var(--status-lost)] text-white" : "bg-black/30 text-white/70 hover:bg-black/50"
                        }`}
                >
                    <Heart size={14} fill={item.userHasLiked ? "currentColor" : "none"} />
                </button>
            </div>
        </motion.div>
    );
}
