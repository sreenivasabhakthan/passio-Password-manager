"use client";
import { useMemo, useState } from "react";

interface PasswordGeneratorProps {
  onClose: () => void;
  onUse: (password: string) => void;
  onShowToast: (msg: string) => void;
}

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}

function Toggle({ value, onChange, label }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-slate-300 font-medium">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full relative transition-all duration-300 ${value ? "neon-green-bg" : "bg-slate-800"}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${value ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function getStrength(pwd: string): { label: string; score: number; color: string } {
  let score = 0;
  if (pwd.length >= 12) score += 25;
  if (pwd.length >= 20) score += 15;
  if (/[A-Z]/.test(pwd)) score += 15;
  if (/[a-z]/.test(pwd)) score += 10;
  if (/[0-9]/.test(pwd)) score += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20;
  
  if (score >= 80) return { label: "Tougher than my ex", score, color: "#BEF264" };
  if (score >= 55) return { label: "Doing its best", score, color: "#EAB308" };
  return { label: "Wet noodle", score, color: "#DC2626" };
}

const WORDS = ["correct", "horse", "battery", "staple", "purple", "dragon", "anchor", "cloud", "rocket", "forest", "ocean", "summit", "river", "cabin", "falcon"];

function generatePassword(options: {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  passphraseMode: boolean;
  seed: number;
}) {
  if (options.passphraseMode) {
    const words: string[] = [];
    for (let i = 0; i < 4; i++) words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
    return words.join("-");
  }

  let chars = "";
  if (options.uppercase) chars += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (options.lowercase) chars += "abcdefghjkmnpqrstuvwxyz";
  if (options.numbers) chars += "23456789";
  if (options.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!options.excludeAmbiguous) {
    if (options.uppercase) chars += "IO";
    if (options.lowercase) chars += "il";
    if (options.numbers) chars += "01";
  }

  if (!chars) return "";

  let pwd = "";
  for (let i = 0; i < options.length; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

export default function PasswordGenerator({ onClose, onUse, onShowToast }: PasswordGeneratorProps) {
  const [length, setLength] = useState(20);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [passphraseMode, setPassphraseMode] = useState(false);
  const [seed, setSeed] = useState(0);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(
    () =>
      generatePassword({
        length,
        uppercase,
        lowercase,
        numbers,
        symbols,
        excludeAmbiguous,
        passphraseMode,
        seed,
      }),
    [length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, passphraseMode, seed]
  );

  const copyPassword = () => {
    if (!generated) return;
    navigator.clipboard.writeText(generated);
    setCopied(true);
    onShowToast("Password copied to your pocket!");
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(generated);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-4 overflow-hidden"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card border border-white/10 rounded-3xl shadow-2xl w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2rem)] overflow-y-auto animate-[scale95to100_0.2s_ease-out] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-7 border-b border-white/5">
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">Ritual of Strength</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Generated password display */}
          <div className="bg-[#0A0D0F] border border-white/5 rounded-2xl p-5 relative group">
            <p className="text-lg font-mono text-white break-all leading-relaxed min-h-[3rem] tracking-[0.05em]">
              {generated || <span className="text-slate-700">Brewing...</span>}
            </p>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 sm:mr-6">
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(strength.score, 100)}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-[10px] mt-2 block font-bold uppercase tracking-widest" style={{ color: strength.color }}>{strength.label}</span>
              </div>
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setSeed((current) => current + 1)}
                  className="w-10 h-10 rounded-xl glass-card border-white/5 flex items-center justify-center text-slate-400 hover:text-[#BEF264] transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
                <button
                  onClick={copyPassword}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${copied ? "bg-[#BEF264]/20 text-[#BEF264]" : "neon-green-bg text-black hover:bg-[#D9F99D]"}`}
                >
                  <span className="material-symbols-outlined text-[20px] font-bold">{copied ? "done" : "content_copy"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Length slider */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Scale of Power</label>
              <span className="text-xs font-bold neon-green-text bg-[#BEF264]/10 px-2 py-1 rounded-lg">{passphraseMode ? "4 words" : `${length} glyphs`}</span>
            </div>
            {!passphraseMode && (
              <input
                type="range" min={8} max={64} value={length} onChange={(e) => setLength(+e.target.value)}
                className="w-full accent-[#BEF264] bg-white/5 h-1.5 rounded-full appearance-none cursor-pointer"
              />
            )}
          </div>

          {/* Toggles */}
          <div className="bg-[#0A0D0F]/50 rounded-2xl px-5 border border-white/5">
            <Toggle value={uppercase} onChange={setUppercase} label="Ancient Runes (A-Z)" />
            <Toggle value={lowercase} onChange={setLowercase} label="Common Glyphs (a-z)" />
            <Toggle value={numbers} onChange={setNumbers} label="Mystic Numerals (0-9)" />
            <Toggle value={symbols} onChange={setSymbols} label="Chaos Symbols (!@#$)" />
            <Toggle value={excludeAmbiguous} onChange={setExcludeAmbiguous} label="Exclude Ambiguous" />
            <Toggle value={passphraseMode} onChange={setPassphraseMode} label="Incantation Mode" />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-white/5 text-slate-500 hover:text-white font-bold text-sm transition-all uppercase tracking-widest"
            >
              Flee
            </button>
            <button
              onClick={() => { onUse(generated); onClose(); }}
              className="flex-1 py-4 rounded-2xl neon-green-bg hover:bg-[#D9F99D] text-black font-bold text-sm transition-all shadow-lg shadow-[#BEF264]/10 uppercase tracking-widest"
            >
              Seal Hoard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
