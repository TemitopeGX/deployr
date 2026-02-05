"use client";

import {
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  GitBranch,
  Clock,
  ChevronRight,
  Activity,
  Box,
  Bell,
  Cpu,
  Zap,
  Shield,
  Layers,
  Terminal,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Globe,
  Database,
  Loader,
  Rocket,
  Play
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useProjects, useStats, useJobs } from "../lib/hooks";
import api from "../lib/api";
import NewProjectModal from "../components/NewProjectModal";
import DevTools from "../components/DevTools";

export default function Home() {
  const { projects, isLoading: projectsLoading } = useProjects();
  const { stats, isLoading: statsLoading } = useStats(); // You might need to update useStats to use real data logic if you haven't
  const { jobs, isLoading: jobsLoading, mutate: mutateJobs } = useJobs();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleDeploy = async (projectId: string) => {
    setDeployingId(projectId);
    try {
      await api.post('/jobs', { project_id: projectId });
      mutateJobs(); // Refresh jobs list instantly
      alert("Deployment queued successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to queue deployment.");
    } finally {
      setDeployingId(null);
    }
  };

  // Helper to format time relative
  const timeAgo = (dateStr: string) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col min-h-full bg-[#030405]">
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Dynamic Header */}
      <header className="h-[72px] border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-[#070809]/80 backdrop-blur-xl z-40 flex-shrink-0 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight font-display">Overview</h1>
            <div className="hidden sm:block px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-[10px] text-white/40 font-bold uppercase tracking-widest">v2.4.0</div>
          </div>
          <div className="hidden lg:flex items-center gap-4 border-l border-white/5 pl-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Search resource or action..."
              className="bg-white/[0.03] border border-white/5 rounded-xl py-2 pl-10 pr-12 text-xs text-white focus:outline-none focus:border-blue-500/30 focus:bg-white/[0.05] transition-all w-72"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white/30 font-bold">⌘K</div>
          </div>
          <button className="p-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all relative">
            <Bell size={18} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-[#070809]" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/10 active:scale-95 cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} /> New Project
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 space-y-10 w-full max-w-[1920px] mx-auto">

        {/* Core Metrics Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Infrastructure", value: stats?.totalProjects || "0", sub: "Projects linked", icon: <Database />, color: "blue" },
            { label: "Active Runners", value: stats?.activeRunners || "0", sub: "Global nodes", icon: <Cpu />, color: "green" },
            { label: "Deployment Velocity", value: stats?.deploymentVelocity || "0", sub: "Rollouts / day", icon: <Zap />, color: "amber" },
            { label: "Network Health", value: stats?.networkHealth || "--", sub: "Latency 12ms", icon: <Globe />, color: "indigo" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card p-6 group cursor-default relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400 ring-1 ring-${stat.color}-500/20`}>
                  {stat.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.1em]">Metrics</span>
                  <div className="w-6 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                    <div className={`h-full w-2/3 bg-${stat.color}-500/30`} />
                  </div>
                </div>
              </div>
              <div className="space-y-1 relative z-10">
                <span className="text-3xl font-bold tracking-tight text-white font-display block">{stat.value}</span>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest leading-none">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Main Workspace Body */}
          <section className="col-span-12 xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
              <div className="space-y-1">
                <h2 className="text-lg font-bold font-display leading-none">Active Deployments</h2>
                <p className="text-xs text-white/40">Manage your connected clusters and repositories.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all">
                  <Filter size={16} />
                </button>
                <button className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg border border-white/5 transition-all">
                  <RefreshCw size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {projectsLoading ? (
                <div className="flex justify-center py-10"><Loader className="animate-spin text-white/20" /></div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-white/40 text-sm">No projects found. Create one to get started.</p>
                </div>
              ) : (
                projects.map((project: any, i: number) => (
                  <motion.div
                    key={project.id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="group relative"
                  >
                    <div className="surface-card p-5 flex items-center justify-between group-hover:bg-white/[0.015] transition-all">
                      <div className="flex items-center gap-5">
                        <div className="w-11 h-11 bg-[#0a0b0d] border border-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/10 transition-all shadow-inner">
                          <Box size={22} className="text-white/20 group-hover:text-blue-500 transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className="text-[15px] font-bold text-white tracking-tight truncate">{project.name}</h4>
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/40">{project.framework}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-medium">
                              <GitBranch size={12} className="text-blue-500/50" /> main
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-white/30 font-medium">
                              <Clock size={12} className="text-white/20" /> {timeAgo(project.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-right hidden sm:block">
                          <div className="flex items-center gap-1.5 justify-end">
                            <Globe size={10} className="text-white/20" />
                            <span className="text-[10px] uppercase font-bold text-white/20 tracking-wider">Target</span>
                          </div>
                          <p className="text-[11px] text-white/40 mt-0.5 font-semibold text-blue-500/70">{project.target}</p>
                        </div>

                        <div className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border flex items-center gap-2 bg-green-500/5 border-green-500/10 text-green-500`}>
                          <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-green-500`} />
                          HEALTHY
                        </div>

                        <button
                          onClick={() => handleDeploy(project.id)}
                          disabled={deployingId === project.id}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Deploy Now"
                        >
                          {deployingId === project.id ? <Loader size={18} className="animate-spin" /> : <Rocket size={18} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[11px] font-bold text-white/20 uppercase tracking-widest hover:border-white/20 hover:text-white/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Plus size={14} className="group-hover:scale-110 transition-transform" /> Connect Additional Resource
            </button>
          </section>

          {/* Activity Logs Feed */}
          <aside className="col-span-12 xl:col-span-4 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 px-1">
              <h3 className="text-lg font-bold font-display leading-none">Intelligence Feed</h3>
              <Activity size={16} className="text-blue-600" />
            </div>

            <div className="surface-card p-6 space-y-8 relative overflow-hidden bg-gradient-to-b from-white/[0.02] to-transparent">
              <div className="space-y-8 relative z-10">
                {jobs.map((job: any, i: number) => (
                  <div key={job.id || i} className="flex gap-4 group">
                    <div className="relative">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${job.status === 'success' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' :
                        job.status === 'failed' ? 'bg-red-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
                          'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                        }`} />
                      {i !== jobs.length - 1 && <div className="absolute top-5 left-1 w-px h-10 bg-white/5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-white mb-0.5">{job.type || 'Deployment'}</p>
                      <p className="text-xs text-white/40 truncate mb-1">Project #{job.project_id}</p>
                      <span className="text-[10px] text-white/20 font-bold uppercase tracking-wider">{timeAgo(job.created_at)}</span>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-white/20 text-xs">No recent activity.</p>}
              </div>
              <button className="w-full mt-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-white/40 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all">
                Access Event Logs
              </button>
            </div>

            {/* Contextual Action / Info */}
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-white/5 aspect-video flex flex-col justify-end p-6">
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600 to-indigo-900 opacity-90 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold text-white uppercase tracking-widest">Enterprise</span>
                  <div className="h-px flex-1 bg-white/20" />
                </div>
                <h4 className="text-xl font-bold text-white leading-tight font-display">Enable Multi-Cluster Orchestration</h4>
                <p className="text-xs text-white/70 leading-relaxed font-medium">Coordinate deployments across AWS, GCP, and Bare Metal from a single terminal.</p>
                <div className="flex items-center text-xs font-bold text-white gap-2 group-hover:gap-3 transition-all pt-2">
                  Learn more <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="h-10 border-t border-white/5 bg-[#070809] flex items-center justify-between px-10 text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-green-500" />
            Socket: Connected
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-blue-500" />
            Orchestrator: Active
          </div>
        </div>
        <div className="flex items-center gap-4">
          <DevTools />
          <span className="text-white/5">|</span>
          Documentation
          <span className="text-white/5">|</span>
          API Status
          <span className="text-white/5">|</span>
          Support
        </div>
      </footer>
    </div>
  );
}
