"use client";
import { useMemo } from "react";
import { PasswordEntry } from "./data/mockData";

interface HealthPanelProps {
  entries: PasswordEntry[];
  onSelect: (entry: PasswordEntry) => void;
}

function HealthCard({ title, icon, count, color, children }: {
  title: string; icon: string; count: number; color: string; children: React.ReactNode;
}) {
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{count} {count === 1 ? "item" : "items"}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function HealthPanel({ entries, onSelect }: HealthPanelProps) {
  const weakEntries = useMemo(() => entries.filter((e) => e.strength === "Weak"), [entries]);
  const reusedEntries = useMemo(() => entries.filter((e) => e.reused), [entries]);
  const no2FAEntries = useMemo(() => entries.filter((e) => !e.has2FA), [entries]);
  const oldEntries = useMemo(() => {
    // Simulate: entries whose lastChanged is > 90 days ago
    // Since mock data has date strings, we'll check by simple parsing
    return entries.filter((e) => {
      try {
        const changed = new Date(e.lastChanged);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - changed.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays > 90;
      } catch {
        return false;
      }
    });
  }, [entries]);

  const totalIssues = weakEntries.length + reusedEntries.length + no2FAEntries.length + oldEntries.length;
  const healthScore = entries.length > 0
    ? Math.max(0, Math.round(100 - (totalIssues / entries.length) * 100))
    : 100;

  const EntryRow = ({ entry }: { entry: PasswordEntry }) => (
    <button
      onClick={() => onSelect(entry)}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-200 text-left group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#0F1419] flex items-center justify-center border border-white/5 flex-shrink-0">
        <span className="text-xs font-bold text-slate-500">{entry.name[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{entry.name}</p>
        <p className="text-xs text-slate-500 truncate">{entry.username}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
        entry.strength === "Weak" ? "bg-red-500/10 text-red-400" :
        entry.strength === "Medium" ? "bg-amber-500/10 text-amber-400" :
        "bg-green-500/10 text-green-400"
      }`}>{entry.strengthScore}</span>
      <span className="material-symbols-outlined text-[14px] text-slate-700 group-hover:text-[#BEF264] transition-colors">chevron_right</span>
    </button>
  );

  return (
    <section className="flex-1 overflow-y-auto bg-[#050708] p-4 sm:p-6 lg:p-10 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BEF264] opacity-[0.03] blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 sm:mb-10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl neon-green-bg flex items-center justify-center glow-md flex-shrink-0">
            <span className="material-symbols-outlined text-black text-[28px]">shield</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Password Health</h1>
            <p className="text-sm text-slate-500">A brutally honest checkup of your digital hygiene.</p>
          </div>
        </div>

        {/* Score Overview */}
        <div className="glass-card rounded-3xl p-5 sm:p-8 mb-8 border border-white/10 flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8">
          <div className="relative w-24 h-24 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="16" fill="none" strokeLinecap="round" strokeWidth="3"
                stroke={healthScore > 70 ? "#BEF264" : healthScore > 40 ? "#D97706" : "#DC2626"}
                strokeDasharray={`${healthScore} ${100 - healthScore}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-2xl font-bold text-white">{healthScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">
              {healthScore > 80 ? "Looking pretty good!" : healthScore > 50 ? "Room for improvement..." : "We need to talk."}
            </h2>
            <p className="text-sm text-slate-500">
              {totalIssues === 0
                ? "Your digital fortress is well-guarded. No issues found."
                : `Found ${totalIssues} issue${totalIssues > 1 ? "s" : ""} across your hoard that need attention.`}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center flex-shrink-0 w-full lg:w-auto">
            <div className="glass-card rounded-xl p-3 border border-white/5">
              <span className="text-2xl font-bold text-red-400 block">{weakEntries.length}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Weak</span>
            </div>
            <div className="glass-card rounded-xl p-3 border border-white/5">
              <span className="text-2xl font-bold text-amber-400 block">{reusedEntries.length}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Reused</span>
            </div>
            <div className="glass-card rounded-xl p-3 border border-white/5">
              <span className="text-2xl font-bold text-yellow-400 block">{oldEntries.length}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Old</span>
            </div>
            <div className="glass-card rounded-xl p-3 border border-white/5">
              <span className="text-2xl font-bold neon-green-text block">{no2FAEntries.length}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">No 2FA</span>
            </div>
          </div>
        </div>

        {/* Issue Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HealthCard title="Wet Noodles (Weak)" icon="dangerous" count={weakEntries.length} color="bg-red-500/10 text-red-400">
            <div className="space-y-1">
              {weakEntries.length === 0 ? (
                <p className="text-sm text-slate-600 italic py-3">No weak passwords. You absolute legend.</p>
              ) : weakEntries.map((e) => <EntryRow key={e.id} entry={e} />)}
            </div>
          </HealthCard>

          <HealthCard title="Copy-Paste Artists (Reused)" icon="content_copy" count={reusedEntries.length} color="bg-amber-500/10 text-amber-400">
            <div className="space-y-1">
              {reusedEntries.length === 0 ? (
                <p className="text-sm text-slate-600 italic py-3">No reused passwords. Impressive discipline.</p>
              ) : reusedEntries.map((e) => <EntryRow key={e.id} entry={e} />)}
            </div>
          </HealthCard>

          <HealthCard title="Ancient Relics (90+ Days Old)" icon="schedule" count={oldEntries.length} color="bg-yellow-500/10 text-yellow-400">
            <div className="space-y-1">
              {oldEntries.length === 0 ? (
                <p className="text-sm text-slate-600 italic py-3">All passwords are fresh. Nice rotation habit.</p>
              ) : oldEntries.map((e) => <EntryRow key={e.id} entry={e} />)}
            </div>
          </HealthCard>

          <HealthCard title="Flying Solo (No 2FA)" icon="shield" count={no2FAEntries.length} color="bg-green-500/10 neon-green-text">
            <div className="space-y-1">
              {no2FAEntries.length === 0 ? (
                <p className="text-sm text-slate-600 italic py-3">Everything has 2FA. You beautiful paranoiac.</p>
              ) : no2FAEntries.map((e) => <EntryRow key={e.id} entry={e} />)}
            </div>
          </HealthCard>
        </div>
      </div>
    </section>
  );
}
