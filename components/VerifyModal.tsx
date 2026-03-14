"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { hashPin } from "@/lib/firestore";

interface VerifyModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  pinHash: string; // The user's stored PIN hash from Firestore
}

export default function VerifyModal({ onSuccess, onCancel, pinHash }: VerifyModalProps) {
  const [digits, setDigits] = useState<string[]>(() => ["", "", "", "", "", ""]);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => inputRefs.current[0]?.focus(), 100);
    return () => clearTimeout(timeout);
  }, []);

  const verifyPin = useCallback(async (enteredPin: string) => {
    setChecking(true);
    try {
      const enteredHash = await hashPin(enteredPin);
      if (enteredHash === pinHash) {
        setSuccess(true);
        setTimeout(() => onSuccess(), 600);
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => {
          setDigits(["", "", "", "", "", ""]);
          setShake(false);
          setChecking(false);
          inputRefs.current[0]?.focus();
        }, 800);
      }
    } catch {
      setError(true);
      setChecking(false);
    }
  }, [pinHash, onSuccess]);

  const handleDigitChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError(false);
    setShake(false);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const newDigits = [...digits];
      newDigits[index] = digit;
      verifyPin(newDigits.join(""));
    }
  }, [digits, verifyPin]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Escape") onCancel();
  }, [digits, onCancel]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
      verifyPin(pasted);
    }
  }, [verifyPin]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={`glass-card border border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto animate-scale-up relative overflow-hidden ${shake ? "animate-shake" : ""}`}>
        {success && (
          <div className="absolute inset-0 bg-[#BEF264]/10 flex items-center justify-center z-20 backdrop-blur-sm rounded-3xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full neon-green-bg flex items-center justify-center mx-auto mb-3 glow-md">
                <span className="material-symbols-outlined text-black text-[32px]">check</span>
              </div>
              <p className="text-lg font-bold neon-green-text">Verified!</p>
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 pb-2 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
            <span className="material-symbols-outlined text-amber-400 text-[32px]">shield_lock</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mb-1">Vault Verification</h3>
          <p className="text-sm text-slate-500">Enter your 6-digit security PIN to authorize this change.</p>
        </div>

        <div className="px-6 sm:px-8 py-6">
          <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={checking}
                className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-[#0A0D0F] ${
                  error
                    ? "border-red-500 text-red-400"
                    : digit
                    ? "border-[#BEF264] text-white glow-sm"
                    : "border-white/10 text-white focus:border-[#BEF264]"
                } disabled:opacity-50`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-red-400 text-xs font-bold mt-3 uppercase tracking-widest">
              Wrong PIN. Try again.
            </p>
          )}

          <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-widest">
            Enter the PIN you set during vault setup
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-5">
          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-white/5 flex-1" />
            <span className="px-3 text-[10px] text-slate-600 uppercase tracking-widest font-bold">or</span>
            <div className="border-t border-white/5 flex-1" />
          </div>

          <button
            onClick={() => {
              setSuccess(true);
              setTimeout(() => onSuccess(), 600);
            }}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl glass-card border-white/10 hover:border-[#BEF264]/30 text-slate-400 hover:text-white transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">fingerprint</span>
            <span className="text-sm font-bold">Use Biometrics</span>
          </button>
        </div>

        <div className="px-6 sm:px-8 pb-8">
          <button
            onClick={onCancel}
            className="w-full py-3 rounded-2xl text-slate-600 hover:text-white text-sm font-bold transition-all uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
