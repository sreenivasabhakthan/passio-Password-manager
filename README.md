<div align="center">
  <img src="public/logo.png" alt="Passio Logo" width="120" />
  <h1>Passio</h1>
  <p><strong>The Digital Hoard</strong></p>
  <p>Your secrets. Everywhere. Securely.</p>
</div>

---

**Passio** is a premium, secure, and fully responsive password manager built with modern web technologies. Designed with a stunning dark-glassmorphism UI and neon accents, it provides a seamless experience for managing your digital credentials across all your devices.

## ✨ Features

- 🔐 **End-to-End Security Architecture:** Master password and 6-digit PIN are strictly hashed via SHA-256 before being verified.
- ☁️ **Cloud Sync & Cross-Device Access:** Powered by Google Firebase Firestore, your secure vault is synced instantly to any device you log into.
- 🎨 **Stunning UI/UX:** A butter-smooth, highly responsive interface built with Tailwind CSS. Includes dynamic frosted glass effects, sleek animations, and custom scrollbars.
- 📱 **Mobile-First Responsiveness:** Fluid layout transitions from a 3-panel desktop view to a clean, bottom-tab-navigated mobile application.
- 🔑 **Password Generator:** Built-in tool to forge incredibly strong passwords, with visual strength metering and passphrases.
- 🛡️ **Vault Lock & Verification Gates:** Sensitive actions (like changing a password) are gated behind your custom PIN, offering hardware/software-level protection flow.
- 💀 **The Graveyard:** Accidentally deleted a credential? Restore it instantly from the built-in trash system.
- 👤 **Google Authentication:** 1-click login setup using Firebase Authentication.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React 18)
- **Styling:** [Tailwind CSS v3](https://tailwindcss.com/)
- **Database & Sync:** [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication:** Google OAuth via [Firebase Auth](https://firebase.google.com/docs/auth)
- **Icons:** Google Material Symbols
- **Fonts:** Inter (Google Fonts)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/passio.git
cd passio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Firebase Configuration
To enable cloud sync and authentication, you must connect Passio to your own Firebase project:

1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Google Sign-In** under Authentication.
3. Create a **Firestore Database** (Test Mode or configure secure rules).
4. Register a Web App in your Firebase project to get your API keys.
5. Create a `.env.local` file in the root directory and add your credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 🔒 Security Best Practices

> **Note on Firebase Rules:** For a production deployment, it is critical to secure your Firestore database so users can only ever access their own credentials. Apply these rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      // Users can only read and write their own encrypted documents
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 🎨 Design System
- **Colors:** Deep Dark (`#050708`), Slate (`#0A0D0F`), Neon Green (`#BEF264`)
- **Typography:** Inter (sans-serif)
- **Interactive:** Micro-interactions (hover glows, button scales, error shaking) designed to provide instant tactile feedback.

---

<div align="center">
  <p>Built with ❤️ and Next.js</p>
</div>
