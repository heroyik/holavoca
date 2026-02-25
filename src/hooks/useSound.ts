"use client";

import { useRef, useEffect, useCallback } from "react";

type SoundType = "correct" | "incorrect" | "cheer";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/holavoca";

const SOUND_FILES: Record<string, string> = {
  correct: `${BASE_PATH}/sounds/correct.mp3`,
  incorrect: `${BASE_PATH}/sounds/incorrect.mp3`,
  cheer1: `${BASE_PATH}/sounds/cheer1.mp3`,
  cheer2: `${BASE_PATH}/sounds/cheer2.mp3`,
  cheer3: `${BASE_PATH}/sounds/cheer3.mp3`,
  cheer4: `${BASE_PATH}/sounds/cheer4.mp3`,
  cheer5: `${BASE_PATH}/sounds/cheer5.mp3`,
};

/**
 * WebAudio API-based sound hook for maximum browser compatibility.
 * 
 * Strategy:
 * - Use AudioContext + fetch/decodeAudioData (works on all browsers incl. Safari macOS/iOS).
 * - Prefixes assets with BASE_PATH to avoid 404s.
 * - AudioContext must be resumed inside a user gesture handler for Safari.
 */
/**
 * Global Singleton for Audio state to persist across page navigations.
 */
let globalCtx: AudioContext | null = null;
const globalArrayBuffers: Record<string, ArrayBuffer> = {};
const globalBuffers: Record<string, AudioBuffer> = {};
let globalUnlocked = false;
let isFetchingStarted = false;

const getGlobalContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!globalCtx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    globalCtx = new AC();
    console.log(`[useSound] 🆕 AudioContext created. Initial state: ${globalCtx.state}`);
  }
  return globalCtx;
};

/**
 * Stage 1: Fast Fetch
 * Fetch raw .mp3 files as ArrayBuffer. Does NOT need AudioContext.
 * Can happen immediately on page load.
 */
const prefetchRawAssets = async () => {
  if (typeof window === "undefined" || isFetchingStarted) return;
  isFetchingStarted = true;

  console.log("[useSound] 📡 Starting raw asset pre-fetch...");
  await Promise.allSettled(
    Object.entries(SOUND_FILES).map(async ([key, src]) => {
      if (globalArrayBuffers[key]) return;
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        globalArrayBuffers[key] = await res.arrayBuffer();
        console.log(`[useSound] 📥 Fetched: ${key}`);
      } catch (err) {
        console.error(`[useSound] ❌ Fetch fail (${key}):`, err);
      }
    })
  );
};

/**
 * Stage 2: Synchronous Decode
 * Convert ArrayBuffers to AudioBuffers using the AudioContext.
 * Must happen after/during a user gesture for best results on Safari.
 */
const decodeAllAssets = async () => {
  const ctx = getGlobalContext();
  if (!ctx) return;

  const entries = Object.entries(globalArrayBuffers);
  if (entries.length === 0) {
    console.warn("[useSound] ⚠️ Decoding requested but no raw assets found. Retrying fetch...");
    prefetchRawAssets();
    return;
  }

  await Promise.allSettled(
    entries.map(async ([key, arrayBuf]) => {
      if (globalBuffers[key]) return;
      try {
        // decodeAudioData consumes the ArrayBuffer, so we might want to clone it
        // but since we only decode once globally, it's fine.
        const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0));
        globalBuffers[key] = audioBuf;
        console.log(`[useSound] 💿 Decoded: ${key}`);
      } catch (err) {
        console.error(`[useSound] ❌ Decode fail (${key}):`, err);
      }
    })
  );
};

// Start fetching immediately
if (typeof window !== "undefined") {
  prefetchRawAssets();
}

export function useSound(enabled: boolean) {
  const unlock = useCallback(async () => {
    // 1. Ensure Context exists
    const ctx = getGlobalContext();
    if (!ctx) return;

    // 2. High-priority Resume (must be directly in gesture handler)
    if (ctx.state !== "running") {
      console.log(`[useSound] ⚡ Resuming context... (current: ${ctx.state})`);
      await ctx.resume().catch((e) => console.warn("[useSound] Resume err:", e));
      console.log(`[useSound] ⚡ New state: ${ctx.state}`);
    }

    // 3. Decode if first time
    if (!globalUnlocked || Object.keys(globalBuffers).length === 0) {
      globalUnlocked = true;
      console.log("[useSound] 🔓 Global Unlock Pulse");
      await decodeAllAssets();
    }
  }, []);

  useEffect(() => {
    const handleGesture = () => unlock();
    
    // Add multiple listeners to capture first interaction anywhere
    const options = { once: false, passive: true };
    document.addEventListener("touchstart", handleGesture, options);
    document.addEventListener("mousedown", handleGesture, { once: false });
    document.addEventListener("click", handleGesture, { once: false });

    return () => {
      document.removeEventListener("touchstart", handleGesture);
      document.removeEventListener("mousedown", handleGesture);
      document.removeEventListener("click", handleGesture);
    };
  }, [unlock]);

  const play = useCallback(
    async (type: SoundType) => {
      if (!enabled) return;

      const ctx = getGlobalContext();
      if (!ctx) return;

      // Force resume if suspended (Safari likes to sleep)
      if (ctx.state !== "running") {
        console.warn(`[useSound] ⚠️ Context ${ctx.state} during play request. Resuming...`);
        await ctx.resume().catch(() => {});
      }

      let key: string = type;
      if (type === "cheer") {
        const n = Math.floor(Math.random() * 5) + 1;
        key = `cheer${n}`;
      }

      const buffer = globalBuffers[key];
      if (!buffer) {
        console.error(`[useSound] 🚫 Skip play: ${key} not decoded.`, {
          hasRaw: !!globalArrayBuffers[key],
          decodedKeys: Object.keys(globalBuffers)
        });
        
        // Attempt emergency decode if raw data exists
        if (globalArrayBuffers[key]) {
          console.log(`[useSound] 🆘 Emergency decoding ${key}...`);
          await decodeAllAssets();
          const retryBuffer = globalBuffers[key];
          if (retryBuffer) {
            console.log(`[useSound] 🆘 Recovered! Playing ${key}`);
            startBufferPlayback(ctx, retryBuffer, key);
          }
        } else {
          prefetchRawAssets();
        }
        return;
      }

      startBufferPlayback(ctx, buffer, key);
    },
    [enabled]
  );

  return { play };
}

/** Helper to handle the actual WebAudio node creation */
function startBufferPlayback(ctx: AudioContext, buffer: AudioBuffer, key: string) {
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.85;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    console.log(`[useSound] ▶️ Played: ${key} (state: ${ctx.state})`);
  } catch (err) {
    console.error(`[useSound] 💥 Play error for ${key}:`, err);
  }
}
