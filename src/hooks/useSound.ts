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
 * Preloads all quiz sounds and provides a play() function.
 *
 * Browser compatibility:
 * - Chrome Android: AudioContext is suspended until first user gesture.
 *   We unlock by playing a single silent audio on first gesture.
 * - iOS Safari: Only ONE audio.play() is allowed per user gesture event.
 *   We must NOT attempt to play multiple sounds during the unlock gesture.
 *   After the first gesture, subsequent plays work freely.
 * - Desktop Chrome/Safari: No special handling needed.
 */
export function useSound(enabled: boolean) {
  const audioPoolRef = useRef<Record<string, HTMLAudioElement>>({});
  const unlockedRef = useRef(false);

  // Create all Audio objects once on mount
  // Note: iOS Safari ignores preload="auto" — that's fine, we unlock on first gesture
  useEffect(() => {
    if (typeof window === "undefined") return;
    Object.entries(SOUND_FILES).forEach(([key, src]) => {
      const audio = new Audio(src);
      audio.preload = "auto"; // respected by Chrome; ignored by iOS (acceptable)
      audio.volume = 0.85;
      audioPoolRef.current[key] = audio;
    });
  }, []);

  // Unlock audio on first user gesture
  // iOS Safari rule: only ONE .play() call is honored per gesture event.
  // So we play only the "correct" sound as the single unlock, then immediately pause it.
  // After this point, all audio objects in the pool are free to play.
  useEffect(() => {
    const unlock = async () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;

      // Pick just one audio to warm up (iOS only allows 1 play per gesture)
      const primary = audioPoolRef.current["correct"];
      if (!primary) return;

      try {
        await primary.play();
        primary.pause();
        primary.currentTime = 0;
      } catch {
        // Silently ignore — e.g., file not found or still blocked
      }
    };

    document.addEventListener("touchstart", unlock, { once: true, passive: true });
    document.addEventListener("click", unlock, { once: true });

    return () => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
  }, []);

  const play = useCallback(
    (type: SoundType) => {
      if (!enabled) return;
      if (typeof window === "undefined") return;

      let key: string = type;
      if (type === "cheer") {
        const n = Math.floor(Math.random() * 5) + 1;
        key = `cheer${n}`;
      }

      const audio = audioPoolRef.current[key];
      if (!audio) return;

      // Rewind and play — safe for both Chrome and Safari
      audio.currentTime = 0;
      audio.play().catch((err: Error) => {
        // NotAllowedError before first gesture is expected — silent fail
        if (err.name !== "NotAllowedError") {
          console.warn(`[useSound] play failed (${key}):`, err.message);
        }
      });
    },
    [enabled]
  );

  return { play };
}
