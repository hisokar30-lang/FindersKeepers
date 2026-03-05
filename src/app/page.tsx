"use client";

import { useStore } from "@/store/useStore";
import ItemCard from "@/components/ItemCard";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

import { useEffect } from "react";
import { X } from "lucide-react";

import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full flex items-center justify-center bg-[#020617] rounded-[20px] border border-[#22d3ee44]">
      <p className="text-[var(--primary-brand)] animate-pulse">Initializing Geo-Intelligence...</p>
    </div>
  )
});

export default function Dashboard() {
  const { items, seedMockData, searchQuery, setSearchQuery } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (items.length === 0) {
      seedMockData();
    }
  }, [items.length, seedMockData]);

  return (
    <div className="min-h-screen font-sans selection:bg-[var(--primary-brand)] selection:text-black">
      {/* Navbar moved to RootLayout */}

      {/* HERO SECTION */}
      <section className="text-center px-[8%] py-24 md:py-32">
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[1] text-gradient"
        >
          Recover What Matters<br /> With Geo-Intelligence
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          FindersKeepers is a community-driven protocol for Lost & Found marketplaces.
          Stop relying on luck—use AI-powered proximity matching and verified community returns.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <button
            onClick={() => router.push("/report")}
            className="btn-primary px-10 h-12 text-[14px]"
            style={{ backgroundImage: "var(--gitogradiant)", color: "#161618" }}
          >
            Submit Report
          </button>
          <button
            onClick={() => router.push("/how-it-works")}
            className="px-8 h-12 text-[14px] font-bold text-white bg-slate-800/50 hover:bg-slate-800 border border-white/5 rounded-lg transition-all"
          >
            How it Works
          </button>
        </motion.div>
      </section>

      {/* PROTOCOL STATS & TICKER */}
      <section className="px-[8%] py-10 bg-white/[0.02] border-y border-white/5 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
            {[
              { label: "PROTOCOL STATUS", value: "OPERATIONAL", color: "text-emerald-400" },
              { label: "ITEMS RECOVERED", value: "1,428", color: "text-white" },
              { label: "COMMUNITY IMPACT", value: "HIGH", color: "text-white" },
              { label: "ACTIVE NODES", value: "1,204", color: "text-white" }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-[10px] font-black tracking-[0.2em] text-slate-500">{stat.label}</span>
                <span className={`text-xl font-black ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="w-full md:w-1/3 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 relative overflow-hidden group">
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
              <div className="flex-1 overflow-hidden">
                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Live Impact Feed</p>
                <div className="h-5 overflow-hidden relative">
                  <motion.div
                    animate={{ y: [0, -20, -40] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="space-y-1"
                  >
                    <p className="text-xs font-bold text-white truncate">iPhone 15 Pro Max — RETURNED TO OWNER</p>
                    <p className="text-xs font-bold text-white truncate">Golden Retriever — VERIFIED REUNION</p>
                    <p className="text-xs font-bold text-white truncate">Rolex Submariner — SUCCESSFUL RECOVERY</p>
                  </motion.div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
      <section className="px-[8%] py-16">
        <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
          <span className="w-2 h-8 bg-[var(--primary-brand)] rounded-full"></span>
          Nearby Lost & Found
        </h2>

        <Map items={items} />
      </section>

      {/* ITEMS SECTION */}
      <section className="px-[8%] py-12 md:py-20">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[var(--primary-brand)] rounded-sm"></span>
              Latest Listings
            </h2>
            {searchQuery && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-brand)]/10 border border-[var(--primary-brand)]/20">
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary-brand)]">Filtering Intelligence</span>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X size={10} />
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => router.push("/browse")}
            className="text-[13px] font-bold text-[var(--primary-brand)] hover:underline px-3 py-1.5 bg-[var(--primary-brand)]/5 rounded-md transition-all"
          >
            View All
          </button>
        </div>

        {(() => {
          const filteredItems = items.filter(item => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return item.title.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query) ||
              item.category.toLowerCase().includes(query);
          });

          if (filteredItems.length === 0) {
            return (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
                <p className="text-slate-500 font-medium italic">No intelligence matching your query found in this sector.</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-xs font-bold text-[var(--primary-brand)] hover:underline"
                >
                  Reset Global Search
                </button>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredItems.slice(0, 8).map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => router.push(`/browse/${item.id}`)}
                />
              ))}
            </div>
          );
        })()}
      </section>

      {/* Footer moved to RootLayout */}
    </div >
  );
}
