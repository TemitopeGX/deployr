"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../lib/api";
import { useProjects } from "../lib/hooks";

export default function NewProjectModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const { mutate } = useProjects();
    const [formData, setFormData] = useState({
        name: "",
        repo_url: "",
        framework: "laravel",
        target: "vps",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/projects", formData);
            await mutate(); // Refresh projects list
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to create project");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0a0b0d] border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">New Project</h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">Project Name</label>
                        <input
                            required
                            type="text"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">Repository URL</label>
                        <input
                            required
                            type="url"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            value={formData.repo_url}
                            onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">Framework</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                value={formData.framework}
                                onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                            >
                                <option value="laravel">Laravel</option>
                                <option value="nextjs">Next.js</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">Target</label>
                            <select
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                value={formData.target}
                                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                            >
                                <option value="vps">VPS (SSH)</option>
                                <option value="cpanel">cPanel (SSH)</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-white/5">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">SSH Host IP</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="e.g., 192.168.1.50"
                                    value={(formData as any).ssh_host || ''}
                                    onChange={(e) => setFormData({ ...formData, ssh_host: e.target.value } as any)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">Port</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="22"
                                    value={(formData as any).ssh_port || ''}
                                    onChange={(e) => setFormData({ ...formData, ssh_port: e.target.value } as any)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">SSH User</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="root"
                                    value={(formData as any).ssh_user || ''}
                                    onChange={(e) => setFormData({ ...formData, ssh_user: e.target.value } as any)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">Remote Path</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                    placeholder="/var/www/html"
                                    value={(formData as any).remote_path || ''}
                                    onChange={(e) => setFormData({ ...formData, remote_path: e.target.value } as any)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white/40 uppercase mb-1.5">SSH Password (Optional)</label>
                            <input
                                type="password"
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                                placeholder="••••••••"
                                value={(formData as any).ssh_password || ''}
                                onChange={(e) => setFormData({ ...formData, ssh_password: e.target.value } as any)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-bold text-white/60 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
