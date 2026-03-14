"use client";

import Image from "next/image";
import { PasswordEntry } from "./data/mockData";

type Section = "all" | "favorites" | "passwords" | "notes" | "cards" | "identities" | "health" | "generator" | "trash";

interface MobileVaultHomeProps {
  entries: PasswordEntry[];
  filteredEntries: PasswordEntry[];
  activeSection: Section;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelect: (entry: PasswordEntry) => void;
  onOpenAdd: () => void;
  onOpenHealth: () => void;
  onOpenGenerator: () => void;
  onToggleFavorite: (id: string) => void;
  onSectionChange: (section: Section) => void;
  onLock: () => void;
}

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "all", label: "My Vault", icon: "grid_view" },
  { id: "favorites", label: "Favorites", icon: "favorite" },
  { id: "passwords", label: "Passwords", icon: "password" },
  { id: "notes", label: "Notes", icon: "description" },
];

function getEntryGlyph(entry: PasswordEntry) {
  if (entry.name[0]) return entry.name[0].toUpperCase();
  return "P";
}

function getStatusColor(entry: PasswordEntry) {
  if (entry.breached) return "bg-red-500";
  if (entry.strength === "Weak") return "bg-red-500";
  if (entry.strength === "Medium") return "bg-amber-400";
  return "bg-[#BEF264]";
}

export default function MobileVaultHome({
  entries,
  filteredEntries,
  activeSection,
  searchQuery,
  onSearchChange,
  onSelect,
  onOpenAdd,
  onOpenHealth,
  onOpenGenerator,
  onToggleFavorite,
  onSectionChange,
  onLock,
}: MobileVaultHomeProps) {
  const weakPasswords = entries.filter((entry) => entry.strength === "Weak").length;
  const twoFactorCount = entries.filter((entry) => entry.has2FA).length;
  const twoFactorPercentage = entries.length > 0 ? Math.round((twoFactorCount / entries.length) * 100) : 0;

  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between border-b border-white/5 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="relative rounded-lg bg-[#BEF264] p-1.5">
            <Image src="/logo.png" alt="Passio Logo" width={24} height={24} className="rounded-md object-cover" />
          </div>
          <h1 className="text-lg font-bold leading-tight">Passio</h1>
        </div>
        <button onClick={onOpenGenerator} className="p-2 text-slate-500">
          <span className="material-symbols-outlined text-[24px]">tune</span>
        </button>
      </header>

      <nav className="no-scrollbar flex gap-3 overflow-x-auto border-b border-white/5 px-4 py-4">
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition ${
                active ? "border border-[#BEF264]/20 bg-[#BEF264]/10 text-[#BEF264]" : "text-slate-500"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 pb-28">
        <section className="mb-6">
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search..."
              className="w-full rounded-lg border-none bg-[#141414] py-3 pl-10 pr-4 text-sm text-white outline-none focus:ring-1 focus:ring-[#BEF264]"
            />
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            {activeSection === "favorites" ? "Favorites" : activeSection === "passwords" ? "Passwords" : activeSection === "notes" ? "Notes" : "My Vault"}
          </h2>

          {filteredEntries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#141414] p-4 text-left active:bg-white/5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-[#0a0a0a] font-bold text-white">
                  {getEntryGlyph(entry)}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">{entry.name}</div>
                  <div className="truncate text-xs text-slate-500">{entry.username}</div>
                </div>
              </div>
              <div className="ml-3 flex items-center gap-3">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(entry.id);
                  }}
                  className={entry.isFavorite ? "text-yellow-400" : "text-slate-600"}
                >
                  <span className="material-symbols-outlined text-[18px]">{entry.isFavorite ? "star" : "star_border"}</span>
                </button>
                <div className={`h-2 w-2 rounded-full ${getStatusColor(entry)}`} />
              </div>
            </button>
          ))}

          {filteredEntries.length === 0 && (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-slate-500">
              No items match this search yet.
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-white/5 bg-[#141414] p-4">
          <div className="mb-4 flex items-start justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Security Overview</h3>
            <div className="h-2 w-2 rounded-full bg-[#BEF264]" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total Items</span>
              <span className="font-bold">{entries.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Weak Passwords</span>
              <span className="font-bold text-red-400">{weakPasswords}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">2FA Enabled</span>
              <span className="font-bold text-[#BEF264]">{twoFactorPercentage}%</span>
            </div>
          </div>
          <button
            onClick={onOpenHealth}
            className="mt-4 flex items-center gap-1 border-t border-white/5 pt-3 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500"
          >
            <span className="material-symbols-outlined text-[14px]">sync</span>
            Synced 2m ago
          </button>
        </section>
      </main>

      <div className="fixed bottom-24 right-5 z-20">
        <button
          onClick={onOpenAdd}
          className="rounded-2xl bg-[#BEF264] p-4 text-black shadow-xl shadow-[#BEF264]/20 transition hover:scale-105"
        >
          <span className="material-symbols-outlined text-[24px]">add</span>
        </button>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 flex justify-around border-t border-white/5 bg-[#141414] px-2 py-3 pb-6 safe-area-inset-bottom">
        <button
          onClick={() => onSectionChange("all")}
          className={`flex flex-col items-center gap-1 ${activeSection === "all" ? "text-[#BEF264]" : "text-slate-500"}`}
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
          <span className="text-[10px] font-bold">Vault</span>
        </button>
        <button onClick={onOpenHealth} className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-[24px]">shield</span>
          <span className="text-[10px] font-bold">Security</span>
        </button>
        <button onClick={onOpenGenerator} className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-[24px]">build</span>
          <span className="text-[10px] font-bold">Tools</span>
        </button>
        <button onClick={onLock} className="flex flex-col items-center gap-1 text-slate-500">
          <span className="material-symbols-outlined text-[24px]">lock</span>
          <span className="text-[10px] font-bold">Lock</span>
        </button>
      </footer>
    </div>
  );
}
