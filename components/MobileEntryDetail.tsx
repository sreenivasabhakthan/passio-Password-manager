"use client";

import { useState } from "react";
import { PasswordEntry } from "./data/mockData";
import { buildChecklist, calculateStrength, getStrengthLabel } from "./data/entryUtils";

interface MobileEntryDetailProps {
  entry: PasswordEntry;
  isTrash?: boolean;
  onBack: () => void;
  onCopy: (text: string, label: string) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  onUpdate: (updated: PasswordEntry, original: PasswordEntry) => void;
  onToggleFavorite: (id: string) => void;
  onShowGenerator: () => void;
}

function ChecklistRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`flex h-4 w-4 items-center justify-center rounded-full ${ok ? "bg-[#BEF264]" : "bg-red-500/20"}`}>
        <span className={`material-symbols-outlined text-[11px] ${ok ? "text-black" : "text-red-400"}`}>
          {ok ? "check" : "close"}
        </span>
      </div>
      <span className="text-xs text-slate-400">{label}</span>
    </li>
  );
}

export default function MobileEntryDetail({
  entry,
  isTrash,
  onBack,
  onCopy,
  onDelete,
  onRestore,
  onUpdate,
  onToggleFavorite,
  onShowGenerator,
}: MobileEntryDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    name: entry.name,
    username: entry.username,
    website: entry.website,
    password: entry.password,
    notes: entry.notes,
  });

  const previewScore = calculateStrength(form.password);
  const previewStrength = getStrengthLabel(previewScore);

  const saveChanges = () => {
    const updated: PasswordEntry = {
      ...entry,
      ...form,
      website: form.website.replace(/^https?:\/\//, ""),
      strengthScore: previewScore,
      strength: previewStrength,
      checklist: buildChecklist(form.password),
      lastChanged: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    };
    onUpdate(updated, entry);
    setIsEditing(false);
  };

  return (
    <div className="min-h-full overflow-y-auto bg-[#0d1117] px-4 py-5 pb-24 text-white">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back
        </button>
        <button onClick={() => onToggleFavorite(entry.id)} className={entry.isFavorite ? "text-yellow-400" : "text-slate-500"}>
          <span className="material-symbols-outlined text-[22px]">{entry.isFavorite ? "star" : "star_border"}</span>
        </button>
      </div>

      <section className="mb-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#161b22]">
              <span className="material-symbols-outlined text-[32px] text-slate-400">language</span>
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-3">
                {isEditing ? (
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="min-w-0 border-b border-[#BEF264] bg-transparent text-2xl font-bold outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-bold tracking-tight">{entry.name}</h1>
                )}
                <span className="rounded border border-[#BEF264]/30 bg-[#BEF264]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#BEF264]">
                  {entry.category}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                <span>Last modified: <b className="text-white">{entry.lastChanged}</b></span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isTrash ? (
              <button onClick={() => onRestore?.(entry.id)} className="rounded-xl bg-[#BEF264] px-4 py-2 text-sm font-bold text-black">
                Restore
              </button>
            ) : isEditing ? (
              <>
                <button onClick={saveChanges} className="rounded-xl bg-[#BEF264] px-4 py-2 text-sm font-bold text-black">Save</button>
                <button onClick={() => setIsEditing(false)} className="rounded-xl border border-white/10 bg-[#161b22] px-4 py-2 text-sm font-bold">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="rounded-xl border border-white/10 bg-[#161b22] px-4 py-2 text-sm font-bold">Edit</button>
                <a href={`https://${entry.website}`} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-[#161b22] p-2">
                  <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                </a>
                <button onClick={() => setShowDeleteConfirm(true)} className="rounded-xl border border-white/10 bg-[#161b22] p-2 text-slate-400 hover:text-red-400">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <h4 className="mb-1 font-bold text-red-400">Move this item to the Graveyard?</h4>
            <p className="mb-4 text-sm text-slate-400">You can restore it later from trash.</p>
            <div className="flex gap-2">
              <button onClick={() => onDelete(entry.id)} className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white">
                Delete
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-slate-400">
                Cancel
              </button>
            </div>
          </div>
        )}

        {entry.breached && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <span className="material-symbols-outlined mt-0.5 text-[24px] text-amber-400">warning</span>
            <div>
              <h4 className="mb-1 font-bold text-amber-400">Security Alert: Data Breach Found</h4>
              <p className="text-sm leading-relaxed text-slate-400">
                This account&apos;s email address appeared in a known data breach. We recommend changing your password.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Username</label>
              {isEditing ? (
                <input
                  value={form.username}
                  onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#161b22] p-4 text-white outline-none"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161b22] p-4">
                  <span className="min-w-0 flex-1 break-all text-white">{entry.username}</span>
                  <button onClick={() => onCopy(entry.username, "Username")} className="text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Password</label>
              <div className="relative mb-3">
                {isEditing ? (
                  <input
                    value={form.password}
                    onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-xl border border-white/10 bg-[#161b22] p-4 pr-24 text-white outline-none"
                  />
                ) : (
                  <input
                    readOnly
                    value={showPassword ? entry.password : "•".repeat(Math.min(entry.password.length, 18))}
                    className="w-full rounded-xl border border-white/10 bg-[#161b22] p-4 pr-24 text-slate-400 outline-none"
                  />
                )}
                <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-4">
                  <button onClick={() => setShowPassword((value) => !value)} className="text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button onClick={() => onCopy(isEditing ? form.password : entry.password, "Password")} className="text-slate-500 hover:text-white">
                    <span className="material-symbols-outlined text-[20px]">content_copy</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-[#161b22]">
                  <div className={`transition-all ${previewScore >= 80 ? "bg-[#BEF264]" : previewScore >= 50 ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${previewScore}%` }} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-[0.24em] ${previewScore >= 80 ? "text-[#BEF264]" : previewScore >= 50 ? "text-amber-400" : "text-red-400"}`}>
                  Strength: {previewStrength}
                </span>
              </div>
              {!isTrash && (
                <button onClick={onShowGenerator} className="mt-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#BEF264]">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  Generate stronger password
                </button>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Website</label>
              {isEditing ? (
                <input
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#161b22] p-4 text-white outline-none"
                />
              ) : (
                <a href={`https://${entry.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-lg font-bold text-[#BEF264] hover:underline">
                  {entry.website}
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              )}
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Notes</label>
              {isEditing ? (
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-[#161b22] p-4 text-white outline-none"
                />
              ) : (
                <div className="rounded-xl border border-white/10 bg-[#161b22] p-4 text-sm text-slate-400">
                  {entry.notes || "No notes saved for this item."}
                </div>
              )}
            </div>

            {entry.passwordHistory.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-[#161b22] p-6">
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Password History</label>
                <div className="space-y-3">
                  {entry.passwordHistory.map((item, index) => (
                    <div key={`${item.date}-${index}`} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 p-3">
                      <span className="text-xs text-slate-400">Changed {item.date}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">{item.strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {entry.hasTotp && (
              <div className="rounded-3xl border border-white/10 bg-[#161b22] p-6">
                <label className="mb-4 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Verification Code (TOTP)</label>
                <div className="mb-4 flex justify-between text-5xl font-black tracking-tighter">
                  <span>{entry.id.padStart(3, "4").slice(0, 3)}</span>
                  <span>{entry.id.padStart(6, "8").slice(3, 6)}</span>
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-slate-500">Expires in 24 seconds</p>
              </div>
            )}

            <div className="rounded-3xl border border-white/10 bg-[#161b22] p-6">
              <label className="mb-4 block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">Security Checklist</label>
              <ul className="space-y-4">
                <ChecklistRow ok={entry.checklist.longEnough} label="Secure length" />
                <ChecklistRow ok={entry.checklist.hasSpecial} label="Unique symbols" />
                <ChecklistRow ok={!entry.reused} label="Not reused" />
                <ChecklistRow ok={entry.has2FA} label="2FA enabled" />
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
