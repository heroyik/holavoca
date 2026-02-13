# HolaVoca - Spanish Vocabulary Learning App

`Revision 1.3.12`

HolaVoca is a premium, gamified Spanish learning platform inspired by modern educational apps. It helps users master over 730 Spanish words through a mobile-optimized **Snake Path** journey and a real-time competitive leaderboard.

---

## 🆕 Latest Updates (v1.3.12)

- **R.1.3.12**: **Mobile Layout Optimization (Galaxy S25)**.
  - **Balanced Header Spacing**: Adjusted header padding to 12px on both sides for perfect left-right symmetry on mobile devices.
  - **Footer Text Consistency**: Unified footer navigation text size (13px) to match "My Learning Aura" for visual harmony.
  - **Compact Footer**: Reduced icon-text gap from 4px to 2px for a tighter, more professional mobile footer.
- **R.1.3.11**: **Header Visual Hierarchy & Regression Testing**.
  - **Enhanced Title Emphasis**: Increased "HolaVoca" title size and weight for better brand focus with Spanish aesthetic.
  - **Subtle Version Badge**: De-emphasized version info with minimal gray styling for cleaner visual hierarchy.
  - **Footer Stats Integration**: Moved streak/gems to footer's aura bar for streamlined header design.
  - **Automated Testing**: Added Playwright regression test suite covering Header, Footer, and Quiz functionality.
- **R.1.3.10**: **Compact Header Redesign & Icon Repositioning**.
  - **High-Efficiency Header**: Redesigned the top navigation bar into a single horizontal row, reclaiming ~100px of vertical space. 
  - **Icon Repositioning**: Moved streak (🔥) and gem (💎) icons to the left of the progress bar for better visual grouping and flow.
  - **Integrated Progress Bar**: Replaced the absolute-positioned progress bar with a refined flexible container bar.
- **R.1.3.9**: **CSS Standardization & 100% Lint Compliance**.
  - **Utility-First Architecture**: Migrated all remaining inline styles to standardized utility classes in `globals.css`. 
  - **Zero-Lint State**: Resolved all React purity errors, `useEffect` cascades, and production build type gaps.
- **R.1.3.8**: **Architectural Refinement & Review Sync Fix**.
- **R.1.3.7**: **Firestore Integration & Review Persistence**.
  - **Cloud Sync**: Mistakes are now fully synchronized with Firebase Firestore, allowing you to pick up your review session on any device.
  - **Manual Management**: Added "Borrar todo" and individual word removal buttons. Mistakes now persist until you decide to remove them.
- **R.1.3.6**: **Mistake Review System**.
  - **Repaso Focused Learning**: New "Review" (Revisión) tab tracks every incorrect answer and shows a mistake counter for each word.
  - **Custom Review Sessions**: One-tap "Repasar ahora" button launches a specialized quiz containing only your missed words.
- **R.1.3.5**: **Smart Selection Persistence**.
  - **Session Memory**: Injected `sessionStorage` logic to ensure book selections (Vol 1/2) are remembered across navigation within the same browser session.
- **R.1.3.4**: **Intuitive UI Placement**.
  - **Indicator Symmetry**: Swapped textbook thumbnail placement (Left for Vol 1, Right for Vol 2) for immediate source recognition.
- **R.1.3.3**: **Perfect Multi-Book Balance**.
  - **Proportional Interleaving**: Implemented an advanced sorting algorithm that maintains a 50/50 balance between selected volumes across all levels.
- **R.1.3.2**: **Multi-Book Experience & UI Clarity**.
  - **Interleaved Mixing**: Refined vocabulary generation to mix Volume 1 and Volume 2.
  - **Visual Aids**: Added textbook cover indicators (thumbnails) to every quiz question.
- **R.1.3.0**: **Rock-Solid Stability & UI Polish**.
  - **Stability & Performance**: Adjusted background sync logic for smoother performance.
  - **Build Safety**: Refactored architecture for strictly client-side Firebase initialization, ensuring zero build failures.
  - **Runtime Resilience**: Added smart guards to prevent crashes if API keys are missing, defaulting to an elegant "Offline/Demo Mode".
  - **Header UI**: Renamed the stats badge to "**VOCAB STASH**" for a more hip, casual feel.
  - **CI/CD Integration**: Optimized GitHub Actions workflow to support secure secret injection during production build.
- **R.1.2.2**: **Security & Architecture**.
  - **Enhanced Security**: Migrated all Firebase credentials to environment variables (`.env.local`) to prevent accidental exposure.
  - **API Hardening**: Implemented strict Google Cloud API restrictions, limiting keys to specific HTTP referrers (Production/Localhost) and essential services (Firestore, Auth, Installations).
- **R.1.2.1**: **Textbook Selection & Data Download**.
  - **Textbook Selection**: Added ability to filter vocabulary by **Textbook Volume (Vol 1 / Vol 2)** via interactive book covers.
  - **Vocabulary Download**: One-tap JSON download feature by clicking the "**VOCAB STASH**" count in the header.
  - **Visual Feedback**: Selected books are highlighted, while unselected ones are dimmed.
- **R.1.2.0**: **Vocabulary Overhaul & Robustness**.
  - **Overhauled Vocabulary**: Reorganized learning path to be **Difficulty-Based** (Priority Words -> Complex Words) instead of Alphabetical.
  - **No Alphabetical Order**: Words within tiers are shuffled to keep learning effective.
  - **Offline Demo Mode**: Leaderboard now gracefully falls back to "Demo Data" if the backend is unreachable, ensuring the app never looks broken.
  - **Verified Production DB**: Validated successfully against live Firebase Firestore.
- **R.1.1.6**: **Leaderboard Polish**.
  - **Smart Fallback**: If Firestore index is missing, automatically switches to client-side sorting to prevent infinite loading.
  - **UI**: Added "Hall of Fame" title and 👑 Crown icon for 1st place.
  - **Admin**: Strict reset logic for cleaner testing.
- **R.1.1.5**: **Leaderboard Fallback**. Added robust error handling to prevent infinite loading when Firestore indexes are missing.
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

- **Total number of words 📚**: Real-time count of total words available prominently displayed in the header. Click to download the dataset as JSON.
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

### 🌐 Deployment & GitHub Secrets

For the application to function correctly on GitHub Pages, you MUST configure **GitHub Actions Secrets**.

1. Go to your repository on GitHub.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Add the following **Repository Secrets**:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

> [!IMPORTANT]
> If you have an **Environment** named `github-pages` configured, make sure the secrets are added to that specific environment.

1. Once the secrets are set, push these changes or manually trigger the **Deploy Next.js site to Pages** workflow.

### 🔐 Security: API Key Allowlist

If you have **API Key Restrictions** enabled in the Google Cloud Console (recommended), you must add the following domains to your **HTTP Referrer Allowlist**:

1. Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Click on your **Firebase API Key**.
3. Under **Website restrictions**, add these patterns:
    - `https://heroyik.github.io/*` (Your deployment)
    - `https://holavoca-app-12345.firebaseapp.com/*` (Firebase Auth Handler)
    - `localhost:3005/*` (Local development)

---
¡Aprende español con HolaVoca! ✨🇪🇸
