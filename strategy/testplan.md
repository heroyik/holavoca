# HolaVoca Automation Test Plan (v1.4.0)

Comprehensive testing strategy using Playwright to ensure the stability and correctness of the v1.4.0 upgrade.

## 1. Test Objectives

- Verify total word coverage (730 words) across 15 difficulty-based levels.
- Validate advanced quiz logic (POS-based distractors, "Don't Know" button).
- Ensure user settings (Easy Spanish, Free Access) function correctly across sessions.
- Confirm UI accuracy (failure counts, mastery indicators) on the Level Map.

## 2. Test Cases

| ID | Category | Description | Rationale |
| :--- | :--- | :--- | :--- |
| **TC-VOC-01** | Vocabulary | Verify all 730 words from Book 1 & 2 are accessible. | Regression & Coverage |
| **TC-VOC-02** | Levels | Confirm words are sorted by difficulty (short/easy -> long/hard). | User Experience |
| **TC-QUIZ-01** | Quiz | Validate that 3 distractors match the Part of Speech (POS). | Logic Accuracy |
| **TC-QUIZ-02** | Quiz | "Don't Know" button reveals answer and adds to review list. | Core Feature |
| **TC-SET-01** | Settings | "Exclude easy cognates" toggle removes identified cognates. | Customization |
| **TC-SET-02** | Settings | "Unlock all levels" allows instant access to Level 15. | Ease of Use |
| **TC-UI-01** | UI | Display failed word counts on uncleared, attempted levels. | Progression Feedback |
| **TC-UI-02** | UI | Show "Mastery" (Crown/Gold) on levels with 0 mistakes. | Gamification |

## 3. Playwright Automation Strategy

### Environment Setup

- **Framework**: Playwright with TypeScript.
- **Base URL**: <http://localhost:3000> (Local) or GitHub Pages URL.
- **Devices**: Focus on Mobile (Galaxy S25) and Tablet views.

### Test Script Structure

- `tests/v1.4.0/vocab.spec.ts`: Data structure and distribution tests.
- `tests/v1.4.0/quiz_logic.spec.ts`: POS and "Don't Know" button interactions.
- `tests/v1.4.0/settings.spec.ts`: Profile toggle persistence and effect.
- `tests/v1.4.0/ui_map.spec.ts`: Visual verification of failure counts and mastery indicators.

## 4. Reporting Plan

### Detailed Test Execution Report

- **Tool**: `playwright-html-extra` or custom JSON-to-Markdown reporter.
- **Content**:
  - **Summary**: Total Passed/Failed/Skipped.
  - **Step-by-Step logs**: DOM interactions and assertions per TC.
  - **Screenshots**: Automatic capture on failure.
  - **Artifacts**: Console logs and network trace (HAR) for debugging.
- **Storage**: Reports will be saved to `test-results/` and summarized in `strategy/test_report.md` after each run.

## 5. Verification Schedule

- **Phase 1**: Initial logic verification via unit tests (Jest/Vitest).
- **Phase 2**: E2E verification of UI components.
- **Phase 3**: Cross-browser sanity checks (Chromium, WebKit).
