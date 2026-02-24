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

### "Easy Spanish" (English Cognates) Toggle

- **Concept**: Some words are nearly identical to English (e.g., *actor*, *model*, *hotel*).
- **Toggle**: Add an ON/OFF switch in the Profile tab: "Exclude easy cognates".
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
    - Build the settings UI section.
5. **`LevelMap` (Snake Path)**:
    - Update the UI to render the cumulative failure count for attempted units.
