"use client";

import {
    BarChart2,
    Layers,
    Cpu,
    Activity,
    Settings,
    Cloud,
    ChevronDown,
    Command,
    LogOut,
    Bell,
    ShieldCheck,
    Zap
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
    const pathname = usePathname();

    const primaryNav = [
        { label: "Dashboard", icon: <BarChart2 size={18} />, href: "/" },
        { label: "Projects", icon: <Layers size={18} />, href: "/projects" },
        { label: "Runners", icon: <Cpu size={18} />, href: "/runners" },
        { label: "Activity", icon: <Activity size={18} />, href: "/activity" },
    ];

    const secondaryNav = [
        { label: "Infrastructure", icon: <Cloud size={18} />, href: "/infra" },
        { label: "Security", icon: <ShieldCheck size={18} />, href: "/security" },
        { label: "Settings", icon: <Settings size={18} />, href: "/settings" },
    ];

    return (
        <aside className="w-64 h-full bg-[#070809] border-r border-white/5 flex flex-col flex-shrink-0">
            {/* Brand Section */}
            <div className="h-[72px] flex items-center px-6 gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Zap size={20} className="text-white fill-current" />
                </div>
                <div>
                    <span className="font-bold text-lg tracking-tight text-white block leading-none">Deployr</span>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 block">Orchestrator</span>
                </div>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                <div className="space-y-1">
                    <span className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 block">Menu</span>
                    {primaryNav.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${pathname === item.href
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
                                }`}
                        >
                            <span className={`${pathname === item.href ? 'text-blue-500' : 'group-hover:text-white'}`}>{item.icon}</span>
                            {item.label}
                            {pathname === item.href && <div className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />}
                        </Link>
                    ))}
                </div>

                <div className="space-y-1">
                    <span className="px-3 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-2 block">Management</span>
                    {secondaryNav.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.03] transition-all group"
                        >
                            <span className="group-hover:text-white">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Profile Footer */}
            <div className="p-4 bg-white/[0.01] border-t border-white/5">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border border-white/10" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-black rounded-full" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-white truncate">Bismight Lateef</span>
                        <span className="text-[10px] text-white/40 truncate font-medium">Enterprise Admin</span>
                    </div>
                    <ChevronDown size={14} className="ml-auto text-white/30 group-hover:text-white" />
                </div>
            </div>
        </aside>
    );
}
