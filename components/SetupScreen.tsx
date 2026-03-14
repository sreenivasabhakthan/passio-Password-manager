"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "./AuthProvider";
import { createUserProfile, hashPin } from "@/lib/firestore";

type Step = "welcome" | "master_password" | "pin" | "confirm_pin" | "done";

export default function SetupScreen() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>("welcome");
  const [masterPassword, setMasterPassword] = useState("");
  const [confirmMaster, setConfirmMaster] = useState("");
  const [showMaster, setShowMaster] = useState(false);
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmPinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === "pin") setTimeout(() => pinRefs.current[0]?.focus(), 100);
    if (step === "confirm_pin") setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
  }, [step]);

  const handlePinDigit = useCallback((index: number, value: string, isPrimary: boolean) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const setter = isPrimary ? setPin : setConfirmPin;
    const refs = isPrimary ? pinRefs : confirmPinRefs;

    setter((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError("");

    if (digit && index < 5) {
      refs.current[index + 1]?.focus();
    }
  }, []);

  const handlePinKeyDown = useCallback((index: number, e: React.KeyboardEvent, isPrimary: boolean) => {
    const current = isPrimary ? pin : confirmPin;
    const refs = isPrimary ? pinRefs : confirmPinRefs;
    if (e.key === "Backspace" && !current[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  }, [pin, confirmPin]);

  const handleMasterNext = () => {
    if (masterPassword.length < 8) {
      setError("Master password must be at least 8 characters.");
      return;
    }
    if (masterPassword !== confirmMaster) {
      setError("Passwords don&apos;t match.");
      return;
    }
    setError("");
    setStep("pin");
  };

  const handlePinNext = () => {
    const entered = pin.join("");
    if (entered.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setError("");
    setStep("confirm_pin");
  };

  const handleConfirmPin = async () => {
    const original = pin.join("");
    const confirm = confirmPin.join("");
    if (original !== confirm) {
      setError("PINs don&apos;t match. Try again.");
      setConfirmPin(["", "", "", "", "", ""]);
      setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
      return;
    }

    if (!user) return;
    setSaving(true);
    setError("");
    try {
      const pinHash = await hashPin(original);
      const masterHash = await hashPin(masterPassword);
      await createUserProfile(user.uid, {
        email: user.email || "",
        displayName: user.displayName || "",
        pinHash,
        masterPasswordHash: masterHash,
        recoveryEmail: user.email || "bhakthanvvasudeva@gmail.com",
      });
      await refreshProfile();
      setStep("done");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to save profile."));
      setSaving(false);
    }
  };

  // Strength calculation for master password
  const getStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s += 20;
    if (pwd.length >= 12) s += 15;
    if (pwd.length >= 20) s += 10;
    if (/[A-Z]/.test(pwd)) s += 15;
    if (/[a-z]/.test(pwd)) s += 10;
    if (/[0-9]/.test(pwd)) s += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) s += 15;
    return Math.min(s, 100);
  };

  const masterStrength = getStrength(masterPassword);

  return (
    <div className="h-full flex items-center justify-center bg-[#050708] relative overflow-hidden px-4 py-6 sm:px-6">
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#BEF264] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
        {/* ═══ WELCOME ═══ */}
        {step === "welcome" && (
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl animate-scale-up text-center">
            <div className="w-20 h-20 rounded-2xl neon-green-bg flex items-center justify-center mx-auto mb-6 glow-md">
              <span className="material-symbols-outlined text-black text-[40px]">waving_hand</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Welcome to the Hoard!</h1>
            <p className="text-sm text-slate-500 mb-2">Hey <span className="neon-green-text font-bold">{user?.displayName || "adventurer"}</span>,</p>
            <p className="text-sm text-slate-500 mb-8">Let&apos;s set up your vault security. This only takes a minute.</p>

            <div className="space-y-3 text-left glass-card rounded-2xl p-6 border border-white/5 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#BEF264]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined neon-green-text text-[18px]">lock</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Step 1: Master Password</p>
                  <p className="text-[10px] text-slate-500">The key to your kingdom</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#BEF264]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined neon-green-text text-[18px]">pin</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Step 2: 6-Digit PIN</p>
                  <p className="text-[10px] text-slate-500">Quick access for sensitive actions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#BEF264]/10 flex items-center justify-center">
                  <span className="material-symbols-outlined neon-green-text text-[18px]">fingerprint</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Step 3: Biometrics (Optional)</p>
                  <p className="text-[10px] text-slate-500">For when you&apos;re feeling fancy</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("master_password")}
              className="w-full py-3.5 rounded-2xl neon-green-bg text-black font-bold text-sm hover:bg-[#D9F99D] transition-all glow-sm"
            >
              Let&apos;s Secure This Hoard →
            </button>
          </div>
        )}

        {/* ═══ MASTER PASSWORD ═══ */}
        {step === "master_password" && (
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl animate-scale-up">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep("welcome")} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Step 1 of 2</p>
                <h2 className="text-xl font-bold text-white">Create Master Password</h2>
              </div>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Master Password</label>
                <div className="relative">
                  <input
                    type={showMaster ? "text" : "password"}
                    value={masterPassword}
                    onChange={(e) => { setMasterPassword(e.target.value); setError(""); }}
                    placeholder="Something you&apos;ll never forget..."
                    className="w-full bg-[#0A0D0F] border border-white/10 rounded-xl py-3 px-4 pr-12 text-white text-sm focus:ring-1 focus:ring-[#BEF264] focus:border-[#BEF264] outline-none transition-all"
                  />
                  <button
                    onClick={() => setShowMaster(!showMaster)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showMaster ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
                {/* Strength bar */}
                {masterPassword && (
                  <div className="mt-3">
                    <div className="h-1.5 w-full bg-[#161B22] rounded-full overflow-hidden flex gap-0.5">
                      {[25, 50, 75, 100].map((step) => (
                        <div key={step} className={`h-full transition-all duration-500 ${
                          masterStrength >= step - 12
                            ? masterStrength > 75 ? "neon-green-bg" : masterStrength > 50 ? "bg-amber-500" : "bg-red-500"
                            : "bg-slate-800"
                        }`} style={{ width: "25%" }} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">
                      {masterStrength > 75 ? "💪 Strong" : masterStrength > 50 ? "😐 Decent" : "😬 Weak — try harder"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmMaster}
                  onChange={(e) => { setConfirmMaster(e.target.value); setError(""); }}
                  placeholder="Type it again, memory check..."
                  className="w-full bg-[#0A0D0F] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:ring-1 focus:ring-[#BEF264] focus:border-[#BEF264] outline-none transition-all"
                />
                {confirmMaster && masterPassword && confirmMaster === masterPassword && (
                  <p className="text-[10px] neon-green-text mt-1 font-bold">✓ Passwords match</p>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleMasterNext}
              disabled={!masterPassword || !confirmMaster}
              className="w-full py-3.5 rounded-2xl neon-green-bg text-black font-bold text-sm hover:bg-[#D9F99D] transition-all glow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next: Set Your PIN →
            </button>
          </div>
        )}

        {/* ═══ SET PIN ═══ */}
        {step === "pin" && (
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl animate-scale-up text-center">
            <div className="flex items-center gap-3 mb-8 text-left">
              <button onClick={() => setStep("master_password")} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Step 2 of 2</p>
                <h2 className="text-xl font-bold text-white">Set Your 6-Digit PIN</h2>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-8">This PIN will be required for sensitive actions like changing passwords.</p>

            <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-6">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { pinRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinDigit(i, e.target.value, true)}
                  onKeyDown={(e) => handlePinKeyDown(i, e, true)}
                  className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-[#0A0D0F] ${
                    digit ? "border-[#BEF264] text-white glow-sm" : "border-white/10 text-white focus:border-[#BEF264]"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-xs mb-4 font-bold">{error}</p>}

            <button
              onClick={handlePinNext}
              disabled={pin.join("").length < 6}
              className="w-full py-3.5 rounded-2xl neon-green-bg text-black font-bold text-sm hover:bg-[#D9F99D] transition-all glow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next: Confirm PIN →
            </button>
          </div>
        )}

        {/* ═══ CONFIRM PIN ═══ */}
        {step === "confirm_pin" && (
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl animate-scale-up text-center">
            <div className="flex items-center gap-3 mb-8 text-left">
              <button onClick={() => { setStep("pin"); setConfirmPin(["","","","","",""]); }} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              </button>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Confirm</p>
                <h2 className="text-xl font-bold text-white">Re-enter Your PIN</h2>
              </div>
            </div>

            <p className="text-sm text-slate-500 mb-8">Enter the same PIN again to confirm.</p>

            <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-6">
              {confirmPin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { confirmPinRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinDigit(i, e.target.value, false)}
                  onKeyDown={(e) => handlePinKeyDown(i, e, false)}
                  className={`w-full h-12 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-[#0A0D0F] ${
                    digit ? "border-[#BEF264] text-white glow-sm" : "border-white/10 text-white focus:border-[#BEF264]"
                  }`}
                />
              ))}
            </div>

            {error && <p className="text-red-400 text-xs mb-4 font-bold">{error}</p>}

            <button
              onClick={handleConfirmPin}
              disabled={confirmPin.join("").length < 6 || saving}
              className="w-full py-3.5 rounded-2xl neon-green-bg text-black font-bold text-sm hover:bg-[#D9F99D] transition-all glow-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Securing your vault...
                </>
              ) : (
                "Complete Setup ✨"
              )}
            </button>
          </div>
        )}

        {/* ═══ DONE ═══ */}
        {step === "done" && (
          <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl animate-scale-up text-center">
            <div className="w-20 h-20 rounded-full neon-green-bg flex items-center justify-center mx-auto mb-6 glow-md">
              <span className="material-symbols-outlined text-black text-[40px]">verified</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Vault Secured! 🎉</h2>
            <p className="text-sm text-slate-500 mb-2">Your master password and PIN are set.</p>
            <p className="text-sm text-slate-500 mb-8">
              Recovery email: <span className="neon-green-text font-bold">{user?.email}</span>
            </p>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-6">Redirecting to your hoard...</p>
            <div className="w-8 h-8 border-2 border-[#BEF264]/30 border-t-[#BEF264] rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
  const getErrorMessage = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback;
