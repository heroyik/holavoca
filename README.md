# HolaVoca - Spanish Vocabulary Learning App

HolaVoca is a vibrant, DuoLingo-inspired Spanish vocabulary learning application. It helps users master over 4,300+ Spanish words through an interactive learning path and gamified quizzes.

## Features

- 🇪🇸 **Spanish Look & Feel**: Vibrant theme using Spanish Red (`#C60B1E`) and Yellow (`#FFC400`).
- 🎮 **Gamified Learning Path**: Zigzag layout of learning units with XP, gems, and streak tracking.
- 📝 **Interactive Quizzes**: Multiple question types including translation (ES->KO, KO->ES) and gender identification.
- 🔐 **Google Login**: Integrated authentication using Auth.js (NextAuth v5). (Requires configuration)
- 📊 **Progress Tracking**: Local storage-based gamification system to keep track of your learning journey.
- 📱 **Responsive Design**: Optimized for mobile, tablet, and PC.

## Database

The app is powered by a comprehensive vocabulary database containing thousands of Spanish words, categorized into manageable learning units.

## Setup & Configuration

### Environment Variables

For Google Login to work, you need to set up a `.env.local` file. Use `.env.local.example` as a template:

1. Copy `.env.local.example` to `.env.local`.
2. Generate an `AUTH_SECRET`:
   ```bash
   npx auth secret
   ```
3. Provide your Google Client ID and Secret obtained from the [Google Cloud Console](https://console.cloud.google.com/).

### Installation

```bash
npm install
npm run dev
```

## Built With

- [Next.js 15](https://nextjs.org)
- [Auth.js v5](https://authjs.dev)
- Vanilla CSS for styling
- LocalStorage for gamification stats

---
¡Aprende español con HolaVoca!
