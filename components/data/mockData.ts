export type StrengthLevel = "Strong" | "Medium" | "Weak";
export type Category = "Social" | "Banking" | "Work" | "Shopping" | "Email" | "Development" | "Cloud";

export interface PasswordEntry {
  id: string;
  name: string;
  username: string;
  password: string;
  website: string;
  category: Category;
  strength: StrengthLevel;
  strengthScore: number;
  isFavorite: boolean;
  hasTotp: boolean;
  breached: boolean;
  reused: boolean;
  lastChanged: string;
  created: string;
  notes: string;
  has2FA: boolean;
  color: string; // avatar bg color
  passwordHistory: { password: string; date: string; strength: StrengthLevel }[];
  checklist: {
    longEnough: boolean;
    hasUppercase: boolean;
    hasNumbers: boolean;
    hasSpecial: boolean;
  };
}

export const MOCK_ENTRIES: PasswordEntry[] = [
  {
    id: "1",
    name: "GitHub",
    username: "dev@email.com",
    password: "Gh!tbR@k9#mZ3vPq",
    website: "github.com",
    category: "Development",
    strength: "Strong",
    strengthScore: 92,
    isFavorite: true,
    hasTotp: true,
    breached: false,
    reused: false,
    lastChanged: "Oct 12, 2023",
    created: "Jan 04, 2022",
    notes: "Primary development account. SSH keys stored separately.",
    has2FA: true,
    color: "#1C2128",
    passwordHistory: [
      { password: "OldPassword123!", date: "Jan 04, 2022", strength: "Medium" },
      { password: "BetterPass#99", date: "Mar 15, 2022", strength: "Strong" },
    ],
    checklist: { longEnough: true, hasUppercase: true, hasNumbers: true, hasSpecial: true },
  },
  {
    id: "2",
    name: "Gmail",
    username: "user@gmail.com",
    password: "Gm@1lSecure#2024",
    website: "gmail.com",
    category: "Email",
    strength: "Strong",
    strengthScore: 88,
    isFavorite: true,
    hasTotp: true,
    breached: false,
    reused: false,
    lastChanged: "Sep 01, 2024",
    created: "Feb 10, 2020",
    notes: "",
    has2FA: true,
    color: "#1a1a2e",
    passwordHistory: [
      { password: "gmail2020pass", date: "Feb 10, 2020", strength: "Weak" },
    ],
    checklist: { longEnough: true, hasUppercase: true, hasNumbers: true, hasSpecial: true },
  },
  {
    id: "3",
    name: "Netflix",
    username: "user@gmail.com",
    password: "netflix123",
    website: "netflix.com",
    category: "Social",
    strength: "Weak",
    strengthScore: 22,
    isFavorite: false,
    hasTotp: false,
    breached: true,
    reused: true,
    lastChanged: "Jun 05, 2022",
    created: "Jun 05, 2022",
    notes: "Family account shared with 3 members.",
    has2FA: false,
    color: "#1a0a0a",
    passwordHistory: [],
    checklist: { longEnough: false, hasUppercase: false, hasNumbers: true, hasSpecial: false },
  },
  {
    id: "4",
    name: "Chase Bank",
    username: "johndoe",
    password: "Ch@se$ecure2024!",
    website: "chase.com",
    category: "Banking",
    strength: "Strong",
    strengthScore: 95,
    isFavorite: true,
    hasTotp: true,
    breached: false,
    reused: false,
    lastChanged: "Nov 20, 2024",
    created: "Mar 02, 2019",
    notes: "Primary checking account.",
    has2FA: true,
    color: "#0a1628",
    passwordHistory: [
      { password: "Chase2019Pass!", date: "Mar 02, 2019", strength: "Medium" },
    ],
    checklist: { longEnough: true, hasUppercase: true, hasNumbers: true, hasSpecial: true },
  },
  {
    id: "5",
    name: "Twitter/X",
    username: "@johndoe",
    password: "T3itter_2022",
    website: "x.com",
    category: "Social",
    strength: "Medium",
    strengthScore: 56,
    isFavorite: false,
    hasTotp: false,
    breached: false,
    reused: false,
    lastChanged: "Apr 10, 2022",
    created: "Apr 10, 2022",
    notes: "",
    has2FA: false,
    color: "#0a0f1a",
    passwordHistory: [],
    checklist: { longEnough: false, hasUppercase: true, hasNumbers: true, hasSpecial: true },
  },
  {
    id: "6",
    name: "AWS Console",
    username: "admin@company.com",
    password: "AWS!c0ns0le$2024#Prm",
    website: "aws.amazon.com",
    category: "Cloud",
    strength: "Strong",
    strengthScore: 98,
    isFavorite: true,
    hasTotp: true,
    breached: false,
    reused: false,
    lastChanged: "Dec 01, 2024",
    created: "Jul 14, 2021",
    notes: "Root account. Use IAM roles for daily work.",
    has2FA: true,
    color: "#1a0f00",
    passwordHistory: [],
    checklist: { longEnough: true, hasUppercase: true, hasNumbers: true, hasSpecial: true },
  },
  {
    id: "7",
    name: "Figma",
    username: "designer@co.com",
    password: "FigmaDesign2023",
    website: "figma.com",
    category: "Work",
    strength: "Medium",
    strengthScore: 61,
    isFavorite: false,
    hasTotp: false,
    breached: false,
    reused: false,
    lastChanged: "Aug 22, 2023",
    created: "Aug 22, 2023",
    notes: "",
    has2FA: false,
    color: "#1a0a1a",
    passwordHistory: [],
    checklist: { longEnough: true, hasUppercase: true, hasNumbers: true, hasSpecial: false },
  },
  {
    id: "8",
    name: "Notion",
    username: "user@email.com",
    password: "N0t!0n$ecure#24",
    website: "notion.so",
    category: "Work",
    strength: "Strong",
    strengthScore: 84,
    isFavorite: false,
    hasTotp: false,
    breached: false,
    reused: false,
    lastChanged: "Jan 05, 2025",
    created: "Jan 05, 2025",
    notes: "Workspace for personal project notes.",
    has2FA: false,
    color: "#111111",
    passwordHistory: [],
    checklist: { longEnough: true, hasUppercase: true, hasNumbers: true, hasSpecial: true },
  },
];
