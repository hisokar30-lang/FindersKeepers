"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FilterBar from "@/components/FilterBar";
import ItemCard from "@/components/ItemCard";

export default function BrowsePage() {
    const { currentUser, items, filterType, filterCategory, searchQuery, fetchItems } = useStore();
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) router.push("/login");
        fetchItems();
    }, [currentUser, router]);

    if (!currentUser) return null;

    const filtered = items.filter((item) => {
        if (filterType !== "all" && item.type !== filterType) return false;
        if (filterCategory !== "all" && item.category !== filterCategory) return false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const inTitle = item.title.toLowerCase().includes(query);
            const inDesc = item.description.toLowerCase().includes(query);
            if (!inTitle && !inDesc) return false;
        }

        return true;
    });

    return (
        <div className="min-h-screen bg-[var(--bg-main)] font-sans">
            {/* Navbar in RootLayout */}
            <main className="px-[8%] py-12">
                <div className="flex justify-between items-end mb-8">
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <span className="w-2 h-8 bg-[var(--primary-brand)] rounded-full"></span>
                        Browse Listings
                    </h2>
                </div>

                <FilterBar />

                {filtered.length === 0 ? (
                    <div className="text-center py-20 bg-[rgba(255,255,255,0.02)] rounded-2xl border border-[rgba(255,255,255,0.05)]">
                        <p className="text-lg font-semibold text-slate-500">
                            No items match your filters.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((item) => (
                            <ItemCard key={item.id} item={item} onClick={() => router.push(`/browse/${item.id}`)} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
