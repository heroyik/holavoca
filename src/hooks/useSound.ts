"use client";

import { useRef, useEffect, useCallback } from "react";

type SoundType = "correct" | "incorrect" | "cheer";

const SOUND_FILES: Record<string, string> = {
  correct: "/sounds/correct.mp3",
  incorrect: "/sounds/incorrect.mp3",
  cheer1: "/sounds/cheer1.mp3",
  cheer2: "/sounds/cheer2.mp3",
  cheer3: "/sounds/cheer3.mp3",
  cheer4: "/sounds/cheer4.mp3",
  cheer5: "/sounds/cheer5.mp3",
};

/**
 * WebAudio API-based sound hook for maximum browser compatibility.
 *
 * Strategy:
 * - Use AudioContext + fetch/decodeAudioData (works on all browsers incl. Safari macOS/iOS).
 * - HTMLAudioElement approach is unreliable on Safari (suspend issue, no preload, CORS quirks).
 * - AudioContext must be created/resumed inside a user gesture handler on Safari.
 * - Buffers are pre-fetched and decoded once; playback is instant via BufferSource nodes.
 */
export function useSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Record<string, AudioBuffer>>({});
  const unlockedRef = useRef(false);

  // Lazily create AudioContext (must happen in browser context)
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

  // Fetch and decode all sound buffers
  const loadBuffers = useCallback(async () => {
    const ctx = getContext();
    if (!ctx) return;

    await Promise.allSettled(
      Object.entries(SOUND_FILES).map(async ([key, src]) => {
        if (buffersRef.current[key]) return; // already loaded
        try {
          const res = await fetch(src);
          const arrayBuf = await res.arrayBuffer();
          const audioBuf = await ctx.decodeAudioData(arrayBuf);
          buffersRef.current[key] = audioBuf;
        } catch (err) {
          console.warn(`[useSound] Failed to load ${key}:`, err);
        }
      })
    );
  }, [getContext]);

  // Unlock AudioContext on first user gesture (required by Safari & Chrome Android)
  useEffect(() => {
    const unlock = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;

      const ctx = getContext();
      if (!ctx) return;

      // Resume suspended context (Chrome Android starts as 'suspended')
      if (ctx.state === "suspended") {
        await ctx.resume().catch(() => {});
      }

      // Load all buffers now that we have a user gesture
      await loadBuffers();
    };

    document.addEventListener("touchstart", unlock, { once: true, passive: true });
    document.addEventListener("click", unlock, { once: true });

    return () => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
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

        // Safari: AudioContext may still be suspended if this is the very first click
        // that also triggers play() — resume first.
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        // Load buffer if not yet available (e.g., slow network)
        if (!buffersRef.current[key]) {
          await loadBuffers();
        }

        const buffer = buffersRef.current[key];
        if (!buffer) return;

        // Create a new BufferSourceNode (one-time-use, by spec)
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Volume control via GainNode
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
