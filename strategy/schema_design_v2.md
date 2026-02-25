# HolaVoca v2.0 Data Schema Design

This document defines the Firestore data structure for version 2.0, ensuring seamless synchronization and backward compatibility with v1.3.x.

## 1. Updated `UserStats` Schema

The `users/{userId}` document will be extended with new fields. Existing 1.x fields remain untouched to prevent breaking older versions.

```typescript
interface UserStats {
  // --- Existing v1.x Fields (Shared) ---
  xp: number;
  gems: number;
  streak: number;
  lastStudyDate: string | null;
  completedUnits: string[]; // List of cleared unit IDs
  mistakes: Record<string, number>; // Word failures
  displayName?: string;
  photoURL?: string;

  // --- New v2.0 Fields ---
  settings?: {
    excludeCognates: boolean; // "Easy Spanish" Toggle
    unlockAllLevels: boolean; // "Free access" Toggle
  };
  masteredUnits?: string[]; // Units cleared with 0 mistakes (Crown indicator)
  
  // Track failed word counts for uncleared attempted units
  unitFailStats?: Record<string, {
    failCount: number; // Cumulative (including "Don't Know")
    lastAttempted: string; // ISO Date
  }>;

  metadata?: {
    lastVersionUsed: string; // e.g., "R.2.0.0-alpha.1"
    v2Initialized: boolean;
  };
}
```

## 2. Compatibility Matrix

| Feature | Data Field | v1.x Behavior | v2.0 Behavior |
| :--- | :--- | :--- | :--- |
| **Level Clearing** | `completedUnits` | Reads/Writes as usual. | Reads/Writes as usual. |
| **Gems/XP** | `gems`, `xp` | Shared & Cumulative. | Shared & Cumulative. |
| **Settings** | `settings` | Ignored (doesn't exist in v1 logic). | Fully functional (UI Toggles). |
| **Mastery** | `masteredUnits` | Ignored. | Renders 👑 icon on Map. |
| **Fail Count** | `unitFailStats` | Ignored. | Renders number on Map card. |

## 3. Implementation Plan for `GamificationContext.tsx`

1. **Defaults**: Update the initialization logic to provide default empty objects for `settings` and `unitFailStats`.
2. **Versioning**: When a user logs into v2.0 for the first time, stamp `metadata.v2Initialized = true`.
3. **Cross-Branch Safety**: v1.3-maintenance branch will NOT write to these new fields, ensuring it doesn't accidentally wipe them if it doesn't use `{ merge: true }`. (Current codebase already uses `setDoc(..., { merge: true })`, which is safe).

## 4. Firestore Security Rules

No changes required to `firestore.rules`. The current rule allows users to read/write their own document in the `users` collection:

```js
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

This automatically covers any new fields added to the document.
