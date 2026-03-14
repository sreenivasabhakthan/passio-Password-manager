"use client";
import Image from "next/image";
import { useState } from "react";
import { hashPin } from "@/lib/firestore";

interface LockScreenProps {
  onUnlock: () => void;
  masterPasswordHash: string;
}

export default function LockScreen({ onUnlock, masterPasswordHash }: LockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    setError(false);
    
    try {
      const enteredHash = await hashPin(password);
      // If we have a hash to check against
      if (masterPasswordHash) {
        if (enteredHash === masterPasswordHash) {
          onUnlock();
        } else {
          setError(true);
        }
      } else {
        // Fallback for demo/initial load if hash isn't ready
        if (password.length >= 4) {
          onUnlock();
        } else {
          setError(true);
        }
      }
    } catch (err) {
      console.error("Unlock error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050708] flex items-center justify-center z-50 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#BEF264] opacity-[0.05] blur-[150px] rounded-full pointer-events-none"></div>
      
      <div className="relative w-full max-w-sm mx-4">
        <div className="glass-card border border-white/10 rounded-3xl shadow-2xl p-6 sm:p-10 text-center backdrop-blur-2xl">
          {/* Shield icon */}
          <div className="mb-10 flex justify-center">
            <div className="shield-pulse relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border border-[#BEF264]/30 bg-[#BEF264]/10 p-2 glow-sm">
              <Image src="/logo.png" alt="Passio Logo" fill sizes="96px" className="rounded-2xl object-cover p-2" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Passio</h1>
          <p className="text-slate-500 text-sm mb-10">The hoard is currently sealed. Prove your worth to enter.</p>

          <div className="mb-6">
            <div className={`relative flex items-center bg-[#0A0D0F] border rounded-2xl transition-all duration-300 ${
              error ? "border-red-500/50 ring-1 ring-red-500/20" : "border-white/10 focus-within:border-[#BEF264] focus-within:ring-1 focus-within:ring-[#BEF264]/20"
            }`}>
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                placeholder="Master Magic Word"
                autoFocus
                className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder-slate-600 outline-none"
              />
              <button
                onClick={() => setShowPwd(!showPwd)}
                className="px-4 text-slate-500 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">{showPwd ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-400 mt-3 text-left font-medium">That magic word is weak. Try again.</p>
            )}
          </div>

          <button
            onClick={handleUnlock}
            disabled={!password || loading}
            className="w-full py-4 rounded-2xl bg-[#BEF264] hover:bg-[#D9F99D] text-black font-bold text-sm transition-all duration-300 shadow-lg shadow-[#BEF264]/20 disabled:opacity-50 disabled:cursor-not-allowed mb-6 uppercase tracking-widest"
          >
            {loading ? "Revealing Hoard..." : "Infiltrate"}
          </button>

          <div className="flex flex-col gap-4">
            <button
              onClick={onUnlock}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[18px]">fingerprint</span>
              Biometric Ritual
            </button>
            
            <button className="text-[10px] text-slate-600 hover:text-[#BEF264] transition-colors uppercase tracking-widest font-bold">
              Forgot the magic word?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
