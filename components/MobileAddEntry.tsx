"use client";

import { useMemo, useState } from "react";
import { Category, PasswordEntry } from "./data/mockData";
import { buildChecklist, calculateStrength, getStrengthLabel } from "./data/entryUtils";

interface MobileAddEntryProps {
  onSave: (entry: Omit<PasswordEntry, "id">) => void;
  onCancel: () => void;
}

const CATEGORY_OPTIONS: Category[] = ["Social", "Banking", "Work", "Email", "Development", "Cloud", "Shopping"];
const CHARSETS = {
  uppercase: "ABCDEFGHJKLMNPQRSTUVWXYZ",
  lowercase: "abcdefghjkmnpqrstuvwxyz",
  numbers: "23456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}) {
  let chars = "";
  if (options.uppercase) chars += CHARSETS.uppercase;
  if (options.lowercase) chars += CHARSETS.lowercase;
  if (options.numbers) chars += CHARSETS.numbers;
  if (options.symbols) chars += CHARSETS.symbols;
  if (!chars) return "";

  let password = "";
  for (let i = 0; i < options.length; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

export default function MobileAddEntry({ onSave, onCancel }: MobileAddEntryProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<Category>("Work");
  const [showPassword, setShowPassword] = useState(false);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [error, setError] = useState("");

  const score = useMemo(() => calculateStrength(password), [password]);
  const strength = getStrengthLabel(score);

  const handleGenerate = () => {
    const generated = generatePassword({ length: 20, uppercase, lowercase, numbers, symbols });
    setPassword(generated);
    setShowPassword(true);
    setError("");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !username.trim() || !password.trim()) {
      setError("Title, username, and password are required.");
      return;
    }

    const normalizedWebsite = website.trim().replace(/^https?:\/\//, "");
    const nextScore = calculateStrength(password);

    onSave({
      name: name.trim(),
      website: normalizedWebsite,
      username: username.trim(),
      password,
      category,
      notes: notes.trim(),
      strengthScore: nextScore,
      strength: getStrengthLabel(nextScore),
      isFavorite: false,
      hasTotp: false,
      breached: false,
      reused: false,
      lastChanged: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      has2FA: false,
      color: "#161616",
      passwordHistory: [],
      checklist: buildChecklist(password),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0a0a0a] px-4 py-5 pb-24 text-white">
      <div className="mb-8 flex items-center justify-between md:hidden">
        <h1 className="text-xl font-bold">Add Entry</h1>
        <button onClick={onCancel} className="text-[#BEF264]">
          <span className="material-symbols-outlined text-[28px]">close</span>
        </button>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <nav className="mb-2 text-xs uppercase tracking-[0.24em] text-slate-500">Vault / Add Entry</nav>
          <h2 className="text-3xl font-extrabold md:text-4xl">Add New Entry</h2>
          <p className="mt-2 text-sm text-slate-500">Enter the details for your new digital asset.</p>
        </div>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Title</span>
              <input
                value={name}
                onChange={(event) => { setName(event.target.value); setError(""); }}
                placeholder="e.g. Personal Email"
                className="w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white outline-none transition focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264]"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">URL</span>
              <input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white outline-none transition focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Username</span>
              <input
                value={username}
                onChange={(event) => { setUsername(event.target.value); setError(""); }}
                placeholder="your_username"
                className="w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white outline-none transition focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264]"
              />
            </label>
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Password</span>
              <div className="relative">
                <input
                  value={password}
                  onChange={(event) => { setPassword(event.target.value); setError(""); }}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 pr-24 text-white outline-none transition focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264]"
                />
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500 hover:text-[#BEF264]">
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                  <button type="button" onClick={handleGenerate} className="text-slate-500 hover:text-[#BEF264]">
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#161616]/60 p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Password Strength</span>
              <span className={`text-xs font-mono font-bold uppercase ${score >= 80 ? "text-[#BEF264]" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
                Strength: {strength} ({score}/100)
              </span>
            </div>
            <div className="mb-5 flex h-1.5 gap-1">
              {[25, 50, 75, 100].map((step) => (
                <div
                  key={step}
                  className={`flex-1 rounded-full ${score >= step ? score >= 80 ? "bg-[#BEF264]" : score >= 50 ? "bg-amber-400" : "bg-red-400" : "bg-white/10"}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 md:grid-cols-4">
              {[
                { label: "Symbols", value: symbols, onChange: setSymbols },
                { label: "Numbers", value: numbers, onChange: setNumbers },
                { label: "Uppercase", value: uppercase, onChange: setUppercase },
                { label: "Lowercase", value: lowercase, onChange: setLowercase },
              ].map((option) => (
                <label key={option.label} className="group flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={option.value}
                    onChange={() => option.onChange(!option.value)}
                    className="h-4 w-4 rounded border-white/10 bg-transparent text-[#BEF264] focus:ring-[#BEF264]"
                  />
                  <span className="text-sm text-slate-400 transition group-hover:text-white">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Category</label>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map((option) => {
                const active = category === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setCategory(option)}
                    className={`rounded-full border px-5 py-2.5 text-sm font-bold transition ${
                      active
                        ? "border-[#BEF264] bg-[#BEF264] text-black"
                        : "border-white/10 text-slate-400 hover:border-[#BEF264] hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="space-y-2">
            <span className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Add any additional details here..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white outline-none transition focus:border-[#BEF264] focus:ring-1 focus:ring-[#BEF264]"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center gap-4 pt-2 md:flex-row">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#BEF264] px-10 py-4 font-extrabold text-black transition hover:scale-[1.02] md:w-auto"
            >
              SAVE ENTRY
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full rounded-xl border border-white/10 px-10 py-4 font-bold text-slate-400 transition hover:bg-white/5 md:w-auto"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
