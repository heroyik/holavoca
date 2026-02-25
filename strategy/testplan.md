# HolaVoca Automation Test Plan (v2.0.0)

Comprehensive testing strategy using Playwright to ensure the stability and correctness of the v2.0.0 official release.

## 1. Test Objectives

- Verify total word coverage (721 unique words) across 15 static difficulty-based levels.
- Validate advanced quiz logic (POS-based distractors, "Don't Know" button, Combo Cheering).
- Ensure user settings (Easy Spanish, Free Access, Sound/Haptics) function correctly and persist.
- Confirm UI accuracy (failure counts, mastery indicators, dual-volume mistake badges).
- Validate social features (Global Top 20 Hardest Words, Live Ranking notifications).
- Ensure cross-browser persistence (Firestore immediate sync for deletions).

## 2. Test Cases

| ID | Category | Description | Rationale |
| :--- | :--- | :--- | :--- |
| **TC-VOC-01** | Vocabulary | Verify all 721 unique words from Vol 1 & 2 are accessible. | Regression & Coverage |
| **TC-VOC-02** | Levels | Confirm static unit partitioning (approx 48-50 words/unit). | System Integrity |
| **TC-QUIZ-01** | Quiz | Validate that 3 distractors match the Part of Speech (POS). | Logic Accuracy |
| **TC-QUIZ-02** | Quiz | "Don't Know" button reveals answer and adds to review list immediately. | Core Feature |
| **TC-QUIZ-03** | Quiz | Combo Cheering triggered after 3+ correct answers (Audio/Haptic). | Engagement |
| **TC-SET-01** | Settings | "Exclude easy cognates" toggle removes identified cognates. | Customization |
| **TC-SET-02** | Settings | "Unlock all levels" allows instant access to all units. | Dev/Admin Tools |
| **TC-SET-03** | Settings | Sound/Haptic toggles correctly enable/disable feedback. | Accessibility |
| **TC-SOCIAL-01** | Social | Global TOP 20 list in REVIEW tab updates correctly via Firestore. | Engagement |
| **TC-SOCIAL-02** | Social | Live Rank slide-in toast shown when rank improves post-quiz. | Motivation |
| **TC-UI-01** | UI | Display dual-vol mistake badges (Red/Purple) on Level Map. | Progression Feedback |
| **TC-UI-02** | UI | Show "Thumb Up" (Mastery) on levels with 0 mistakes. | Gamification |
| **TC-PERS-01** | Persistence| Immediate Firestore sync when deleting words from Review list. | Data Reliability |
| **TC-RESP-01** | UI (Mobile) | Validate UI integrity on Galaxy S25 (360x780, DPR 3). | Responsiveness |

## 3. Playwright Automation Strategy

### Environment Setup

- **Framework**: Playwright with TypeScript.
- **Base URL**: <http://localhost:3000>
- **Devices**: Focus on Mobile (Galaxy S25) and Tablet views.

### Test Script Structure

- `tests/v2.0.0/vocab.spec.ts`: Unit partitioning and distribution tests.
- `tests/v2.0.0/quiz_logic.spec.ts`: POS weight, "No Lo Sé", and Combo feedback.
- `tests/v2.0.0/settings.spec.ts`: Profile toggle persistence and effect (Sound/Haptics).
- `tests/v2.0.0/social.spec.ts`: Verification of Top 20 and Rank toasts.
- `tests/v2.0.0/persistence.spec.ts`: Firestore sync checks for deletions.
- `tests/v2.0.0/responsive.spec.ts`: Visual regression on 360px viewport.

## 4. Reporting Plan

### Detailed Test Execution Report

- **Tool**: `playwright-html-extra` or custom JSON-to-Markdown reporter.
- **Content**:
  - **Summary**: Total Passed/Failed/Skipped.
  - **Screenshots**: Automatic capture on failure.
  - **Trace**: Network and action trace for persistence verification.
- **Storage**: Reports saved to `test-results/` and summarized in `strategy/test_report.md`.

## 5. Verification Schedule

- **Phase 1**: Unit logic verification (getUnits partitioning).
- **Phase 2**: E2E verification of new Social & UI components.
- **Phase 3**: Persistence & Stress testing (multiple deletions, quick reloads).

## 6. Mobile Responsiveness (Galaxy S25 Base Model)

### Target Environment

- **Viewport**: 360 x 780 CSS pixels
- **Device Pixel Ratio (DPR)**: 3.0

### Key Inspection Points

- **Dual-Badge Alignment**: Ensure dual mistake badges don't wrap incorrectly on narrow screens.
- **Toast Overlap**: Check that Rank toasts don't block bottom navigation or vital info.
- **Text Overflow**: Verify that long Spanish sentences in correct-answer cards wrap properly.
- **Rank Icon Padding**: Ensure the crown/badge in the header doesn't crowd out the user profile.
