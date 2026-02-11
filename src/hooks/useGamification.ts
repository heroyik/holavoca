"use client";

import { useState, useEffect } from "react";

export interface UserStats {
  xp: number;
  gems: number;
  streak: number;
  lastStudyDate: string | null;
  completedUnits: string[];
}

export function useGamification() {
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    gems: 0,
    streak: 0,
    lastStudyDate: null,
    completedUnits: [],
  });

  useEffect(() => {
    const saved = localStorage.getItem("holavoca_stats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const saveStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem("holavoca_stats", JSON.stringify(newStats));
  };

  const addXP = (amount: number) => {
    const newStats = { ...stats, xp: stats.xp + amount };
    saveStats(newStats);
  };

  const completeUnit = (unitId: string, xpEarned: number) => {
    const today = new Date().toISOString().split('T')[0];
    let newStreak = stats.streak;

    if (stats.lastStudyDate !== today) {
      // Logic for streak: if yesterday was last study, increment. If older, reset or keep.
      // Simple version: just increment if first study of the day.
      newStreak += 1;
    }

    const newStats: UserStats = {
      ...stats,
      xp: stats.xp + xpEarned,
      gems: stats.gems + Math.floor(xpEarned / 10),
      streak: newStreak,
      lastStudyDate: today,
      completedUnits: stats.completedUnits.includes(unitId) 
        ? stats.completedUnits 
        : [...stats.completedUnits, unitId],
    };
    saveStats(newStats);
  };

  return { stats, addXP, completeUnit };
}
