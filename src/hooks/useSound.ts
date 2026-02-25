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
 * This ensures sounds are only loaded once and are ready immediately.
 */
/**
 * Global Singleton for Audio state.
 * We store raw ArrayBuffers first to avoid creating the AudioContext too early,
 * which can cause Safari to permanently silence it.
 */
let globalCtx: AudioContext | null = null;
const globalRawBuffers: Record<string, ArrayBuffer> = {};
const globalAudioBuffers: Record<string, AudioBuffer> = {};
let globalUnlocked = false;
let isFetchingStarted = false;

/**
 * Fetch all sound files as raw ArrayBuffers immediately.
 */
const startFetchingAssets = async () => {
  if (isFetchingStarted) return;
  isFetchingStarted = true;

  console.log("[useSound] Starting early fetch of raw audio buffers...");
  await Promise.allSettled(
    Object.entries(SOUND_FILES).map(async ([key, src]) => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        globalRawBuffers[key] = await res.arrayBuffer();
        console.log(`[useSound] Fetched raw: ${key}`);
      } catch (err) {
        console.warn(`[useSound] Failed to fetch ${key}:`, err);
      }
    })
  );
};

/**
 * Initialize AudioContext and decode raw buffers.
 * This MUST happen inside a user gesture.
 */
const initializeAndUnlock = async () => {
  if (typeof window === "undefined") return;

  if (!globalCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    globalCtx = new AC();
    console.log("[useSound] AudioContext created inside gesture");
  }

  const ctx = globalCtx;

  // 1. Resume context
  if (ctx.state !== "running") {
    await ctx.resume().catch((e) => console.warn("[useSound] Resume failed:", e));
  }

  // 2. Prime with silence (Safari fallback)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(0);
  osc.stop(0.001);

  // 3. Decode any raw buffers we've fetched
  await Promise.all(
    Object.entries(globalRawBuffers).map(async ([key, arrayBuffer]) => {
      if (globalAudioBuffers[key]) return;
      try {
        // We use a clone of the buffer because decodeAudioData might "detach" it
        const decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
        globalAudioBuffers[key] = decoded;
        console.log(`[useSound] Decoded: ${key}`);
      } catch (err) {
        console.warn(`[useSound] Decode failed for ${key}:`, err);
      }
    })
  );

  if (!globalUnlocked) {
    globalUnlocked = true;
    console.log("[useSound] AudioContext fully unlocked and assets ready.");
  }
};

// Start fetching immediately (safe, no AudioContext needed)
if (typeof window !== "undefined") {
  startFetchingAssets();
}

export function useSound(enabled: boolean) {
  const unlock = useCallback(async () => {
    await initializeAndUnlock();
  }, []);

  useEffect(() => {
    const handleGesture = () => {
      unlock();
    };

    // Listen on multiple events to capture any interaction
    document.addEventListener("touchstart", handleGesture, { once: false, passive: true });
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
      console.log(`[useSound] play() called for: ${type} (enabled: ${enabled})`);
      if (!enabled) return;

      let key: string = type;
      if (type === "cheer") {
        const n = Math.floor(Math.random() * 5) + 1;
        key = `cheer${n}`;
      }

      try {
        // Ensure context is ready
        if (!globalCtx || !globalUnlocked) {
          console.log("[useSound] Context not ready, attempting late unlock...");
          await initializeAndUnlock();
        }

        const ctx = globalCtx;
        if (!ctx) return;

        // One last resume check
        if (ctx.state !== "running") {
          await ctx.resume().catch(() => {});
        }

        const buffer = globalAudioBuffers[key];
        if (!buffer) {
          console.warn(`[useSound] Buffer missing for ${key}. Raw fetched? ${!!globalRawBuffers[key]}`);
          // If raw is there but not decoded, try decoding now
          if (globalRawBuffers[key]) {
            await initializeAndUnlock();
            const retryBuffer = globalAudioBuffers[key];
            if (!retryBuffer) return;
            // Proceed to play retryBuffer...
          } else {
            return;
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer || globalAudioBuffers[key];

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.85;

        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        console.log(`[useSound] Playback started: ${key}`);
      } catch (err) {
        console.warn(`[useSound] play failed (${key}):`, err);
      }
    },
    [enabled]
  );

  return { play };
}
