#!/usr/bin/env node
/**
 * scripts/seed-leaderboard.mjs
 *
 * One-time seed: writes 9 fictional leaderboard users to Firestore /users/{id}.
 * Uses Firebase Web SDK + anonymous auth (same pattern as replace-global-word-stats.mjs).
 * Skips documents that already exist (idempotent).
 *
 * Run: node scripts/seed-leaderboard.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../secrets/.env.local");
const envLines = readFileSync(envPath, "utf-8").split("\n");
const env = {};
for (const line of envLines) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
}

const app = initializeApp({
  apiKey:            env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             env.NEXT_PUBLIC_FIREBASE_APP_ID,
});

const db = getFirestore(app);

// Seed users — display names in Latin/Western characters only
const SEED_USERS = [
  { id: "seed-minjun",    displayName: "MinJun Kim",      xp: 2780, gems: 278, streak: 14 },
  { id: "seed-yuki",      displayName: "Yuki Tanaka",     xp: 2650, gems: 265, streak: 12 },
  { id: "seed-lan",       displayName: "Nguyen Thi Lan",  xp: 2510, gems: 251, streak: 11 },
  { id: "seed-yutong",    displayName: "Yutong Li",       xp: 2390, gems: 239, streak:  9 },
  { id: "seed-sarah",     displayName: "Sarah Mitchell",  xp: 2240, gems: 224, streak:  8 },
  { id: "seed-seoyeon",   displayName: "Seoyeon Park",    xp: 2100, gems: 210, streak:  7 },
  { id: "seed-haruto",    displayName: "Haruto Sato",     xp: 1980, gems: 198, streak:  6 },
  { id: "seed-emma",      displayName: "Emma Tremblay",   xp: 1820, gems: 182, streak:  5 },
  { id: "seed-bao",       displayName: "Tran Quoc Bao",   xp: 1640, gems: 164, streak:  4 },
  { id: "seed-wangfang",  displayName: "Wang Fang",       xp: 1420, gems: 142, streak:  3 },
];

async function main() {
  console.log(`\n🌍 Seeding leaderboard → ${env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}\n`);

  for (const u of SEED_USERS) {
    const ref = doc(db, "users", u.id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      console.log(`  ⏭  skipped (exists): ${u.displayName}`);
      continue;
    }
    await setDoc(ref, {
      displayName: u.displayName,
      xp:          u.xp,
      gems:        u.gems,
      streak:      u.streak,
      completedUnits: [],
      masteredUnits:  [],
      mistakes:       {},
    });
    console.log(`  ✅  seeded: ${u.displayName} — ${u.xp} XP`);
  }

  console.log("\n🎉 Done!\n");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌", e.code ?? e.message);
  process.exit(1);
});
