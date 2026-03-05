"use client";

import { useStore } from "@/store/useStore";
import { ItemCategory, PostType } from "@/lib/types";
import { Filter, Grid3X3, List } from "lucide-react";
import { useState } from "react";

const CATEGORIES: ItemCategory[] = [
    "Electronics",
    "Personal Items",
    "Pets & Animals",
    "Documents",
    "Apparel",
    "Other",
];

export default function FilterBar() {
    const { filterType, filterCategory, setFilterType, setFilterCategory } = useStore();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const typeOptions: { label: string; value: PostType | "all" }[] = [
        { label: "All", value: "all" },
        { label: "Lost", value: "lost" },
        { label: "Found", value: "found" },
    ];

    return (
        <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel mb-6"
        >
            <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: "rgba(255,255,255,0.4)" }} />

                {/* Type filter */}
                <div className="flex rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                    {typeOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFilterType(opt.value)}
                            className="px-3 py-1.5 text-xs font-medium transition-all duration-200"
                            style={{
                                background:
                                    filterType === opt.value
                                        ? opt.value === "lost"
                                            ? "rgba(255,59,48,0.2)"
                                            : opt.value === "found"
                                                ? "rgba(204,255,0,0.2)"
                                                : "rgba(255,255,255,0.1)"
                                        : "transparent",
                                color:
                                    filterType === opt.value
                                        ? opt.value === "lost"
                                            ? "var(--status-lost)"
                                            : opt.value === "found"
                                                ? "var(--primary-brand)"
                                                : "var(--text-primary)"
                                        : "rgba(255,255,255,0.4)",
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Category filter */}
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value as ItemCategory | "all")}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white/[0.04] border border-[var(--border-subtle)] text-white/60"
                >
                    <option value="all" style={{ background: "#1a1a1b" }}>All Categories</option>
                    {CATEGORIES.map((c) => (
                        <option key={c} value={c} style={{ background: "#1a1a1b" }}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                <button
                    onClick={() => setViewMode("grid")}
                    className="p-2 transition-all"
                    style={{
                        background: viewMode === "grid" ? "rgba(255,255,255,0.1)" : "transparent",
                        color: viewMode === "grid" ? "var(--text-primary)" : "rgba(255,255,255,0.3)",
                    }}
                >
                    <Grid3X3 size={14} />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className="p-2 transition-all"
                    style={{
                        background: viewMode === "list" ? "rgba(255,255,255,0.1)" : "transparent",
                        color: viewMode === "list" ? "var(--text-primary)" : "rgba(255,255,255,0.3)",
                    }}
                >
                    <List size={14} />
                </button>
            </div>
        </div>
    );
}
