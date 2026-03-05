"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { useStore } from "@/store/useStore";

interface SocialActionsProps {
    itemId: string;
    initialLikes?: number;
    initialComments?: number;
    userHasLiked?: boolean;
}

export default function SocialActions({ itemId, initialLikes = 0, initialComments = 0, userHasLiked = false }: SocialActionsProps) {
    const { toggleLike } = useStore();
    // In a real app with caching, we might use local optimistic state derived from props initially,
    // but here we will rely on the parent or store to pass updated values if possible.
    // For MVP item card, we often just use the props passed down from the item list which updates from store.

    // To make it truly reactive to store updates without prop drilling, we could look up the item in store items here.
    // But for performance in lists, passed props are usually better unless we use a selector.

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleLike(itemId);
    };

    return (
        <div className="flex items-center gap-3">
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${userHasLiked
                        ? "bg-red-50 text-[var(--status-lost)]"
                        : "bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
            >
                <Heart size={16} fill={userHasLiked ? "currentColor" : "none"} />
                {initialLikes > 0 && <span>{initialLikes}</span>}
                {initialLikes === 0 && <span>Like</span>}
            </motion.button>

            <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <MessageCircle size={16} />
                {initialComments > 0 && <span>{initialComments}</span>}
                {initialComments === 0 && <span>Comment</span>}
            </button>
        </div>
    );
}
