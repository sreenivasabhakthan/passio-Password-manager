"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import VaultList from "./VaultList";
import DetailPanel from "./DetailPanel";
import PasswordGenerator from "./PasswordGenerator";
import HealthPanel from "./HealthPanel";
import MobileVaultHome from "./MobileVaultHome";
import MobileEntryDetail from "./MobileEntryDetail";
import MobileAddEntry from "./MobileAddEntry";
import LockScreen from "./LockScreen";
import VerifyModal from "./VerifyModal";
import Toast from "./Toast";
import { useAuth } from "./AuthProvider";
import { MOCK_ENTRIES, PasswordEntry } from "./data/mockData";
import { buildChecklist, calculateStrength, getStrengthLabel } from "./data/entryUtils";
import {
  saveEntry,
  loadEntries,
  deleteEntry as deleteFirestoreEntry,
  saveTrashEntry,
  loadTrashEntries,
  deleteTrashEntry,
  saveAllEntries,
} from "@/lib/firestore";

type Section = "all" | "favorites" | "passwords" | "notes" | "cards" | "identities" | "health" | "generator" | "trash";
type MobileView = "home" | "detail" | "health" | "add";

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

  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [trashedEntries, setTrashedEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [activeSection, setActiveSection] = useState<Section>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocked, setIsLocked] = useState(true);
  const [showGenerator, setShowGenerator] = useState(false);
  const [isVaultCollapsed, setIsVaultCollapsed] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>("home");
  const [toast, setToast] = useState<{ message: string; visible: boolean; countdown?: number }>({
    message: "",
    visible: false,
  });
  const [toastKey, setToastKey] = useState(0);
  const [showVerify, setShowVerify] = useState(false);
  const pendingAction = useRef<(() => void) | null>(null);

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
      } catch (error) {
        console.error("Error loading vault data:", error);
        setEntries([...MOCK_ENTRIES]);
        setSelectedEntry(MOCK_ENTRIES[0]);
        setDataLoaded(true);
      }
    };

    loadData();
  }, [user, dataLoaded]);

  const showToastMessage = useCallback((message: string, countdown?: number) => {
    setToast({ message, visible: true, countdown });
    setToastKey((current) => current + 1);
  }, []);

  const hideToast = useCallback(() => {
    setToast((current) => ({ ...current, visible: false }));
  }, []);

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
    showToastMessage("Verification cancelled");
  }, [showToastMessage]);

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    const isPassword = label.toLowerCase().includes("password");
    showToastMessage(`${label} copied!`, isPassword ? 30 : undefined);
    if (isPassword) {
      setTimeout(() => {
        navigator.clipboard.writeText("").catch(() => {});
      }, 30000);
    }
  }, [showToastMessage]);

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries((current) => {
      const entry = current.find((item) => item.id === id);
      if (entry) {
        setTrashedEntries((trash) => [...trash, entry]);
        if (user) {
          saveTrashEntry(user.uid, entry);
          deleteFirestoreEntry(user.uid, id);
        }
      }
      return current.filter((item) => item.id !== id);
    });
    setSelectedEntry(null);
    setMobileView("home");
    showToastMessage("Entry moved to the Graveyard");
  }, [showToastMessage, user]);

  const handleUpdateEntry = useCallback((updated: PasswordEntry) => {
    setEntries((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedEntry((current) => (current?.id === updated.id ? updated : current));
    if (user) saveEntry(user.uid, updated);
  }, [user]);

  const handleVerifiedUpdate = useCallback((updated: PasswordEntry, original: PasswordEntry) => {
    if (updated.password !== original.password) {
      requireVerification(() => {
        handleUpdateEntry(updated);
        showToastMessage("Password changed after verification");
      });
      return;
    }
    handleUpdateEntry(updated);
  }, [requireVerification, handleUpdateEntry, showToastMessage]);

  const handleToggleFavorite = useCallback((id: string) => {
    setEntries((current) => {
      const updated = current.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
      const entry = updated.find((item) => item.id === id);
      if (entry && user) saveEntry(user.uid, entry);
      return updated;
    });
    setSelectedEntry((current) => (current?.id === id ? { ...current, isFavorite: !current.isFavorite } : current));
  }, [user]);

  const handleRestoreEntry = useCallback((id: string) => {
    setTrashedEntries((current) => {
      const entry = current.find((item) => item.id === id);
      if (entry) {
        setEntries((items) => [...items, entry]);
        if (user) {
          saveEntry(user.uid, entry);
          deleteTrashEntry(user.uid, id);
        }
      }
      return current.filter((item) => item.id !== id);
    });
    setSelectedEntry(null);
    setMobileView("home");
    showToastMessage("Entry restored from the Graveyard");
  }, [showToastMessage, user]);

  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    if (section === "generator") {
      setShowGenerator(true);
      return;
    }
    setIsVaultCollapsed(false);
    setSelectedEntry(null);
    setMobileView(section === "health" ? "health" : "home");
  }, []);

  const handleToggleVault = useCallback(() => {
    setIsVaultCollapsed((current) => !current);
  }, []);

  const handleHealthSelect = useCallback((entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setActiveSection("all");
    setIsVaultCollapsed(false);
    setMobileView("detail");
  }, []);

  const handleLock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const handleMobileSelect = useCallback((entry: PasswordEntry) => {
    setSelectedEntry(entry);
    setMobileView("detail");
  }, []);

  const handleMobileAdd = useCallback((entry: Omit<PasswordEntry, "id">) => {
    const createdEntry: PasswordEntry = { ...entry, id: `${Date.now()}` };
    setEntries((current) => [createdEntry, ...current]);
    setSelectedEntry(createdEntry);
    setActiveSection("all");
    setMobileView("detail");
    if (user) saveEntry(user.uid, createdEntry);
    showToastMessage("Entry added to your hoard");
  }, [showToastMessage, user]);

  const handleUsePassword = useCallback((password: string) => {
    if (!selectedEntry) {
      showToastMessage("Generated password copied!");
      return;
    }

    const applyPassword = () => {
      const nextScore = calculateStrength(password);
      const updated: PasswordEntry = {
        ...selectedEntry,
        password,
        lastChanged: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        strengthScore: nextScore,
        strength: getStrengthLabel(nextScore),
        checklist: buildChecklist(password),
        passwordHistory: [
          ...selectedEntry.passwordHistory,
          { password: selectedEntry.password, date: selectedEntry.lastChanged, strength: selectedEntry.strength },
        ],
      };
      handleUpdateEntry(updated);
      showToastMessage("Password forged and applied to hoard!");
    };

    requireVerification(applyPassword);
  }, [selectedEntry, showToastMessage, requireVerification, handleUpdateEntry]);

  const listEntries = activeSection === "trash" ? trashedEntries : entries;
  const sectionEntries = listEntries.filter((entry) => {
    if (activeSection === "favorites") return entry.isFavorite;
    if (activeSection === "notes") return Boolean(entry.notes && entry.notes.length > 0);
    return true;
  });
  const showHealth = activeSection === "health";
  const mobileFilteredEntries = sectionEntries.filter((entry) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return [entry.name, entry.username, entry.website].some((value) => value.toLowerCase().includes(q));
  });

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} masterPasswordHash={profile?.masterPasswordHash || ""} />;
  }

  if (!dataLoaded) {
    return (
      <div className="flex h-full items-center justify-center bg-[#050708]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#BEF264]/30 border-t-[#BEF264]" />
          <p className="text-sm text-slate-500">Loading your hoard from the cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#050708] text-[#E2E8F0] antialiased">
      <div className="hidden md:flex">
        <MemoizedSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          entries={entries}
          onLock={handleLock}
        />
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        <div className="safe-area-inset-top flex h-full min-w-0 w-full flex-col md:hidden">
          {mobileView === "health" ? (
            <div className="flex-1 overflow-hidden pb-20">
              <HealthPanel
                entries={entries}
                onSelect={handleHealthSelect}
                onBack={() => {
                  setActiveSection("all");
                  setMobileView("home");
                }}
              />
            </div>
          ) : mobileView === "detail" && selectedEntry ? (
            <div className="flex-1 overflow-hidden">
              <MobileEntryDetail
                key={selectedEntry.id}
                entry={selectedEntry}
                onBack={() => setMobileView("home")}
                onShowGenerator={() => setShowGenerator(true)}
                onCopy={handleCopy}
                onDelete={handleDeleteEntry}
                onUpdate={handleVerifiedUpdate}
                onToggleFavorite={handleToggleFavorite}
                isTrash={activeSection === "trash"}
                onRestore={handleRestoreEntry}
              />
            </div>
          ) : mobileView === "add" ? (
            <MobileAddEntry onSave={handleMobileAdd} onCancel={() => setMobileView("home")} />
          ) : (
            <MobileVaultHome
              entries={entries}
              filteredEntries={mobileFilteredEntries}
              activeSection={activeSection}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelect={handleMobileSelect}
              onOpenAdd={() => setMobileView("add")}
              onOpenHealth={() => {
                setActiveSection("health");
                setMobileView("health");
              }}
              onOpenGenerator={() => setShowGenerator(true)}
              onToggleFavorite={handleToggleFavorite}
              onSectionChange={handleSectionChange}
              onLock={handleLock}
            />
          )}
        </div>

        <div className="relative hidden flex-1 overflow-hidden md:flex">
          {!showHealth && (
            <>
              <div
                className={`will-change-[width,opacity] z-10 flex flex-shrink-0 transform-gpu flex-col overflow-hidden border-r border-white/5 bg-[#0A0D0F] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isVaultCollapsed ? "pointer-events-none w-0 opacity-0" : "w-80 opacity-100 lg:w-96"
                }`}
              >
                <div className="h-full w-80 lg:w-96">
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
                className={`absolute top-1/2 z-20 flex h-12 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#161B22] text-slate-400 shadow-xl transition-all duration-500 hover:scale-110 hover:text-[#BEF264] ${
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

      {showGenerator && (
        <PasswordGenerator
          onClose={() => setShowGenerator(false)}
          onUse={handleUsePassword}
          onShowToast={(message) => showToastMessage(message)}
        />
      )}

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
