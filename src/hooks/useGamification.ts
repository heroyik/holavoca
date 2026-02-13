"use client";

import { useGamificationContext, UserStats } from "@/contexts/GamificationContext";

export type { UserStats };

export function useGamification() {
  const context = useGamificationContext();
  
  // Map context to existing hook interface for backward compatibility
  return {
    user: context.user,
    stats: context.stats,
    isInitialized: context.isInitialized,
    addXP: context.addXP,
    completeUnit: context.completeUnit,
    unlockProgress: context.unlockProgress,
    recordMistake: context.recordMistake,
    clearMistake: context.clearMistake,
    clearAllMistakes: context.clearAllMistakes
  };
}
