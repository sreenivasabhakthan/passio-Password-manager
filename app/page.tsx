"use client";
import Image from "next/image";
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
          <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#BEF264] glow-md shield-pulse">
            <Image src="/logo.png" alt="Passio Logo" fill sizes="64px" className="object-cover" />
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
