"use client";

import { useState, useEffect } from "react";
import { Key, Lock, Unlock, Loader2 } from "lucide-react";
import api from "../lib/api";

export default function DevTools() {
    const [hasToken, setHasToken] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('deployr_token');
        setHasToken(!!token);
    }, []);

    const handleDevAuth = async () => {
        setLoading(true);
        const email = "admin@deployr.com";
        const password = "password";
        const name = "Admin User";

        try {
            // Try Login
            try {
                const loginRes = await api.post('/auth/login', { email, password });
                localStorage.setItem('deployr_token', loginRes.data.api_token);
                setHasToken(true);
                window.location.reload();
                return;
            } catch (e) {
                // If login fails, try register
                console.log("Login failed, trying registration...");
            }

            // Try Register
            const registerRes = await api.post('/auth/register', { name, email, password });
            localStorage.setItem('deployr_token', registerRes.data.api_token);
            setHasToken(true);
            window.location.reload();

        } catch (error) {
            console.error("Dev Auth Failed", error);
            alert("Dev Auth Failed. Check console.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('deployr_token');
        setHasToken(false);
        window.location.reload();
    };

    if (hasToken) {
        return (
            <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors">
                <Lock size={12} /> Dev Logout
            </button>
        );
    }

    return (
        <button
            onClick={handleDevAuth}
            disabled={loading}
            className="flex items-center gap-2 text-[10px] font-bold text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20"
        >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Unlock size={12} />}
            {loading ? "Authenticating..." : "Quick Auth (Dev)"}
        </button>
    );
}
