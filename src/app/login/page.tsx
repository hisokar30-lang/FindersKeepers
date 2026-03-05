"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Mail, User, Lock } from "lucide-react";
import ReCAPTCHA from "@/components/ReCAPTCHA";

export default function LoginPage() {
    const { login, register } = useStore();
    const router = useRouter();

    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isHumanVerified, setIsHumanVerified] = useState(false);

    const validateGmail = (email: string) => {
        return email.toLowerCase().endsWith("@gmail.com");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (!isHumanVerified) {
                setError("Please verify you are a sentient being (check the reCAPTCHA).");
                setIsLoading(false);
                return;
            }

            if (!validateGmail(email)) {
                setError("Portal access requires a verified @gmail.com identifier for security.");
                setIsLoading(false);
                return;
            }

            if (isRegister) {
                if (!name.trim()) {
                    setError("Please provide your name so we can welcome you properly.");
                    setIsLoading(false);
                    return;
                }
                await register(email, name.trim());
            } else {
                await login(email);
            }
            router.push("/browse");
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const SocialButton = ({ icon, label, color }: { icon: string, label: string, color: string }) => (
        <button
            type="button"
            className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
        >
            <span className="text-xl font-serif font-bold text-white/40 group-hover:text-white transition-colors">{icon}</span>
            <span style={{ color }} className="font-semibold text-[10px] tracking-[0.2em] uppercase group-hover:text-white transition-colors">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen py-20 flex items-center justify-center relative overflow-hidden bg-[#050811]">

            {/* Ambient Background Aura */}
            <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-cyan-500/[0.03] blur-[200px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[480px] z-10 p-6"
            >
                <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-[48px] p-10 md:p-14 shadow-[0_60px_150px_rgba(0,0,0,0.7)] relative overflow-hidden">

                    {/* Security Badge */}
                    <div className="absolute top-8 right-10 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
                        <ShieldCheck size={14} className="text-[var(--primary-brand)]" />
                        <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-white/30">Secure Portal</span>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-14">
                        <motion.div
                            key={isRegister ? "register-header" : "login-header"}
                            initial={{ opacity: 0, filter: "blur(10px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            className="space-y-4"
                        >
                            <h1 className="text-4xl font-bold text-white tracking-tight">
                                {isRegister ? "Join Community" : "Welcome Back"}
                            </h1>
                            <p className="text-white/50 text-sm font-medium leading-relaxed max-w-[300px] mx-auto text-balance">
                                {isRegister
                                    ? "Start your journey in securing and recovering items."
                                    : "Access your dashboard to continue your active missions."}
                            </p>
                        </motion.div>
                    </div>

                    {/* Auth Form */}
                    <form onSubmit={handleSubmit} className="space-y-7">
                        <AnimatePresence mode="wait">
                            {isRegister && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -20, height: 0 }}
                                    className="space-y-2.5"
                                >
                                    <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-[0.3em] ml-5 flex items-center gap-2">
                                        <User size={12} strokeWidth={3} /> Identity Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-3xl px-7 py-5 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-[var(--primary-brand)]/10 focus:border-[var(--primary-brand)]/50 transition-all font-medium"
                                        placeholder="Jane Doe"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-[0.3em] ml-5 flex items-center gap-2">
                                <Mail size={12} strokeWidth={3} /> Portal Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-3xl px-7 py-5 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-[var(--primary-brand)]/10 focus:border-[var(--primary-brand)]/50 transition-all font-medium"
                                placeholder="jane.doe@example.com"
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-extrabold text-white/40 uppercase tracking-[0.3em] ml-5 flex items-center gap-2">
                                <Lock size={12} strokeWidth={3} /> Access Key
                            </label>
                            <input
                                type="password"
                                required={isRegister}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-3xl px-7 py-5 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-[var(--primary-brand)]/10 focus:border-[var(--primary-brand)]/50 transition-all font-medium"
                                placeholder="••••••••••••"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-semibold flex items-center gap-3"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-center py-2 h-[80px]">
                            <ReCAPTCHA onVerify={setIsHumanVerified} />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-5 rounded-[40px] bg-[var(--primary-brand)] text-black font-black text-[11px] tracking-[0.3em] uppercase hover:shadow-[0_20px_60px_rgba(34,211,238,0.4)] transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 group mt-4"
                        >
                            {isLoading ? "Authenticating..." : (isRegister ? "Initialize Account" : "Access Portal")}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-14 text-center">
                        <p className="text-white/30 text-[11px] font-bold tracking-wide">
                            {isRegister ? "ALREADY PART OF THE COMMUNITY? " : "NEW TO THE NETWORK? "}
                            <button
                                onClick={() => setIsRegister(!isRegister)}
                                className="text-[var(--primary-brand)] font-black uppercase tracking-widest ml-2 hover:brightness-125 transition-all text-xs"
                            >
                                {isRegister ? "Sign In" : "Register"}
                            </button>
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
