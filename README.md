# HolaVoca - Spanish Vocabulary Learning App

HolaVoca is a premium, gamified Spanish learning platform inspired by modern educational apps. It helps users master over 4,300+ Spanish words through a mobile-optimized **Snake Path** journey and a real-time competitive leaderboard.

---

## ✨ Key Highlights

### 🕹️ Gamified "Snake Path" UI

A winding, interactive learning path that visually guides users through 15+ units.

- **Motivational Stickers**: Every unit is labeled with engaging titles like "🌱 First Steps", "🌉 Bridge Builder", and "👑 Word Royalty".
- **Dynamic Connection**: Units are visually connected by a signature SVG "snake line" that adapts to your progress.
- **START! Callout**: A pulsing animation ensures you always know which unit to tackle next.

### 📚 Premium Aesthetics

- **Vocabulary Arsenal 📚**: Real-time count of total words available (4,300+) prominently displayed in the header.
- **My Learning Aura ✨**: A dedicated XP tracking system relocated to the sticky footer for constant visibility.
- **Textbook Lightbox**: High-quality thumbnails of "¡Hola, español! 1 & 2" that can be zoomed for detailed viewing.

---

## 🚀 Core Features

- 🏠 **Unified Navigation**: Seamlessly switch between **Learn**, **Leader**, and **Profile** views.
- 🏆 **Global Hall of Fame**: A real-time leaderboard showing the Top 10 users worldwide by XP.
- 🔐 **Google Authentication**: One-tap sign-in to sync your streaks, gems, and progress across all devices.
- ☁️ **Cloud Synchronization**: Powered by **Firebase Firestore**, ensuring your "Learning Aura" follows you everywhere.
- 📝 **Intelligent Quizzes**: Includes Korean-to-Spanish, Spanish-to-Korean, and a specialized **Spanish Gender (el/la)** logic that handles complex gendered forms.

---

## 🛠️ Technical Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router, Client Components)
- **Backend-as-a-Service**: [Firebase](https://firebase.google.com/) (Auth, Firestore, Hosting)
- **Styling**: Vanilla CSS with a bespoke premium design system.
- **Icons & Media**: [Lucide React](https://lucide.dev/) & optimized local assets.
- **Automation**: Fully configured using MCP (Model Context Protocol).

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

### Security Note

Firestore security rules are implemented to ensure that users can only read/write their own progress data, keeping your learning statistics private and secure.

---
¡Aprende español con HolaVoca! ✨🇪🇸
