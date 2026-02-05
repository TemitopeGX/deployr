"use client";

import { Box, Code, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function DashboardHeader() {
    return (
        <nav className="glass sticky top-0 z-50 border-b border-white/5">
            <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-3 items-center">

                {/* Left: Logo */}
                <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Cpu className="text-white w-5 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm font-outfit">
                            Deployr<span className="text-blue-500">.</span>
                        </span>
                    </div>
                </div>

                {/* Center: Navigation */}
                <div className="hidden md:flex justify-center items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="#" className="hover:text-white transition-colors">Projects</Link>
                    <Link href="#" className="hover:text-white transition-colors">Runners</Link>
                    <Link href="#" className="hover:text-white transition-colors">Infrastructure</Link>
                    <Link href="#" className="hover:text-white transition-colors">Secrets</Link>
                </div>

                {/* Right: Actions */}
                <div className="flex justify-end items-center gap-4">
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-[12px] font-semibold text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        SYSTEM_ONLINE
                    </div>
                    <button className="btn-primary py-2 px-5 text-sm whitespace-nowrap">
                        New Project
                    </button>
                </div>
            </div>
        </nav>
    );
}
