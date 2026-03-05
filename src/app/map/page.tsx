"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full flex items-center justify-center bg-[#020617]">
            <p className="text-[var(--primary-brand)] animate-pulse">Loading Geo-Sector...</p>
        </div>
    )
});

export default function MapPage() {
    const { currentUser, items } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) router.push("/login");
    }, [currentUser, router]);

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] flex flex-col font-sans">
            {/* Navbar in RootLayout */}
            <main className="flex-1 relative">
                <div className="absolute inset-0 z-0">
                    <Map items={items} />
                </div>

                {/* Visual Overlay for branding */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <div className="glass-card px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.1)] flex items-center gap-3">
                        <div className="w-2 h-2 bg-[var(--primary-brand)] rounded-full animate-pulse" />
                        <span className="text-xs font-bold tracking-widest text-white uppercase italic">Geo-Intelligence Active</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
