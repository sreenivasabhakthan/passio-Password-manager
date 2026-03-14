"use client";

import { PasswordEntry } from "./mockData";

export function calculateStrength(password: string): number {
  let score = 0;
  if (password.length >= 12) score += 25;
  if (password.length >= 20) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[a-z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  return Math.min(score, 100);
}

export function getStrengthLabel(score: number): PasswordEntry["strength"] {
  if (score >= 80) return "Strong";
  if (score >= 50) return "Medium";
  return "Weak";
}

export function buildChecklist(password: string) {
  return {
    longEnough: password.length >= 16,
    hasUppercase: /[A-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}
