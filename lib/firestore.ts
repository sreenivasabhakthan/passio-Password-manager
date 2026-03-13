import {
  doc, setDoc, getDoc, collection, getDocs, deleteDoc, updateDoc, serverTimestamp, FieldValue
} from "firebase/firestore";
import { db } from "./firebase";
import { PasswordEntry } from "@/components/data/mockData";

/* ── Hash utility (SHA-256 via Web Crypto) ── */
export async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "_passio_salt_2024");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}

/* ── User Profile ── */
export interface UserProfile {
  email: string;
  displayName: string;
  pinHash: string;
  masterPasswordHash: string;
  recoveryEmail: string;
  createdAt: FieldValue;
  updatedAt: FieldValue;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUserProfile(uid: string, profile: Omit<UserProfile, "createdAt" | "updatedAt">) {
  await setDoc(doc(db, "users", uid), {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserPin(uid: string, pinHash: string) {
  await updateDoc(doc(db, "users", uid), { pinHash, updatedAt: serverTimestamp() });
}

/* ── Vault Entries (per user) ── */
export async function saveEntry(uid: string, entry: PasswordEntry) {
  await setDoc(doc(db, "users", uid, "entries", entry.id), {
    ...entry,
    updatedAt: serverTimestamp(),
  });
}

export async function saveAllEntries(uid: string, entries: PasswordEntry[]) {
  const promises = entries.map(entry => saveEntry(uid, entry));
  await Promise.all(promises);
}

export async function loadEntries(uid: string): Promise<PasswordEntry[]> {
  const snap = await getDocs(collection(db, "users", uid, "entries"));
  return snap.docs.map(d => d.data() as PasswordEntry);
}

export async function deleteEntry(uid: string, entryId: string) {
  await deleteDoc(doc(db, "users", uid, "entries", entryId));
}

/* ── Trash (per user) ── */
export async function saveTrashEntry(uid: string, entry: PasswordEntry) {
  await setDoc(doc(db, "users", uid, "trash", entry.id), {
    ...entry,
    trashedAt: serverTimestamp(),
  });
}

export async function loadTrashEntries(uid: string): Promise<PasswordEntry[]> {
  const snap = await getDocs(collection(db, "users", uid, "trash"));
  return snap.docs.map(d => d.data() as PasswordEntry);
}

export async function deleteTrashEntry(uid: string, entryId: string) {
  await deleteDoc(doc(db, "users", uid, "trash", entryId));
}
