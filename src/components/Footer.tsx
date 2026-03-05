"use client";

import Link from "next/link";
import { Github, Disc as Discord, Mail, ShieldCheck, HelpCircle, FileText } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-[#020617] border-t border-white/5 pt-16 pb-8 mt-20">
            <div className="container mx-auto px-6 lg:px-[5%]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="text-2xl font-black tracking-tighter">
                            <span className="bg-gradient-to-l from-[#A5A6FF] to-[#6264F0] bg-clip-text text-transparent">
                                FindersKeepers
                            </span>
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            The first community-driven Geo-Intelligence protocol for Lost & Found marketplaces.
                            Verified returns, smart matching, and community trust.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                <Github size={18} />
                            </a>
                            <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                                <Discord size={18} />
                            </a>
                            <a href="mailto:hisokar30@gmail.com" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white" title="Contact Support & Gifts">
                                <Mail size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        {/* Protocol */}
                        <div className="space-y-4">
                            <h5 className="text-[13px] font-bold text-white uppercase tracking-widest">Protocol</h5>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link href="/browse" className="text-slate-400 hover:text-[var(--primary-brand)] transition-colors">Browse Items</Link></li>
                                <li><Link href="/map" className="text-slate-400 hover:text-[var(--primary-brand)] transition-colors">Geo-Intelligence</Link></li>
                                <li><Link href="/report" className="text-slate-400 hover:text-[var(--primary-brand)] transition-colors">Post Listing</Link></li>
                                <li><Link href="/how-it-works" className="text-slate-400 hover:text-[var(--primary-brand)] transition-colors">Smart Matching</Link></li>
                            </ul>
                        </div>

                        {/* Trust & Safety */}
                        <div className="space-y-4">
                            <h5 className="text-[13px] font-bold text-white uppercase tracking-widest">Trust & Safety</h5>
                            <ul className="space-y-2.5 text-sm text-slate-400">
                                <li><Link href="/how-it-works" className="hover:text-white transition-colors">Verification Process</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-white transition-colors">Owner Validation</Link></li>
                                <li><Link href="/how-it-works" className="hover:text-white transition-colors">Reputation Protocol</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div className="space-y-4">
                            <h5 className="text-[13px] font-bold text-white uppercase tracking-widest">Legal</h5>
                            <ul className="space-y-2.5 text-sm text-slate-400">
                                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Guidelines</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-4 text-[12px] text-slate-500 font-medium">
                    <p>© {new Date().getFullYear()} FindersKeepers Protocol. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-cyan-500" /> Secure Protocol</span>
                        <span className="flex items-center gap-1.5"><HelpCircle size={12} className="text-blue-500" /> Help Center</span>
                        <span className="flex items-center gap-1.5 text-[var(--primary-brand)]">System Status: Optimal</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
