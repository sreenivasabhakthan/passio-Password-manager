"use client";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthScreen() {
  const { signInWithGoogle, sendRecoveryEmail } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("bhakthanvvasudeva@gmail.com");
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Sign in failed. Try again.");
      setIsSigningIn(false);
    }
  };

  const handleForgotSubmit = async () => {
    try {
      await sendRecoveryEmail(forgotEmail);
      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send recovery email.");
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-[#050708] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#BEF264] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#BEF264] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(190,242,100,0.03)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {showForgot ? (
          /* ═══ FORGOT PASSWORD ═══ */
          <div className="glass-card rounded-3xl p-10 border border-white/10 shadow-2xl animate-scale-up">
            <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-slate-500 hover:text-white transition-colors mb-6 flex items-center gap-1 text-sm">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-amber-400 text-[32px]">mail_lock</span>
              </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">Lost Magic Word?</h3>
                <p className="text-sm text-slate-500 mb-8">Don&apos;t worry, we&apos;ve all been there. Enter your registered email and we&apos;ll send your vault recovery ritual.</p>
            </div>

            {forgotSent ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full neon-green-bg flex items-center justify-center mx-auto mb-4 glow-md">
                  <span className="material-symbols-outlined text-black text-[28px]">check</span>
                </div>
                <p className="text-white font-bold mb-2">Recovery email sent!</p>
                <p className="text-sm text-slate-500">Check <span className="neon-green-text font-bold">{forgotEmail}</span> for the reset link.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Recovery Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#0A0D0F] border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:ring-1 focus:ring-[#BEF264] focus:border-[#BEF264] outline-none transition-all"
                  />
                </div>
                <button
                  onClick={handleForgotSubmit}
                  className="w-full py-3.5 rounded-2xl neon-green-bg text-black font-bold text-sm hover:bg-[#D9F99D] transition-all glow-sm"
                >
                  Send Recovery Link
                </button>
              </>
            )}
          </div>
        ) : (
          /* ═══ MAIN LOGIN ═══ */
          <div className="glass-card rounded-3xl p-10 border border-white/10 shadow-2xl animate-scale-up">
            {/* Logo */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-md shield-pulse overflow-hidden bg-[#BEF264]">
                <img src="/logo.png" alt="Passio Logo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Passio</h1>
              <p className="text-sm text-slate-500 font-medium">The Digital Hoard</p>
              <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">Your secrets. Everywhere. Securely.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isSigningIn ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-white/5 flex-1" />
              <span className="px-4 text-[10px] text-slate-600 uppercase tracking-widest font-bold">Secured by Firebase</span>
              <div className="border-t border-white/5 flex-1" />
            </div>

            {/* Forgot Password */}
            <button
              onClick={() => setShowForgot(true)}
              className="w-full text-center text-xs text-slate-500 hover:text-[#BEF264] transition-colors font-medium"
            >
              Forgot vault access? <span className="underline">Recover here</span>
            </button>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-700 uppercase tracking-widest">
                End-to-end encrypted • Zero-knowledge architecture
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
