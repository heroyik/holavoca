"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserStats {
  xp: number;
  gems: number;
  streak: number;
  lastStudyDate: string | null;
  completedUnits: string[];
  masteredUnits: string[]; // Units completed with 0 mistakes
  mistakes: Record<string, number>;
  displayName?: string;
  photoURL?: string;
  settings?: {
    soundEnabled: boolean;
    hapticsEnabled: boolean;
  };
}

interface GamificationContextType {
  user: User | null;
  stats: UserStats;
  isInitialized: boolean;
  addXP: (amount: number) => void;
  completeUnit: (unitId: string, xpEarned?: number, isPerfect?: boolean) => void;
  unlockProgress: (unitIds: string[], xp: number, gems: number) => void;
  recordMistake: (spanishWord: string) => void;
  addMistake: (spanishWord: string) => void;
  clearMistake: (spanishWord: string) => void;
  removeMistake: (spanishWord: string) => void;
  clearAllMistakes: () => void;
  addGem: (amount: number) => void;
  updateSettings: (settings: Partial<NonNullable<UserStats['settings']>>) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const defaultStats: UserStats = {
  xp: 0,
  gems: 0,
  streak: 0,
  lastStudyDate: null,
  completedUnits: [],
  masteredUnits: [],
  mistakes: {},
  settings: {
    soundEnabled: true,
    hapticsEnabled: true,
  },
};

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [stats, setStats] = useState<UserStats>(defaultStats);

  // Client-side hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("holavoca_stats");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStats(prev => ({ 
            ...prev, 
            ...parsed, 
            mistakes: parsed.mistakes || {},
            settings: {
              ...defaultStats.settings,
              ...(parsed.settings || {}),
            }
          }));
        } catch (e) {
          console.error("Failed to parse local stats", e);
        }
      }
    }
  }, []);

  const statsRef = useRef(stats);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Auth & Firestore Listener
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not available. Using Guest Mode.");
      setTimeout(() => setIsInitialized(true), 0);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && db) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const unsubStats = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists() && !snapshot.metadata.hasPendingWrites) {
            const cloudData = snapshot.data() as UserStats;
            setStats(prev => {
              const mergedMistakes = cloudData.mistakes !== undefined 
                ? cloudData.mistakes 
                : prev.mistakes;
              
              const newStats: UserStats = {
                ...prev,
                ...cloudData,
                xp: Math.max(prev.xp, cloudData.xp || 0),
                completedUnits: Array.from(new Set([...prev.completedUnits, ...(cloudData.completedUnits || [])])),
                masteredUnits: Array.from(new Set([...(prev.masteredUnits || []), ...(cloudData.masteredUnits || [])])),
                mistakes: mergedMistakes || {},
                settings: {
                  soundEnabled: cloudData.settings?.soundEnabled ?? defaultStats.settings!.soundEnabled,
                  hapticsEnabled: cloudData.settings?.hapticsEnabled ?? defaultStats.settings!.hapticsEnabled,
                },
              };
              
              setIsInitialized(true);
              return newStats;
            });
          } else if (!snapshot.exists()) {
              setIsInitialized(true);
          }
        });
        return () => unsubStats();
      } else {
        setIsInitialized(true);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Throttled Auto-Sync
  useEffect(() => {
    if (!user || !db || !isInitialized) return;

    const currentDb = db;
    const currentUser = user;

    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(currentDb, "users", currentUser.uid), {
            ...statsRef.current,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
        }, { merge: true });
        console.log("[GamificationProvider] Progress synced to cloud");
      } catch (e) {
        console.error("[GamificationProvider] Cloud sync failed", e);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [stats, user, isInitialized]);

  const saveStatsLocally = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem("holavoca_stats", JSON.stringify(newStats));
  };

  const addXP = (amount: number) => {
    saveStatsLocally({ ...statsRef.current, xp: statsRef.current.xp + amount });
  };

  const addGem = (amount: number) => {
    saveStatsLocally({ ...statsRef.current, gems: statsRef.current.gems + amount });
  };

  const completeUnit = (unitId: string, xpEarned: number = 0, isPerfect: boolean = false) => {
    const today = new Date().toISOString().split('T')[0];
    let newStreak = statsRef.current.streak;

    if (statsRef.current.lastStudyDate !== today) {
      newStreak += 1;
    }

    const currentCompleted = statsRef.current.completedUnits || [];
    const currentMastered = statsRef.current.masteredUnits || [];

    const newStats: UserStats = {
      ...statsRef.current,
      xp: statsRef.current.xp + xpEarned,
      gems: statsRef.current.gems + Math.floor(xpEarned / 10),
      streak: newStreak,
      lastStudyDate: today,
      completedUnits: currentCompleted.includes(unitId)
        ? currentCompleted
        : [...currentCompleted, unitId],
      masteredUnits: isPerfect && !currentMastered.includes(unitId)
        ? [...currentMastered, unitId]
        : currentMastered,
    };
    saveStatsLocally(newStats);
  };

  const unlockProgress = (unitIds: string[], xp: number, gems: number) => {
    const newStats: UserStats = {
      ...statsRef.current,
      xp,
      gems,
      completedUnits: unitIds
    };
    saveStatsLocally(newStats);
  };

  const recordMistake = (spanishWord: string) => {
    const currentMistakes = statsRef.current.mistakes || {};
    saveStatsLocally({
      ...statsRef.current,
      mistakes: {
        ...currentMistakes,
        [spanishWord]: (currentMistakes[spanishWord] || 0) + 1
      }
    });
  };

  const clearMistake = (spanishWord: string) => {
    const currentMistakes = { ...statsRef.current.mistakes };
    delete currentMistakes[spanishWord];
    saveStatsLocally({
      ...statsRef.current,
      mistakes: currentMistakes
    });
  };

  const clearAllMistakes = () => {
    saveStatsLocally({
      ...statsRef.current,
      mistakes: {}
    });
  };

  const updateSettings = (newSettings: Partial<NonNullable<UserStats['settings']>>) => {
    const updatedStats: UserStats = {
      ...statsRef.current,
      settings: {
        ...statsRef.current.settings!,
        ...newSettings,
      },
    };
    saveStatsLocally(updatedStats);
  };

  return (
    <GamificationContext.Provider value={{
      user,
      stats,
      isInitialized,
      addXP,
      completeUnit,
      unlockProgress,
      recordMistake,
      addMistake: recordMistake,
      clearMistake,
      removeMistake: clearMistake,
      clearAllMistakes,
      addGem,
      updateSettings
    }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamificationContext() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error("useGamification must be used within a GamificationProvider");
  }
  return context;
}
