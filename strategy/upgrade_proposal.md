# HolaVoca Upgrade Proposal (v1.4.0)

Analysis and technical plan for the next version of the Spanish learning app.

## 1. Vocabulary & Level Restructuring

### Analysis of Current System

- **Status**: 15 levels cover ~300 words (20 words/unit).
- **Total Words**: Book 1 (547) + Book 2 (183) = 730 words.
- **Problem**: 15 levels are insufficient to cover all words at the current density.

### Proposed Level Logic (Difficulty-Based)

1. **Total Coverage**: Map all 730 words into exactly 15 levels.
2. **Adaptive Unit Size**: Each level will have approximately **48-50 words**.
3. **Difficulty Sorting**: Words will be sorted by:
    - **Length**: Shorter words are generally easier.
    - **Accents**: Words with accents (á, é, í, ó, ú, ñ) are slightly harder.
    - **English Similarity**: Cognates are easiest.
    - **Order**: Level 1 (Cognates + Short) -> Level 15 (Long + Accents + Abstract).

## 2. Advanced Quiz Logic

### POS-Based Distractors (Part of Speech)

- **Heuristic**: Detect POS from grammar info or word endings.
  - **Nouns**: Entries with `m`, `f`, `m/f`.
  - **Verbs**: Spanish words ending in `-ar`, `-er`, `-ir`.
  - **Adjectives/Others**: Remainder or Korean meanings ending in a specific way.
- **Implementation**: When generating 3 distractors, prioritize words of the same POS category to make the quiz more challenging and logical.

### "Don't Know" Button (No Lo Sé)

- **UI**: Add a button below or next to the options.
- **Action**:
    1. Show the correct answer immediately with a highlight.
    2. Add the word to the mistake list automatically.
    3. Transition to the next question after a short delay (or manual click).

## 3. User Customization (Profile Tab)

- **Easy Spanish** (English Cognates) Toggle: Add an ON/OFF switch in the Profile tab: "Exclude easy cognates".
- **Free Level Access**: Add a toggle in the Profile tab: "Unlock all levels". When enabled, users can start any level from 1 to 15 regardless of whether lower levels were cleared.
- **Similarity Logic**: Use a simplified Levenshtein distance or a curated list of ~50 common cognates.

## 4. Enhanced Variety & Engagement

### Progression UI

- Update the Snake Path to show more visual variety per level (different colors or icons for difficulty tiers).
- Add "Mastery" indicators for levels completed with 0 mistakes.
- **Failed Word Count**: For levels that were attempted but not cleared, display the number of incorrect words (including "Don't Know" selections) on the level icon/card. Hide this for unattempted levels.

## Technical Implementation Steps

1. **`vocab.ts`**:
    - Update `getUnits` to support a fixed number of levels (15).
    - Implement the difficulty sorting algorithm.
2. **`GamificationContext.tsx`**:
    - Add `settings: { excludeCognates: boolean }` to `UserStats`.
3. **`Quiz.tsx`**:
    - Implement POS classification helper.
    - Update `generateOptions` to weight distractors by POS.
    - Add "Don't Know" button and logic.
4. **`UserProfile.tsx`**:
    - Build the settings UI section (Cognates toggle, Unlock all levels toggle).
5. **`LevelMap` (Snake Path)**:
    - Update the UI to render the cumulative failure count for attempted units.
    - Implement conditional locking logic based on the "Unlock all levels" setting.

---

## Phase 6: Social & Engagement Upgrades

### 6-1. Global TOP 20 Hardest Words (REVIEW Tab)

**Goal**: Show all users the 20 most commonly missed words, creating a shared challenge.

**Initial Seed Data Strategy**:

- Pre-seed 20 hardest words with synthetic fail counts to bootstrap the list.
- Difficulty ranked by word complexity (length, accents, low cognate similarity).
- Synthetic counts: 1st place = 20 fails, 2nd = 19 fails, ..., 20th = 1 fail.
- As real users submit mistakes, Firestore counters accumulated per word, gradually replacing synthetic values organically.

**Data Model** (Firestore — shared collection):

```text
/globalWordStats/{spanishWord}
  failCount: number    ← increment on each real mistake
  seedCount: number    ← initial synthetic count (used only for bootstrapping)
  totalCount: number   ← failCount + seedCount
```

**Implementation**:

