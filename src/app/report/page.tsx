"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ReportForm from "@/components/ReportForm";

export default function ReportPage() {
    const { currentUser } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) router.push("/login");
    }, [currentUser, router]);

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] font-sans text-white">
            {/* Navbar in RootLayout */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="mb-10 text-center">
                    <h2 className="text-4xl font-extrabold tracking-tight mb-2">Report an Item</h2>
                    <p className="text-slate-400">Provide details about the lost or found item to help us find a match.</p>
                </div>
                <div className="glass-card p-4 md:p-8 rounded-3xl border border-[rgba(255,255,255,0.08)]">
                    <ReportForm />
                </div>
            </main>
        </div>
    );
}
