"use client";
import { useState, useMemo, useCallback } from "react";
import { PasswordEntry } from "./data/mockData";

type Category = "Everything" | "Social" | "Empty Wallets" | "The Grind" | "Mail" | "Dev" | "Cloud";
type SortMode = "Recent" | "A-Z" | "Strength";

interface VaultListProps {
  entries: PasswordEntry[];
  selectedId: string | null;
  onSelect: (entry: PasswordEntry) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddNew: () => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  activeSection: string;
  sectionTitle: string;
}

const CATEGORIES: Category[] = ["Everything", "Social", "Empty Wallets", "The Grind", "Mail", "Dev", "Cloud"];

const CATEGORY_MAP: Record<string, string> = {
  Everything: "all",
  Social: "social",
  "Empty Wallets": "banking",
  "The Grind": "work",
  Mail: "email",
  Dev: "development",
  Cloud: "cloud",
};

function getCategoryIcon(cat: string): string {
  const icons: Record<string, string> = {
    Social: "group", Banking: "account_balance", Work: "business_center",
    Email: "mail", Development: "code", Cloud: "cloud", Shopping: "shopping_cart",
  };
  return icons[cat] || "key";
}

export default function VaultList({
  entries,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  onAddNew,
  onToggleFavorite,
  onCopy,
  activeSection,
  sectionTitle,
}: VaultListProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("Everything");
  const [localSearch, setLocalSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("Recent");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSearch = useCallback((val: string) => {
    setLocalSearch(val);
    onSearchChange(val);
  }, [onSearchChange]);

  const cycleSortMode = useCallback(() => {
    const modes: SortMode[] = ["Recent", "A-Z", "Strength"];
    setSortMode((prev) => modes[(modes.indexOf(prev) + 1) % modes.length]);
  }, []);

  // Section-level pre-filtering
  const sectionFiltered = useMemo(() => {
    switch (activeSection) {
      case "favorites": return entries.filter((e) => e.isFavorite);
      case "passwords": return entries;
      case "notes": return entries.filter((e) => e.notes && e.notes.length > 0);
      default: return entries;
    }
  }, [entries, activeSection]);

  // Category + search + sort
  const filtered = useMemo(() => {
    let items = [...sectionFiltered];
    const q = (searchQuery || localSearch).toLowerCase();

    if (q) {
      items = items.filter(
        (e) => e.name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q) || e.website.toLowerCase().includes(q)
      );
    }

    if (activeCategory !== "Everything") {
      const mapped = CATEGORY_MAP[activeCategory];
      items = items.filter((e) => e.category.toLowerCase() === mapped);
    }

    // Sort
    if (sortMode === "A-Z") items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === "Strength") items.sort((a, b) => b.strengthScore - a.strengthScore);
    // "Recent" = default order (by last changed, but mock data doesn't have real dates)

    return items;
  }, [sectionFiltered, searchQuery, localSearch, activeCategory, sortMode]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-white/5 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold whitespace-nowrap">{sectionTitle}</h1>
            <span className="text-[10px] font-bold bg-white/5 text-slate-400 rounded-full px-2 py-0.5 border border-white/5">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={cycleSortMode}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5 uppercase tracking-widest font-bold"
            >
              <span className="material-symbols-outlined text-[14px]">sort</span>
              <span className="hidden lg:inline">{sortMode}</span>
            </button>
            <button
              onClick={onAddNew}
              className="w-8 h-8 rounded-lg hover:bg-[#D9F99D] flex items-center justify-center transition-colors neon-green-bg"
            >
              <span className="material-symbols-outlined text-black font-bold text-[20px]">add</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search the hoard..."
            className="w-full bg-[#161B22] border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-[#BEF264] transition-all text-white outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                activeCategory === cat
                  ? "neon-green-bg text-black"
                  : "bg-[#1C2128] text-slate-300 hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Item List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
        {filtered.map((entry) => {
          const isSelected = selectedId === entry.id;
          const isWeak = entry.strength === "Weak";
          const isBreach = entry.breached;
          const isHovered = hoveredId === entry.id;

          return (
            <div
              key={entry.id}
              onClick={() => onSelect(entry)}
              onMouseEnter={() => setHoveredId(entry.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`rounded-xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 border-l-[3px] transform-gpu ${
                isSelected
                  ? "glass-card neon-green-border"
                  : isBreach
                  ? "bg-red-500/5 border-red-500/40 hover:bg-red-500/10"
                  : isWeak
                  ? "bg-amber-500/5 border-amber-500/40 hover:bg-amber-500/10"
                  : "border-transparent hover:bg-white/5 hover:translate-x-0.5"
              }`}
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-[#0F1419] flex items-center justify-center border border-white/5 flex-shrink-0">
                <span className={`material-symbols-outlined text-[20px] ${isWeak ? "text-red-500" : "neon-green-text"}`}>
                  {getCategoryIcon(entry.category)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className={`text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-300"}`}>{entry.name}</h3>
                  {isBreach && <span className="material-symbols-outlined text-[12px] text-red-500">warning</span>}
                </div>
                <p className="text-xs text-slate-500 truncate">{entry.username}</p>
              </div>

              {/* Right actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${
                  isWeak ? "bg-red-500" : entry.strength === "Medium" ? "bg-amber-500" : "neon-green-bg glow-sm"
                }`} />

                {isHovered && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onCopy(entry.password, "Password"); }}
                    className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-[#BEF264] transition-colors"
                    title="Copy Password"
                  >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  </button>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(entry.id); }}
                  className={`p-1 rounded transition-colors ${
                    entry.isFavorite ? "text-yellow-400" : "text-slate-700 hover:text-yellow-400"
                  }`}
                  title="Toggle Favorite"
                >
                  <span className="material-symbols-outlined text-[14px]">{entry.isFavorite ? "star" : "star_border"}</span>
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-600 italic text-sm">
            <span className="material-symbols-outlined text-[48px] block mb-3 opacity-30">search_off</span>
            Nothing found in the hoard.
          </div>
        )}
      </div>
    </div>
  );
}
