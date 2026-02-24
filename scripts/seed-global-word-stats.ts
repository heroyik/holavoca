#!/usr/bin/env ts-node
/**
 * scripts/seed-global-word-stats.ts
 *
 * ONE-TIME seed script: writes the TOP 20 hardest Spanish words to
 * Firestore /globalWordStats/{encodedWord} with synthetic fail counts.
 *
 * Run ONCE:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json npx ts-node scripts/seed-global-word-stats.ts
 *
 * After running, archive or delete this script — never re-run.
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as path from "path";

// ── 20 hardest words (scored by length × 2 + accents × 3) ────────────────────
const SEED_WORDS: { word: string; meaning: string; seedCount: number }[] = [
  { word: "llamar ~ / ~se",    meaning: "부르다 / ~의 이름이 ~이다",  seedCount: 20 },
  { word: "civilización",      meaning: "문명",                       seedCount: 19 },
  { word: "antipático/a",      meaning: "불친절한",                   seedCount: 18 },
  { word: "vegetariano/a",     meaning: "채식주의자",                 seedCount: 17 },
  { word: "dependiente/a",     meaning: "종업원",                     seedCount: 16 },
  { word: "aquel/aquella",     meaning: "저, 저것, 저 사람",          seedCount: 15 },
  { word: "probablemente",     meaning: "아마도",                     seedCount: 14 },
  { word: "compañero/a",       meaning: "동료, 학우",                 seedCount: 13 },
  { word: "madrileño/a",       meaning: "마드리드 사람",              seedCount: 12 },
  { word: "histórico/a",       meaning: "역사적인",                   seedCount: 11 },
  { word: "simpático/a",       meaning: "상냥한",                     seedCount: 10 },
  { word: "últimamente",       meaning: "최근에",                     seedCount: 9  },
  { word: "rápidamente",       meaning: "빨리",                       seedCount: 8  },
  { word: "actor/actriz",      meaning: "배우",                       seedCount: 7  },
  { word: "arquitecto/a",      meaning: "건축가",                     seedCount: 6  },
  { word: "extranjero/a",      meaning: "외국인",                     seedCount: 5  },
  { word: "supermercado",      meaning: "슈퍼마켓",                   seedCount: 4  },
  { word: "bienvenido/a",      meaning: "환영하는",                   seedCount: 3  },
  { word: "generalmente",      meaning: "일반적으로",                 seedCount: 2  },
  { word: "preocupado/a",      meaning: "걱정하는",                   seedCount: 1  },
];

async function main() {
  const credPath = path.resolve(process.cwd(), "serviceAccount.json");
  initializeApp({ credential: cert(credPath) });
  const db = getFirestore();

  console.log("Seeding globalWordStats…");

  for (const entry of SEED_WORDS) {
    const docId = encodeURIComponent(entry.word);
    const ref = db.collection("globalWordStats").doc(docId);

    // Skip if document already exists to avoid double-seeding
    const snap = await ref.get();
    if (snap.exists) {
      console.log(`  ⏭  SKIP  ${entry.word} (already seeded)`);
      continue;
    }

    await ref.set({
      word:       entry.word,
      meaning:    entry.meaning,
      seedCount:  entry.seedCount,
      failCount:  0,
      // totalCount is derived: seedCount + failCount — computed client-side
    });
    console.log(`  ✅ SEEDED  ${entry.word}  (seedCount=${entry.seedCount})`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
