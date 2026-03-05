"use client";

import { motion } from "framer-motion";

export default function RespectfulIntro() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-10 text-center relative overflow-hidden rounded-3xl p-10 shadow-[var(--shadow-lg)]"
            style={{
                background: "linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-hover) 100%)",
                color: "white",
            }}
        >
            <div className="relative z-10">
                <motion.h1
                    className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    Welcome to the New Community.
                </motion.h1>
                <motion.p
                    className="text-lg md:text-xl font-medium opacity-90 max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    A space built on trust, respect, and shared impact. Connect with others, recover what belongs to you, and gain community recognition for your honesty.
                </motion.p>
            </div>

            {/* Decorative Circles */}
            <motion.div
                className="absolute top-[-50px] left-[-50px] w-40 h-40 rounded-full bg-white opacity-10"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute bottom-[-20px] right-[-20px] w-60 h-60 rounded-full bg-white opacity-5"
                animate={{ scale: [1, 1.1, 1], rotate: [360, 180, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            />
        </motion.div>
    );
}
