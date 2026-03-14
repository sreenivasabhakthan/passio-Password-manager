"use client";
import { useState, useRef, useCallback } from "react";
import { PasswordEntry } from "./data/mockData";

interface DetailPanelProps {
  entry: PasswordEntry | null;
  onShowGenerator: () => void;
  onCopy: (text: string, label: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (updated: PasswordEntry, original: PasswordEntry) => void;
  onToggleFavorite: (id: string) => void;
  isTrash?: boolean;
  onRestore?: (id: string) => void;
}

/* ── TOTP Widget ── */
function TotpWidget({ onCopy }: { onCopy: (text: string, label: string) => void }) {
  const [secondsLeft, setSecondsLeft] = useState(12);
  const [code, setCode] = useState("492 811");
  const circumference = 2 * Math.PI * 16;

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const n = Math.floor(100000 + Math.random() * 900000).toString();
          setCode(`${n.slice(0, 3)} ${n.slice(3)}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const offset = circumference - (secondsLeft / 30) * circumference;
  const ringColor = secondsLeft > 10 ? "#BEF264" : secondsLeft > 5 ? "#D97706" : "#DC2626";

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#BEF264]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-4">Short-lived Magic (TOTP)</label>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => onCopy(code.replace(" ", ""), "TOTP Code")}
            className="flex gap-3 sm:gap-4 items-baseline hover:opacity-80 transition-opacity cursor-pointer"
            title="Click to copy"
          >
            <span className="text-3xl sm:text-4xl font-bold tracking-[0.14em] sm:tracking-[0.2em] text-white">{code.split(" ")[0]}</span>
            <span className="text-3xl sm:text-4xl font-bold tracking-[0.14em] sm:tracking-[0.2em] text-white">{code.split(" ")[1]}</span>
          </button>
          <div className="relative w-12 h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" fill="none" r="16" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
              <circle
                cx="18" cy="18" fill="none" r="16" strokeLinecap="round" strokeWidth="3"
                stroke={ringColor}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold" style={{ color: ringColor }}>{secondsLeft}s</span>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-4 uppercase tracking-tighter">Use it before it expires, like your gym membership.</p>
      </div>
    </div>
  );
}

/* ── History Tab ── */
function HistoryTab({ entry }: { entry: PasswordEntry }) {
  if (entry.passwordHistory.length === 0) {
    return (
      <div className="text-center py-12 text-slate-600 italic text-sm">
        <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">history</span>
        No ancient artifacts found. This password has no history.
      </div>
    );
  }
  return (
    <div className="space-y-3 max-w-lg">
      {entry.passwordHistory.map((h, i) => (
        <div key={i} className="flex items-center gap-4 p-4 glass-card rounded-xl border border-white/5">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-slate-500 text-[16px]">key</span>
          </div>
          <div className="flex-1">
            <div className="flex gap-1.5 mb-1">
              {Array.from({ length: Math.min(h.password.length, 12) }).map((_, j) => (
                <span key={j} className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              ))}
            </div>
            <p className="text-xs text-slate-500">Changed {h.date}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
            h.strength === "Strong" ? "bg-green-500/10 text-green-400" :
            h.strength === "Medium" ? "bg-amber-500/10 text-amber-400" :
            "bg-red-500/10 text-red-400"
          }`}>{h.strength}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Notes Tab ── */
function NotesTab({ entry, onUpdate }: { entry: PasswordEntry; onUpdate: (updated: PasswordEntry, original: PasswordEntry) => void }) {
  const [notes, setNotes] = useState(() => entry.notes);
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = useCallback((val: string) => {
    setNotes(val);
    // Auto-save after 1s of inactivity
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onUpdate({ ...entry, notes: val }, entry);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  }, [entry, onUpdate]);

  return (
    <div className="max-w-lg">
      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-[14px]">edit_note</span>
        Secure Drunken Notes
        {saved && <span className="neon-green-text ml-2">✓ Saved</span>}
      </label>
      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Scribble your secrets here... no one is judging."
        rows={10}
        className="w-full glass-card rounded-xl border border-white/5 p-5 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264]/20 transition-all bg-transparent"
      />
    </div>
  );
}

/* ── Strength Checklist ── */
function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        ok ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
      }`}>
        <span className="material-symbols-outlined text-[14px] font-bold">{ok ? "check" : "close"}</span>
      </div>
      <span className={`text-xs font-medium ${ok ? "text-slate-300" : "text-red-400/80"}`}>{label}</span>
    </li>
  );
}

/* ── Main Detail Panel ── */
export default function DetailPanel({
  entry, onShowGenerator, onCopy, onDelete, onUpdate, onToggleFavorite, isTrash, onRestore
}: DetailPanelProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "history" | "notes">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", username: "", website: "", password: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = useCallback((text: string, field: string) => {
    onCopy(text, field);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, [onCopy]);

  const startEdit = useCallback(() => {
    if (!entry) return;
    setEditForm({ name: entry.name, username: entry.username, website: entry.website, password: entry.password });
    setIsEditing(true);
  }, [entry]);

  const saveEdit = useCallback(() => {
    if (!entry) return;
    const updated = {
      ...entry,
      ...editForm,
      checklist: {
        longEnough: editForm.password.length >= 16,
        hasUppercase: /[A-Z]/.test(editForm.password),
        hasNumbers: /[0-9]/.test(editForm.password),
        hasSpecial: /[^A-Za-z0-9]/.test(editForm.password),
      },
      strengthScore: calculateStrength(editForm.password),
      strength: (calculateStrength(editForm.password) >= 80 ? "Strong" : calculateStrength(editForm.password) >= 50 ? "Medium" : "Weak") as PasswordEntry["strength"],
    };
    // Pass both updated and original so parent can detect password changes
    onUpdate(updated, entry);
    setIsEditing(false);
  }, [entry, editForm, onUpdate]);

  if (!entry) {
    return (
      <section className="flex-1 flex items-center justify-center bg-[#050708]">
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] text-slate-800 block mb-4">lock</span>
          <p className="text-slate-600 italic text-sm">Select an item to reveal its secrets.</p>
        </div>
      </section>
    );
  }

  const getCatIcon = (cat: string) => {
    const icons: Record<string, string> = {
      Social: "group", Banking: "account_balance", Work: "business_center",
      Email: "mail", Development: "code", Cloud: "cloud",
    };
    return icons[cat] || "key";
  };

  return (
    <section className="flex-1 overflow-y-auto bg-[#050708] p-4 sm:p-6 lg:p-10 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#BEF264] opacity-[0.03] blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between lg:items-start mb-8 sm:mb-10 relative z-10">
        <div className="flex gap-4 sm:gap-6 min-w-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 glass-card rounded-2xl flex items-center justify-center glow-sm border border-white/10 flex-shrink-0">
            <span className="material-symbols-outlined text-[32px] sm:text-[40px] neon-green-text">{getCatIcon(entry.category)}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-1">
              {isEditing ? (
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-2xl sm:text-4xl font-bold tracking-tight text-white bg-transparent border-b-2 neon-green-border outline-none min-w-0 w-full"
                />
              ) : (
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white break-words">{entry.name}</h2>
              )}
              <button
                onClick={() => onToggleFavorite(entry.id)}
                className={`transition-colors ${entry.isFavorite ? "text-yellow-400" : "text-slate-400 hover:text-yellow-400"}`}
              >
                <span className="material-symbols-outlined text-[24px]">{entry.isFavorite ? "star" : "star_border"}</span>
              </button>
            </div>
            <p className="text-slate-500 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              Last touched: {entry.lastChanged}
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              Lost in vault since: {entry.created}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isTrash ? (
            <button
              onClick={() => onRestore?.(entry.id)}
              className="px-4 sm:px-5 py-2 rounded-xl neon-green-bg text-black font-bold hover:bg-[#D9F99D] transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">restore</span>
              Restore
            </button>
          ) : isEditing ? (
            <>
              <button onClick={saveEdit} className="px-4 sm:px-5 py-2 rounded-xl neon-green-bg text-black font-bold hover:bg-[#D9F99D] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">save</span>Save
              </button>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-xl glass-card border-white/10 text-slate-400 font-bold transition-all">Cancel</button>
            </>
          ) : (
            <>
              <button onClick={startEdit} className="px-4 sm:px-5 py-2 rounded-xl neon-green-bg text-black font-bold hover:bg-[#D9F99D] transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">edit</span>Edit
              </button>
              <a href={`https://${entry.website}`} target="_blank" rel="noreferrer" className="p-2 rounded-xl glass-card border-white/10 hover:border-white/20 text-slate-400 transition-all flex items-center" title="Launch Website">
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
              </a>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl glass-card border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col sm:flex-row gap-4 sm:items-center relative z-10">
          <span className="material-symbols-outlined text-red-400 text-[24px]">warning</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">Incinerate this loot?</p>
            <p className="text-xs text-slate-500">This will move it to the Graveyard.</p>
          </div>
          <button onClick={() => { onDelete(entry.id); setShowDeleteConfirm(false); }} className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-all">
            Yes, burn it
          </button>
          <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-xl glass-card text-slate-400 font-bold text-xs">
            Spare it
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-5 sm:gap-8 border-b border-white/5 mb-8 relative z-10 overflow-x-auto no-scrollbar">
        {([["details", "Details"], ["history", "Password History"], ["notes", "Drunken Notes"]] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === tab ? "neon-green-text neon-green-border" : "text-slate-500 hover:text-white border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Breach Alert */}
      {activeTab === "details" && entry.breached && (
        <div className="mb-8 sm:mb-10 p-4 sm:p-5 rounded-2xl bg-[#FFA500]/5 border border-[#FFA500]/20 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="w-10 h-10 rounded-full bg-[#FFA500]/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[#FFA500]">warning</span>
          </div>
          <div className="flex-1">
            <h4 className="text-[#FFA500] font-bold text-sm">Security Roast: Found in data breach</h4>
            <p className="text-xs text-slate-400">This password was found in 2 data breaches. Change it now before the hackers have brunch.</p>
          </div>
          <button onClick={onShowGenerator} className="px-4 py-2 rounded-xl bg-[#FFA500]/20 text-[#FFA500] font-bold text-xs hover:bg-[#FFA500]/30 transition-all whitespace-nowrap">
            Change now →
          </button>
        </div>
      )}

      {/* Reused Alert */}
      {activeTab === "details" && entry.reused && !entry.breached && (
        <div className="mb-8 sm:mb-10 p-4 sm:p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row gap-4 sm:items-center">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-amber-500">content_copy</span>
          </div>
          <div>
            <h4 className="text-amber-500 font-bold text-sm">Lazy Bones: Reused password detected</h4>
            <p className="text-xs text-slate-400">This password is used on another site. That&apos;s like using the same key for your house and your diary.</p>
          </div>
        </div>
      )}

      {/* ═══ DETAILS TAB ═══ */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
          <div className="xl:col-span-7 space-y-6 sm:space-y-8 min-w-0">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Site Title / Fake Brand</label>
                <div className="glass-card rounded-xl px-4 py-3 text-white font-medium">{isEditing ? (
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-transparent outline-none w-full" />
                ) : entry.name}</div>
              </div>
              <div className="sm:w-48">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Category</label>
                <div className="px-3 py-3 rounded-xl bg-[#BEF264]/10 neon-green-text text-xs font-bold uppercase text-center border border-[#BEF264]/20">{entry.category}</div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">User handle / Boring Alias</label>
              <div className={`flex items-center gap-3 glass-card rounded-xl px-4 py-3 group transition-all ${copiedField === "Username" ? "ring-1 ring-[#BEF264]/50 bg-[#BEF264]/5" : ""}`}>
                {isEditing ? (
                  <input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className="flex-1 bg-transparent text-white outline-none" />
                ) : (
                  <span className="text-slate-300 font-medium flex-1">{entry.username}</span>
                )}
                <button onClick={() => handleCopy(entry.username, "Username")} className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-[#BEF264]">
                  <span className="material-symbols-outlined text-[18px]">{copiedField === "Username" ? "done" : "content_copy"}</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Magic Word</label>
              <div className={`glass-card rounded-xl px-4 py-3 flex items-center gap-3 sm:gap-4 border transition-all ${copiedField === "Password" ? "border-[#BEF264]/50 bg-[#BEF264]/5" : "border-white/5"}`}>
                <div className="flex gap-1.5 flex-1 items-center">
                  {isEditing ? (
                    <input value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} type={showPassword ? "text" : "password"} className="flex-1 bg-transparent text-white font-mono outline-none min-w-0" />
                  ) : showPassword ? (
                    <span className="text-white font-mono transition-opacity duration-300 break-all">{entry.password}</span>
                  ) : (
                    <div className="flex gap-1.5 flex-wrap">{Array.from({ length: Math.min(entry.password.length, 12) }).map((_, i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-slate-600" />
                    ))}</div>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setShowPassword(!showPassword)} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button onClick={() => handleCopy(entry.password, "Password")} className="p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-[#BEF264] transition-colors">
                    <span className="material-symbols-outlined text-[18px]">{copiedField === "Password" ? "done" : "content_copy"}</span>
                  </button>
                </div>
              </div>
              {/* Strength Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-[10px] font-bold uppercase ${entry.strengthScore > 80 ? "neon-green-text" : entry.strengthScore > 50 ? "text-amber-400" : "text-red-400"}`}>
                    {entry.strengthScore > 80 ? "Tougher than my ex" : entry.strengthScore > 50 ? "Doing its best" : "Wet noodle"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-bold">{entry.strengthScore}/100</span>
                </div>
                <div className="h-1.5 w-full bg-[#161B22] rounded-full overflow-hidden flex gap-0.5">
                  {[25, 50, 75, 100].map((step) => (
                    <div key={step} className={`h-full transition-all duration-1000 ${
                      entry.strengthScore >= step - 12
                        ? entry.strengthScore > 80 ? "neon-green-bg glow-sm" : entry.strengthScore > 50 ? "bg-amber-500" : "bg-red-500"
                        : "bg-slate-800"
                    }`} style={{ width: "25%" }} />
                  ))}
                </div>
              </div>
              {/* Generate link */}
              <button onClick={onShowGenerator} className="mt-3 flex items-center gap-1.5 text-[10px] neon-green-text hover:underline font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[14px]">casino</span>Generate stronger magic word
              </button>
            </div>

            {/* Website */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Portal URL</label>
              <div className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 group">
                {isEditing ? (
                  <input value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className="flex-1 bg-transparent neon-green-text outline-none" />
                ) : (
                  <a href={`https://${entry.website}`} target="_blank" rel="noreferrer" className="neon-green-text hover:underline font-medium flex-1 truncate">{entry.website}</a>
                )}
                <button className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1.5 hover:bg-white/5 rounded text-slate-500 hover:text-[#BEF264]">
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </button>
              </div>
            </div>

            {/* Notes preview */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-3">Drunken Notes</label>
              <div className="glass-card rounded-xl p-4 min-h-[80px] text-sm text-slate-400 italic">
                {entry.notes || "No drunken ramblings found for this loot."}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-5 space-y-6">
            {entry.hasTotp && <TotpWidget onCopy={onCopy} />}

            {/* Security Checklist */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-4">Is this actually safe?</label>
              <ul className="space-y-4">
                <ChecklistItem ok={entry.checklist.longEnough} label="Longer than a CVS receipt (16+ chars)" />
                <ChecklistItem ok={entry.checklist.hasUppercase} label="Has shouty letters (A-Z)" />
                <ChecklistItem ok={entry.checklist.hasNumbers} label="Sprinkled with numbers (0-9)" />
                <ChecklistItem ok={entry.checklist.hasSpecial} label="Full of weird symbols (!@#$)" />
                <ChecklistItem ok={entry.has2FA} label="2FA protected" />
                <ChecklistItem ok={!entry.reused} label="Not reused elsewhere" />
              </ul>
            </div>

            {/* Importance */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C2128] to-[#0A0D0F] border border-white/5 glow-sm">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Hoard Importance</span>
                <span className={`text-xs font-bold ${entry.strengthScore > 80 ? "text-red-400" : "text-yellow-400"}`}>
                  {entry.strengthScore > 80 ? "CRITICAL" : "MODERATE"}
                </span>
              </div>
              <div className="text-3xl font-bold mb-1 text-white">
                {entry.strengthScore > 80 ? "Top 1%" : "Safe Choice"}
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-tight mb-4 font-bold">The keys to the kingdom.</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 opacity-50" />
              </div>
            </div>

            {/* Meta info */}
            <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Last Changed</span>
                <span className="text-white font-medium">{entry.lastChanged}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Created</span>
                <span className="text-white font-medium">{entry.created}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">2FA Enabled</span>
                <span className={`font-bold ${entry.has2FA ? "neon-green-text" : "text-red-400"}`}>{entry.has2FA ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Has TOTP</span>
                <span className={`font-bold ${entry.hasTotp ? "neon-green-text" : "text-slate-600"}`}>{entry.hasTotp ? "Active" : "–"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ HISTORY TAB ═══ */}
      {activeTab === "history" && <HistoryTab entry={entry} />}

      {/* ═══ NOTES TAB ═══ */}
      {activeTab === "notes" && <NotesTab key={entry.id} entry={entry} onUpdate={onUpdate} />}
    </section>
  );
}

/* Utility — password strength calculator */
function calculateStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 12) score += 25;
  if (pwd.length >= 20) score += 15;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 10;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
  return Math.min(score, 100);
}
