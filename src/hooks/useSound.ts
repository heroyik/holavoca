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
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Record<string, AudioBuffer>>({});
  const unlockedRef = useRef(false);

  const getContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }, []);

  const loadBuffers = useCallback(async () => {
    const ctx = getContext();
    if (!ctx) return;

    await Promise.allSettled(
      Object.entries(SOUND_FILES).map(async ([key, src]) => {
        if (buffersRef.current[key]) return;
        try {
          const res = await fetch(src);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const arrayBuf = await res.arrayBuffer();
          const audioBuf = await ctx.decodeAudioData(arrayBuf);
          buffersRef.current[key] = audioBuf;
        } catch (err) {
          console.warn(`[useSound] Failed to load ${key} from ${src}:`, err);
        }
      })
    );
  }, [getContext]);

  useEffect(() => {
    const unlock = async () => {
      const ctx = getContext();
      if (!ctx) return;

      // Resume context within user gesture (CRITICAL for Safari)
      if (ctx.state === "suspended" || ctx.state === "interrupted") {
        await ctx.resume().catch((e) => console.warn("[useSound] Resume failed:", e));
      }

      if (unlockedRef.current) return;
      unlockedRef.current = true;
      
      // Load buffers immediately after unlock
      await loadBuffers();
    };

    const handleGesture = () => {
      unlock();
    };

    document.addEventListener("touchstart", handleGesture, { once: false, passive: true });
    document.addEventListener("mousedown", handleGesture, { once: false });

    return () => {
      document.removeEventListener("touchstart", handleGesture);
      document.removeEventListener("mousedown", handleGesture);
    };
  }, [getContext, loadBuffers]);

  const play = useCallback(
    async (type: SoundType) => {
      if (!enabled) return;

      let key: string = type;
      if (type === "cheer") {
        const n = Math.floor(Math.random() * 5) + 1;
        key = `cheer${n}`;
      }

      try {
        const ctx = getContext();
        if (!ctx) return;

        // Ensure context is running - some browsers re-suspend it
        if (ctx.state !== "running") {
          await ctx.resume().catch(() => {});
        }

        const buffer = buffersRef.current[key];
        if (!buffer) {
          // Fallback: try loading if missing, though it might be too late for this trigger
          loadBuffers();
          return;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.value = 0.85;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
      } catch (err) {
        console.warn(`[useSound] play failed (${key}):`, err);
      }
    },
    [enabled, getContext, loadBuffers]
  );

  return { play };
}
