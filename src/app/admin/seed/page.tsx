
"use client";

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShieldCheck, Database, Loader2, CheckCircle2, Trash2 } from 'lucide-react';

export default function SeedPage() {
    const [status, setStatus] = useState<'idle' | 'seeding' | 'success'>('idle');
    const { seedMockData, items } = useStore();

    const runSeed = async () => {
        setStatus('seeding');
        // Small artificial delay for "feel"
        await new Promise(r => setTimeout(r, 1500));
        seedMockData();
        setStatus('success');
    };

    const clearLocalData = () => {
        useStore.setState({ items: [], users: [], comments: {}, messages: [] });
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                        <Database size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Platform Scaler</h1>
                        <p className="text-slate-400">Virtual High-Volume Data Simulation</p>
                    </div>
                </div>

                <div className="glass-card p-8 border border-white/5 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <ShieldCheck className="text-blue-400 mt-1" size={20} />
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tighter">View Populator Active</h4>
                            <p className="text-xs text-slate-400 leading-relaxed mt-1 italic">
                                This tool bypasses the database to inject 100+ items and profiles directly into your local dashboard.
                                Experience the site scale without real account registration.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                            <span className="block text-2xl font-black text-white">{items.length}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Active Items</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                            <span className="block text-2xl font-black text-white">10k+</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Social Activity</span>
                        </div>
                    </div>

                    {status === 'success' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-sm animate-pulse">
                            <CheckCircle2 size={18} />
                            Virtual scaling complete! Dashboard is now populated.
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={runSeed}
                            disabled={status === 'seeding'}
                            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                        >
                            {status === 'seeding' ? <Loader2 className="animate-spin" /> : <Database size={18} />}
                            {status === 'seeding' ? 'Processing Views...' : 'Populate Platform (Demo)'}
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold transition-all border border-white/5"
                        >
                            Return to Dashboard
                        </button>

                        <button
                            onClick={clearLocalData}
                            className="w-full py-3 rounded-xl bg-red-500/5 hover:bg-red-500/10 text-red-500/70 text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 size={12} />
                            Reset Local State
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