- `GamificationContext`: After `recordMistake`, increment `/globalWordStats/{word}.failCount` via Firestore `increment(1)`.
- REVIEW tab: Query top 20 by `totalCount` descending. Cache result in component state (refresh on tab focus, not every render).
- Display: Ordered list with rank badge, Spanish word, Korean meaning, and cumulative fail count.
- **Read Optimization**: Use a single Firestore query (`limit(20)`, ordered by `totalCount`). Do NOT poll; fetch once per session.

---

### 6-2. Live Ranking & Floating Rank Notification

**Goal**: Show users their live rank on app entry, and notify them with a floating toast when their rank changes mid-quiz.

**App Entry Rank Display**:

- On the LEARN tab header, display current rank (e.g., `🏅 #4 of 1,243`).
- Fetched once on login/page load from a Firestore leaderboard query.

**Floating Rank Notification**:

- After each `completeUnit`, re-query rank. If rank improved, show a floating toast:
  - UI: Fixed-position overlay (bottom-right), slide-in animation, auto-dismiss after 4s.
  - Content: `🎉 You moved up to #3! (+2 spots)`
- If user is **#1**, differentiate the UI:
  - 👑 Crown emoji on the avatar/header.
  - Gold gradient background on the LEARN tab header.
  - Toast: `🥇 You're #1! Keep it up!`

**Implementation**:

- Leaderboard rank = count of users with XP > myXP + 1 (Firestore aggregate or client-side sort of cached list).
- Store `lastKnownRank` in local state; compare after quiz end.
- Floating toast: absolute positioned `div` with CSS animation (`@keyframes slideUp`).

---

### 6-3. No Lo Sé Button — Funnier UX

**Goal**: Make the "Don't Know" button more playful and memorable to reduce quiz anxiety.

**Changes**:

- Icon: Add 🤷 emoji or a shrug icon (Lucide `HelpCircle`).
- Label: Change to `🤷 No Lo Sé... (I have no idea!)` or localizable variant.
- Animation: Button jiggles slightly on hover (CSS `@keyframes jiggle`).
- Feedback: When clicked, show a fun reaction instead of the generic incorrect feedback bar:
  - e.g., `😅 That's okay! Here's the answer:` with a lighter pink background.
- Sound: If sound is enabled, play a soft "whoops" tone instead of the error sound.

---

### 6-4. Contextual DELE Sentence After Correct Answer

**Goal**: When a user answers correctly, instead of just showing "Excellent!", teach a natural conversational sentence using that word.

**Data Source**:

- Curate a map of `spanishWord → { sentence: string, translation: string }` for DELE A1/A2 level expressions.
- Start with the 100 most common words in the dataset.
- Example: `guitarra → { sentence: "Toco la guitarra todos los días.", translation: "I play guitar every day." }`

**UI Changes** (in `Quiz.tsx`):

- Replace "Excellent!" text with:

  ```text
  ✅ Correcto!
  💬 "Toco la guitarra todos los días."
     (I play guitar every day.)
  ```

- Show sentence in a styled card with a soft green background.
- If no sentence exists for a word, fall back to `✅ ¡Correcto!` only.

**Data File**: `src/data/dele_sentences.json` — keyed by Spanish word.

---

### 6-5. Leaderboard Seed Data (One-Time Setup)

**Goal**: Pre-populate the leaderboard with 9 fictional international users so the board isn't empty for early users.

**Seed Users** (multilingual names, XP 1200–2800):

| Rank | Display Name | Language | XP |
| --- | --- | --- | --- |
| TBD | 김민준 (MinJun Kim) | Korean | 2780 |
| TBD | Yuki Tanaka | Japanese | 2650 |
| TBD | Nguyen Thi Lan | Vietnamese | 2510 |
| TBD | 李雨桐 (Yutong Li) | Chinese | 2390 |
| TBD | Sarah Mitchell | English | 2240 |
| TBD | 박서연 (Seoyeon Park) | Korean | 2100 |
| TBD | Haruto Sato | Japanese | 1980 |
| TBD | Emma Tremblay | English | 1820 |
| TBD | Trần Quốc Bảo | Vietnamese | 1640 |
| TBD | 王芳 (Wang Fang) | Chinese | 1420 |

**Implementation**:

- Run a one-time Firestore seed script (`scripts/seed-leaderboard.ts`).
- Each entry written to `/leaderboard/{userId}` with fields: `displayName`, `xp`, `gems`, `streak`.
- Current real user(s) are included in the board — seed script checks for existing UIDs and skips them.
- **This script is run exactly once** and then archived. Never re-run to avoid duplicate seeding.
