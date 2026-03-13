"use client";
import { MOCK_ENTRIES, PasswordEntry } from "./data/mockData";

type Section = "all" | "favorites" | "passwords" | "notes" | "cards" | "identities" | "health" | "generator" | "trash";

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (s: Section) => void;
  entries: PasswordEntry[];
  onLock: () => void;
}

const NAV_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: "all", icon: "grid_view", label: "The Whole Hoard" },
  { id: "favorites", icon: "favorite", label: "Top Secret Snacks" },
  { id: "passwords", icon: "password", label: "Magic Words" },
  { id: "notes", icon: "description", label: "Drunken Ramblings" },
];

const TOOL_ITEMS: { id: Section; icon: string; label: string }[] = [
  { id: "health", icon: "shield", label: "Password Health" },
  { id: "generator", icon: "casino", label: "Generator" },
  { id: "trash", icon: "delete", label: "Graveyard" },
];

export default function Sidebar({ activeSection, onSectionChange, entries, onLock }: SidebarProps) {
  const totalLoot = entries.length;
  const wetNoodles = entries.filter((e) => e.strength === "Weak").length;
  const protectedCount = entries.filter((e) => e.has2FA).length;
  const protectedPct = totalLoot > 0 ? Math.round((protectedCount / totalLoot) * 100) : 0;

  return (
    <aside className="w-16 lg:w-72 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#080A0C] p-3 lg:p-6 transition-all duration-300 transform-gpu">
      {/* Logo */}
      <div
        className="flex items-center gap-3 mb-10 px-2 cursor-pointer"
        onClick={() => onSectionChange("all")}
      >
        <div className="w-8 h-8 rounded-lg neon-green-bg flex items-center justify-center glow-sm flex-shrink-0">
          <svg fill="none" height="20" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 4.8 17 6 19 6a1 1 0 0 1 1 1z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <span className="text-lg font-bold tracking-tight text-white leading-tight hidden lg:block">
          Passio: The Digital Hoard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              title={label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/5 text-white border-l-2 neon-green-border"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${isActive ? "neon-green-text" : ""}`}>
                {icon}
              </span>
              <span className="text-sm font-medium hidden lg:block">{label}</span>
            </button>
          );
        })}

        <div className="border-t border-white/5 my-3 mx-1" />

        {TOOL_ITEMS.map(({ id, icon, label }) => {
          const isActive = activeSection === id;
          const showBadge = id === "health" && wetNoodles > 0;
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              title={label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white/5 text-white border-l-2 neon-green-border"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] flex-shrink-0 ${isActive ? "neon-green-text" : ""}`}>
                {icon}
              </span>
              <span className="text-sm font-medium hidden lg:block flex-1 text-left">{label}</span>
              {showBadge && (
                <span className="text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {wetNoodles}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats Card + Lock */}
      <div className="mt-auto space-y-3">
        <div className="glass-card rounded-xl p-4 border border-white/10 hidden lg:block">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Hoard Health</span>
            <div className="w-2 h-2 rounded-full neon-green-bg glow-sm"></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Loot</span>
              <span className="font-bold text-white">{totalLoot}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Wet Noodles</span>
              <span className="font-bold text-red-400">{wetNoodles}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">2FA Protected</span>
              <span className="font-bold neon-green-text">{protectedPct}%</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-[14px]">sync</span>
            <span className="text-[10px] text-slate-500 font-medium">Synced 2m ago</span>
          </div>
        </div>

        {/* Lock Vault Button */}
        <button
          onClick={onLock}
          title="Lock Vault"
          className="w-full flex items-center justify-center lg:justify-start gap-2 px-3 py-2.5 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[20px]">lock</span>
          <span className="text-xs font-bold uppercase tracking-widest hidden lg:block">Lock Vault</span>
        </button>
      </div>
    </aside>
  );
}
