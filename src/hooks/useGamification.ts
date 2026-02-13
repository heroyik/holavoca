import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export interface UserStats {
  xp: number;
  gems: number;
  streak: number;
  lastStudyDate: string | null;
  completedUnits: string[];
  mistakes?: Record<string, number>;
  displayName?: string;
  photoURL?: string;
}

export function useGamification() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    gems: 0,
    streak: 0,
    lastStudyDate: null,
    completedUnits: [],
    mistakes: {},
  });

  // Client-side initialization to avoid hydration mismatch (Error #418)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("holavoca_stats");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setStats(parsed);
        } catch (e) {
          console.error("Failed to parse local stats", e);
        }
      }
    }
  }, []);

  // Use ref to avoid closure issues in async callbacks
  const statsRef = useRef(stats);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Handle Auth State
  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth is not available. Using Guest Mode.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && db) {
        const userDocRef = doc(db, "users", u.uid);
        const unsubStats = onSnapshot(userDocRef, (snapshot) => {
          if (snapshot.exists() && !snapshot.metadata.hasPendingWrites) {
            const cloudData = snapshot.data() as UserStats;
            setStats(prev => {
              const mergedMistakes = cloudData.mistakes !== undefined 
                ? cloudData.mistakes 
                : prev.mistakes;
              
              return {
                ...prev,
                ...cloudData,
                xp: Math.max(prev.xp, cloudData.xp || 0),
                completedUnits: Array.from(new Set([...prev.completedUnits, ...(cloudData.completedUnits || [])])),
                mistakes: mergedMistakes || {}
              };
            });
          }
        });
        return () => unsubStats();
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync progress to cloud when needed
  useEffect(() => {
    // Capture values for timeout narrowing
    const currentDb = db;
    const currentUser = user;
    if (!auth || !currentUser || !currentDb) return;

    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(currentDb, "users", currentUser.uid), statsRef.current, { merge: true });
        console.log("Progress synced to cloud");
      } catch (e) {
        console.error("Cloud sync failed", e);
      }
    }, 5000); // Throttled sync
    return () => clearTimeout(timer);
  }, [stats, user]);

  const saveStats = async (newStats: UserStats) => {
    // 1. Update local state
    setStats(newStats);
    
    // 2. Persist to localStorage immediately
    localStorage.setItem("holavoca_stats", JSON.stringify(newStats));

    // 3. Immediate Firestore sync (optional, but good for critical updates)
    const firestore = db;
    if (user && firestore) {
      try {
        await setDoc(doc(firestore, "users", user.uid), {
          ...newStats,
          displayName: user.displayName,
          photoURL: user.photoURL
        }, { merge: true });
      } catch (e) {
        console.error("Failed to save stats", e);
      }
    }
  };

  const addXP = (amount: number) => {
    const newStats = { ...stats, xp: stats.xp + amount };
    saveStats(newStats);
  };

  const completeUnit = (unitId: string, xpEarned: number) => {
    const today = new Date().toISOString().split('T')[0];
    let newStreak = stats.streak;

    if (stats.lastStudyDate !== today) {
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

  const unlockProgress = (unitIds: string[], xp: number, gems: number) => {
    const newStats: UserStats = {
      ...stats,
      xp,
      gems,
      completedUnits: unitIds
    };
    saveStats(newStats);
  };

  const recordMistake = (spanishWord: string) => {
    setStats(prev => {
      const currentMistakes = prev.mistakes || {};
      const newStats = {
        ...prev,
        mistakes: {
          ...currentMistakes,
          [spanishWord]: (currentMistakes[spanishWord] || 0) + 1
        }
      };
      localStorage.setItem("holavoca_stats", JSON.stringify(newStats));
      return newStats;
    });
  };

  const clearMistake = (spanishWord: string) => {
    setStats(prev => {
      const currentMistakes = { ...prev.mistakes };
      delete currentMistakes[spanishWord];
      const newStats = {
        ...prev,
        mistakes: currentMistakes
      };
      localStorage.setItem("holavoca_stats", JSON.stringify(newStats));
      return newStats;
    });
  };

  const clearAllMistakes = () => {
    setStats(prev => {
      const newStats = {
        ...prev,
        mistakes: {}
      };
      localStorage.setItem("holavoca_stats", JSON.stringify(newStats));
      return newStats;
    });
  };

  return {
    user,
    stats,
    addXP,
    completeUnit,
    unlockProgress,
    recordMistake,
    clearMistake,
    clearAllMistakes
  };
}
