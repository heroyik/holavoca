# HolaVoca - Spanish Vocabulary Learning App

`Revision 1.2.1`

HolaVoca is a premium, gamified Spanish learning platform inspired by modern educational apps. It helps users master over 4,300+ Spanish words through a mobile-optimized **Snake Path** journey and a real-time competitive leaderboard.

---

## 🆕 Latest Updates (v1.2.1)

- **R.1.2.1**: **Vocabulary Download**.
  - Added a one-tap download feature for the entire vocabulary dataset (JSON format) by clicking the "**전체 데이터**" count in the header.
  - Filename format: `오늘날짜-voca.json` (e.g., `2026-02-12-voca.json`).
- **R.1.2.0**: **Vocabulary Overhaul & Robustness**.
  - **Overhauled Vocabulary**: Reorganized learning path to be **Difficulty-Based** (Priority Words -> Complex Words) instead of Alphabetical.
  - **No Alphabetical Order**: Words within tiers are shuffled to keep learning effective.
  - **Offline Demo Mode**: Leaderboard now gracefully falls back to "Demo Data" if the backend is unreachable, ensuring the app never looks broken.
  - **Verified Production DB**: Validated successfully against live Firebase Firestore.
- **R.1.1.6**: **Leaderboard Polish**.
  - **Smart Fallback**: If Firestore index is missing, automatically switches to client-side sorting to prevent infinite loading.
  - **UI**: Added "Hall of Fame" title and 👑 Crown icon for 1st place.
  - **Admin**: Strict reset logic for cleaner testing.
- **R.1.1.5**: **Leaderboard Fallback**. Added robust error handling.
 (v1.1.5) to prevent infinite loading when Firestore indexes are missing.
- **🛠️ Admin Cheat Codes**: Added a hidden Developer Console for manual stat management (accessible via 5-tap on profile picture). restricted to admin email.
- **🔓 Level Selector**: Admins can now instantly unlock any level from 1 to 15, automatically calculating XP, Gems, and Unit completions.
- **🔢 Version Automation**: Centralized version management to ensure the Revision tag always reflects the latest build.
- **⚡ Instant Sync Fix**: Tweaked the initialization logic to load local data immediately on startup. This prevents the "Level 1 Reset" scare while cloud data is syncing in the background.
- **🎨 UI Polish**: Improved the positioning of the version tag (`R.1.1.2`) for a cleaner look.
- **⏱️ Extended Timeout**: Increased the Leaderboard loading timeout to 20 seconds to accommodate slower mobile networks.
- **📱 Mobile Leaderboard Fix**: Resolved an "Infinite Loading" issue on Galaxy S25 and other mobile devices by implementing a 10-second timeout and a manual "Retry" mechanism.
- **🔄 Smart History Sync**: Implemented a "Merge Strategy" for login. Instead of overwriting data, the app now intelligently combines local and cloud progress, keeping the highest XP/Streak and merging completed units.

---

## ✨ Key Highlights

### 🕹️ Gamified "Snake Path" UI

A winding, interactive learning path that visually guides users through 15+ units.

- **Motivational Stickers**: Every unit is labeled with engaging titles like "🌱 First Steps", "🌉 Bridge Builder", and "👑 Word Royalty".
- **Dynamic Connection**: Units are visually connected by a signature SVG "snake line" that adapts to your progress.
- **START! Callout**: A pulsing animation ensures you always know which unit to tackle next.

### 📚 Premium Aesthetics

- **전체 데이터 📚**: Real-time count of total words available prominently displayed in the header. Click to download the dataset as JSON.
- **My Learning Aura ✨**: A dedicated XP tracking system relocated to the sticky footer for constant visibility.
- **Textbook Lightbox**: High-quality thumbnails of "¡Hola, español! 1 & 2" that can be zoomed for detailed viewing.

---

## 🚀 Core Features

- 🏠 **Unified Navigation**: Seamlessly switch between **Learn**, **Leader**, and **Profile** views using a responsive tab bar.
- 🏆 **Global Hall of Fame**: A real-time leaderboard showing the Top 10 users worldwide by XP. Optimized with error-safe loading states.
- 🔐 **Google Authentication**: One-tap sign-in to sync your streaks, gems, and progress across all devices.
- ☁️ **Cloud Synchronization**: Powered by **Firebase Firestore**, ensuring your "Learning Aura" follows you everywhere.
- 📝 **Intelligent Quizzes**: Includes Korean-to-Spanish, Spanish-to-Korean, and a specialized **Spanish Gender (el/la)** logic that handles complex gendered forms.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Client Components)
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **Styling**: Vanilla CSS with a bespoke premium design system.
- **Icons & Media**: [Lucide React](https://lucide.dev/) & optimized local assets.
- **Automation**: Fully configured using MCP (Model Context Protocol) for instant backend deployment.

---

## 🔧 Setup & Local Development

### Prerequisites

- Node.js 18+
- A Google Firebase Project (for Auth & Firestore)

### Installation

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Configure your Firebase credentials in `src/lib/firebase.ts`.
3. Start the development server:

   ```bash
   npm run dev
   ```

### 🔒 Security & Performance

- **Firestore Security Rules**: Configured for "Public Read / Owner Write" access. This allowing the Global Leaderboard to fetch rankings while ensuring only authenticated users can modify their own progress.
- **Resilient Data Fetching**: Implemented non-blocking loading handlers in the Leaderboard to ensure the UI remains responsive even during high latency.

---
¡Aprende español con HolaVoca! ✨🇪🇸
