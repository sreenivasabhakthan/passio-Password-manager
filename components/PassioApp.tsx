"use client";
import { useState, useCallback, memo, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import VaultList from "./VaultList";
import DetailPanel from "./DetailPanel";
import PasswordGenerator from "./PasswordGenerator";
import HealthPanel from "./HealthPanel";
import LockScreen from "./LockScreen";
import VerifyModal from "./VerifyModal";
import Toast from "./Toast";
import { useAuth } from "./AuthProvider";
import { MOCK_ENTRIES, PasswordEntry } from "./data/mockData";
import { saveEntry, loadEntries, deleteEntry as deleteFirestoreEntry, saveTrashEntry, loadTrashEntries, deleteTrashEntry, saveAllEntries } from "@/lib/firestore";

type Section = "all" | "favorites" | "passwords" | "notes" | "cards" | "identities" | "health" | "generator" | "trash";
// Mobile view panels
type MobileView = "list" | "detail";

const MemoizedSidebar = memo(Sidebar);
const MemoizedVaultList = memo(VaultList);
const MemoizedDetailPanel = memo(DetailPanel);

const SECTION_TITLES: Record<string, string> = {
  all: "The Whole Hoard",
  favorites: "Top Secret Snacks",
  passwords: "Magic Words",
  notes: "Drunken Ramblings",
  health: "Password Health",
  generator: "Generator",
  trash: "Graveyard",
};

export default function PassioApp() {
  const { user, profile } = useAuth();

  /* ── Core State ── */
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [trashedEntries, setTrashedEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isVaultCollapsed, setIsVaultCollapsed] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const [toast, setToast] = useState<{ message: string; visible: boolean; countdown?: number }>({
    message: "", visible: false,
  });
  const [toastKey, setToastKey] = useState(0);

  /* ── Verification State ── */
  const [showVerify, setShowVerify] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

  /* ── Load data from Firestore on mount ── */
  useEffect(() => {
    if (!user || dataLoaded) return;
    const loadData = async () => {
      try {
        const [loadedEntries, loadedTrash] = await Promise.all([
          loadEntries(user.uid),
          loadTrashEntries(user.uid),
        ]);
        if (loadedEntries.length > 0) {
          setEntries(loadedEntries);
          setSelectedEntry(loadedEntries[0]);
        } else {
          setEntries([...MOCK_ENTRIES]);
          setSelectedEntry(MOCK_ENTRIES[0]);
          await saveAllEntries(user.uid, MOCK_ENTRIES);
        }
        setTrashedEntries(loadedTrash);
        setDataLoaded(true);
      } catch (err) {
        console.error("Error loading vault data:", err);
        setEntries([...MOCK_ENTRIES]);
        setSelectedEntry(MOCK_ENTRIES[0]);
        setDataLoaded(true);
      }
    };
    loadData();
  }, [user, dataLoaded]);

  /* ── Toast ── */
  const showToast = useCallback((msg: string, countdown?: number) => {
    setToast({ message: msg, visible: true, countdown });
    setToastKey((k) => k + 1);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  /* ── Verification Gate ── */
  const requireVerification = useCallback((action: () => void) => {
    pendingAction.current = action;
    setShowVerify(true);
  }, []);

  const handleVerifySuccess = useCallback(() => {
    setShowVerify(false);
    if (pendingAction.current) {
      pendingAction.current();
      pendingAction.current = null;
    }
  }, []);

  const handleVerifyCancel = useCallback(() => {
    setShowVerify(false);
    pendingAction.current = null;
    showToast("Verification cancelled");
  }, [showToast]);

  /* ── Clipboard copy ── */
  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    const isPassword = label.toLowerCase().includes("password");
    showToast(`${label} copied!`, isPassword ? 30 : undefined);
    if (isPassword) {
      setTimeout(() => { navigator.clipboard.writeText("").catch(() => {}); }, 30000);
    }
  }, [showToast]);

  /* ── Entry CRUD ── */
  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) {
        setTrashedEntries((t) => [...t, entry]);
        if (user) {
          saveTrashEntry(user.uid, entry);
          deleteFirestoreEntry(user.uid, id);
        }
      }
      return prev.filter((e) => e.id !== id);
    });
    setSelectedEntry(null);
    setMobileView("list"); // go back to list on mobile after delete
    showToast("Entry moved to the Graveyard 💀");
  }, [showToast, user]);

  const handleUpdateEntry = useCallback((updated: PasswordEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    setSelectedEntry((prev) => (prev?.id === updated.id ? updated : prev));
    if (user) saveEntry(user.uid, updated);
  }, [user]);

  const handleVerifiedUpdate = useCallback((updated: PasswordEntry, original: PasswordEntry) => {
    if (updated.password !== original.password) {
      requireVerification(() => {
        handleUpdateEntry(updated);
        showToast("Password changed after verification ✅");
      });
    } else {
      handleUpdateEntry(updated);
    }
  }, [requireVerification, handleUpdateEntry, showToast]);

  const handleToggleFavorite = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, isFavorite: !e.isFavorite } : e));
      const entry = updated.find((e) => e.id === id);
      if (entry && user) saveEntry(user.uid, entry);
      return updated;
    });
    setSelectedEntry((prev) =>
      prev?.id === id ? { ...prev, isFavorite: !prev.isFavorite } : prev
    );
  }, [user]);

  const handleRestoreEntry = useCallback((id: string) => {
    setTrashedEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) {
        setEntries((ents) => [...ents, entry]);
        if (user) {
          saveEntry(user.uid, entry);
          deleteTrashEntry(user.uid, id);
        }
      }
      return prev.filter((e) => e.id !== id);
    });
    setSelectedEntry(null);
    setMobileView("list");
    showToast("Entry restored from the Graveyard ✨");
  }, [showToast, user]);

  /* ── Navigation ── */
  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    if (section === "generator") { setShowGenerator(true); return; }
    setIsVaultCollapsed(false);
    setSelectedEntry(null);
    setMobileView("list");
  }, []);

  const handleToggleVault = useCallback(() => {
    setIsVaultCollapsed((prev) => !prev);
  }, []);

  const handleHealthSelect = useCallback((entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setActiveSection("all");
    setIsVaultCollapsed(false);
    setMobileView("detail");
  }, []);

  const handleLock = useCallback(() => { setIsLocked(true); }, []);

  /* ── Mobile: select an entry → show detail ── */
  const handleMobileSelect = useCallback((entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setMobileView("detail");
  }, []);

  /* ── Password Generator ── */
  const handleUsePassword = useCallback((pwd: string) => {
    if (selectedEntry) {
      const applyPassword = () => {
        const updated = {
          ...selectedEntry,
          password: pwd,
          lastChanged: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          strengthScore: calculateStrength(pwd),
          strength: (calculateStrength(pwd) >= 80 ? "Strong" : calculateStrength(pwd) >= 50 ? "Medium" : "Weak") as PasswordEntry["strength"],
          checklist: {
            longEnough: pwd.length >= 16,
            hasUppercase: /[A-Z]/.test(pwd),
            hasNumbers: /[0-9]/.test(pwd),
            hasSpecial: /[^A-Za-z0-9]/.test(pwd),
          },
          passwordHistory: [
            ...selectedEntry.passwordHistory,
            { password: selectedEntry.password, date: selectedEntry.lastChanged, strength: selectedEntry.strength },
          ],
        };
        handleUpdateEntry(updated);
        showToast("Password forged and applied to hoard! 🔥");
      };
      requireVerification(applyPassword);
    } else {
      showToast("Generated password copied!");
    }
  }, [selectedEntry, handleUpdateEntry, showToast, requireVerification]);

  /* ── Derived ── */
  const listEntries = activeSection === "trash" ? trashedEntries : entries;
  const showHealth = activeSection === "health";

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} masterPasswordHash={profile?.masterPasswordHash || ""} />;
  }

  if (!dataLoaded) {
    return (
      <div className="h-full flex items-center justify-center bg-[#050708]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#BEF264]/30 border-t-[#BEF264] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Loading your hoard from the cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden bg-[#050708] text-[#E2E8F0] antialiased">

      {/* ── DESKTOP SIDEBAR (hidden on mobile) ── */}
      <div className="hidden md:flex">
        <MemoizedSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          entries={entries}
          onLock={handleLock}
        />
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ════ MOBILE LAYOUT (< md) ════ */}
        <div className="flex md:hidden flex-col w-full h-full min-w-0 safe-area-inset-top">
          {/* Mobile: show either list or detail */}
          {showHealth ? (
            <div className="flex-1 overflow-hidden pb-20">
              <HealthPanel entries={entries} onSelect={(e) => { handleHealthSelect(e); }} />
            </div>
          ) : mobileView === "list" ? (
            <div className="flex-1 overflow-hidden pb-20">
              <MemoizedVaultList
                entries={listEntries}
                selectedId={selectedEntry?.id ?? null}
                onSelect={handleMobileSelect}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onAddNew={() => setShowGenerator(true)}
                onToggleFavorite={handleToggleFavorite}
                onCopy={handleCopy}
                activeSection={activeSection}
                sectionTitle={SECTION_TITLES[activeSection] || "The Whole Hoard"}
              />
            </div>
          ) : (
            /* Mobile Detail View */
            <div className="flex-1 overflow-hidden flex flex-col pb-20">
              {/* Back button bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#080A0C] flex-shrink-0">
                <button
                  onClick={() => setMobileView("list")}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-[#BEF264] transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  <span className="text-sm font-medium">Back</span>
                </button>
                <span className="text-white font-semibold text-sm truncate ml-1">
                  {selectedEntry?.name ?? "Entry"}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <MemoizedDetailPanel
                  key={selectedEntry?.id ?? "empty-mobile-detail"}
                  entry={selectedEntry}
                  onShowGenerator={() => setShowGenerator(true)}
                  onCopy={handleCopy}
                  onDelete={handleDeleteEntry}
                  onUpdate={handleVerifiedUpdate}
                  onToggleFavorite={handleToggleFavorite}
                  isTrash={activeSection === "trash"}
                  onRestore={handleRestoreEntry}
                />
              </div>
            </div>
          )}

          {/* ── MOBILE BOTTOM TAB BAR ── */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#080A0C]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-start overflow-x-auto no-scrollbar px-1 py-1 safe-area-inset-bottom">
            {[
              { id: "all" as Section, icon: "grid_view", label: "Hoard" },
              { id: "favorites" as Section, icon: "favorite", label: "Faves" },
              { id: "passwords" as Section, icon: "password", label: "Passwords" },
              { id: "health" as Section, icon: "shield", label: "Health" },
              { id: "generator" as Section, icon: "casino", label: "Generate" },
            ].map(({ id, icon, label }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => handleSectionChange(id)}
                  className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all duration-200 min-w-[4.5rem] flex-1 ${
                    isActive ? "text-[#BEF264]" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className={`material-symbols-outlined text-[22px] ${isActive ? "neon-green-text" : ""}`}>
                    {icon}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide">{label}</span>
                </button>
              );
            })}
            {/* Lock button in bottom bar */}
            <button
              onClick={handleLock}
              className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-all duration-200 min-w-[4.5rem] flex-1 text-amber-400"
            >
              <span className="material-symbols-outlined text-[22px]">lock</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide">Lock</span>
            </button>
          </div>
        </div>

        {/* ════ DESKTOP LAYOUT (md+) ════ */}
        <div className="hidden md:flex flex-1 overflow-hidden relative">
          {!showHealth && (
            <>
              <div
                className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 border-r border-white/5 bg-[#0A0D0F] flex flex-col z-10 will-change-[width,opacity] transform-gpu overflow-hidden ${
                  isVaultCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-80 lg:w-96 opacity-100"
                }`}
              >
                <div className="w-80 lg:w-96 h-full">
                  <MemoizedVaultList
                    entries={listEntries}
                    selectedId={selectedEntry?.id ?? null}
                    onSelect={setSelectedEntry}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onAddNew={() => setShowGenerator(true)}
                    onToggleFavorite={handleToggleFavorite}
                    onCopy={handleCopy}
                    activeSection={activeSection}
                    sectionTitle={SECTION_TITLES[activeSection] || "The Whole Hoard"}
                  />
                </div>
              </div>

              <button
                onClick={handleToggleVault}
                className={`absolute top-1/2 -translate-y-1/2 z-20 w-8 h-12 bg-[#161B22] border border-white/10 rounded-full flex items-center justify-center text-slate-400 hover:text-[#BEF264] transition-all duration-500 hover:scale-110 shadow-xl transform-gpu ${
                  isVaultCollapsed ? "left-4" : "left-[310px] lg:left-[370px]"
                }`}
                title={isVaultCollapsed ? "Expand Hoard" : "Collapse Hoard"}
              >
                <span className={`material-symbols-outlined text-[24px] transition-transform duration-500 ${isVaultCollapsed ? "" : "rotate-180"}`}>
                  chevron_right
                </span>
              </button>
            </>
          )}

          {showHealth ? (
            <HealthPanel entries={entries} onSelect={handleHealthSelect} />
          ) : (
            <MemoizedDetailPanel
              key={selectedEntry?.id ?? "empty-desktop-detail"}
              entry={selectedEntry}
              onShowGenerator={() => setShowGenerator(true)}
              onCopy={handleCopy}
              onDelete={handleDeleteEntry}
              onUpdate={handleVerifiedUpdate}
              onToggleFavorite={handleToggleFavorite}
              isTrash={activeSection === "trash"}
              onRestore={handleRestoreEntry}
            />
          )}
        </div>
      </div>

      {/* ── Password Generator Modal ── */}
      {showGenerator && (
        <PasswordGenerator
          onClose={() => setShowGenerator(false)}
          onUse={handleUsePassword}
          onShowToast={(msg) => showToast(msg)}
        />
      )}

      {/* ── PIN Verification Modal ── */}
      {showVerify && (
        <VerifyModal
          onSuccess={handleVerifySuccess}
          onCancel={handleVerifyCancel}
          pinHash={profile?.pinHash || ""}
        />
      )}

      <Toast
        key={toastKey}
        message={toast.message}
        visible={toast.visible}
        onHide={hideToast}
        countdown={toast.countdown}
      />
    </div>
  );
}

function calculateStrength(pwd: string): number {
  let s = 0;
  if (pwd.length >= 12) s += 25;
  if (pwd.length >= 20) s += 15;
  if (/[A-Z]/.test(pwd)) s += 15;
  if (/[a-z]/.test(pwd)) s += 10;
  if (/[0-9]/.test(pwd)) s += 15;
  if (/[^A-Za-z0-9]/.test(pwd)) s += 20;
  return Math.min(s, 100);
}
