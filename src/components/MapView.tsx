"use client";

import { motion } from "framer-motion";
import { Crosshair } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function MapView() {
    const items = useStore((s) => s.items);

    // Normalize coordinates to relative positions for the mock map
    const lats = items.map((i) => i.locationLat);
    const lngs = items.map((i) => i.locationLng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.01;
    const lngRange = maxLng - minLng || 0.01;

    const pins = items.map((item) => ({
        id: item.id,
        type: item.type,
        label: item.title,
        x: 10 + ((item.locationLng - minLng) / lngRange) * 80,
        y: 10 + ((maxLat - item.locationLat) / latRange) * 80,
    }));

    return (
        <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden glass-card">
            {/* Map background */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                {/* Grid overlay */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />

                {/* Radius circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-[#CCFF00]/20 bg-[#CCFF00]/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#CCFF00]/10" />

                {/* Pins */}
                {pins.map((pin, i) => (
                    <motion.div
                        key={pin.id}
                        className="absolute group cursor-pointer"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.08, type: "spring", stiffness: 200 }}
                        whileHover={{ scale: 1.3 }}
                    >
                        <div
                            className={`w-4 h-4 rounded-full shadow-lg ${pin.type === "lost"
                                    ? "bg-[#FF3B30] shadow-[#FF3B30]/40"
                                    : "bg-[#CCFF00] shadow-[#CCFF00]/40"
                                }`}
                        />
                        <div
                            className={`absolute inset-0 rounded-full animate-ping opacity-30 ${pin.type === "lost" ? "bg-[#FF3B30]" : "bg-[#CCFF00]"
                                }`}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm text-[10px] font-semibold text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                            {pin.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Overlay info */}
            <div className="absolute bottom-5 left-5 z-10">
                <h2 className="text-lg font-bold text-white">Geo-Intelligence Map</h2>
                <p className="text-xs text-zinc-400 mt-1">
                    Showing {items.length} active reports in your area.
                </p>
            </div>

            <button className="absolute bottom-5 right-5 z-10 p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-[#CCFF00] hover:border-[#CCFF00]/30 transition-all">
                <Crosshair size={18} />
            </button>

            {/* Legend */}
            <div className="absolute top-5 right-5 z-10 flex gap-4 text-[10px] font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" /> Lost
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CCFF00]" /> Found
                </span>
            </div>
        </div>
    );
}
