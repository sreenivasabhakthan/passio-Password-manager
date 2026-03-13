"use client";
import { useAuth } from "@/components/AuthProvider";
import AuthScreen from "@/components/AuthScreen";
import SetupScreen from "@/components/SetupScreen";
import PassioApp from "@/components/PassioApp";

export default function Home() {
  const { user, profile, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050708]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl neon-green-bg flex items-center justify-center mx-auto mb-6 glow-md shield-pulse">
            <svg fill="none" height="32" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="32" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 4.8 17 6 19 6a1 1 0 0 1 1 1z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Opening the vault...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → Login screen
  if (!user) {
    return <AuthScreen />;
  }

  // Authenticated but no profile → First-time setup
  if (!profile) {
    return <SetupScreen />;
  }

  // Authenticated with profile → Main app (with lock screen)
  return <PassioApp />;
}
