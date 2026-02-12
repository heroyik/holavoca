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
  displayName?: string;
  photoURL?: string;
}

export function useGamification() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats>(() => {
    // Initialize from local storage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("holavoca_stats");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse local stats", e);
        }
      }
    }
    return {
      xp: 0,
      gems: 0,
      streak: 0,
      lastStudyDate: null,
      completedUnits: [],
    };
  });

  // Ref to hold latest stats for use in effects/callbacks without triggering re-renders
  const statsRef = useRef(stats);

  // Update ref whenever stats change
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Handle Cloud Sync
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // Subscribe to cloud changes with Smart Merge
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as UserStats;
        const localStats = statsRef.current; // Use ref to get latest local stats

        // Smart Merge Strategy: Keep the best progress
        // This handles cases where user studies offline/anon then logs in
        // or has better progress on this device
        const mergedStats = {
          xp: Math.max(cloudData.xp || 0, localStats.xp || 0),
          gems: Math.max(cloudData.gems || 0, localStats.gems || 0),
          streak: Math.max(cloudData.streak || 0, localStats.streak || 0),
          // Keep the latest date
          lastStudyDate: (new Date(cloudData.lastStudyDate || 0) > new Date(localStats.lastStudyDate || 0))
            ? cloudData.lastStudyDate
            : localStats.lastStudyDate,
          // Union of completed units
          completedUnits: Array.from(new Set([...(cloudData.completedUnits || []), ...(localStats.completedUnits || [])]))
        };

        // If local had better stats (or union resulted in update), update cloud immediately
        // We compare against cloudData to see if the cloud needs an update
        const cloudNeedsUpdate =
          mergedStats.xp > (cloudData.xp || 0) ||
          mergedStats.completedUnits.length > (cloudData.completedUnits?.length || 0) ||
          mergedStats.streak > (cloudData.streak || 0);

        if (cloudNeedsUpdate) {
          console.log("Local stats are better/newer. Updating cloud...");
          setDoc(userRef, {
            ...mergedStats,
            displayName: user.displayName,
            photoURL: user.photoURL
          }, { merge: true });
        }

        // Always update local view to the merged result (source of truth)
        // Check if we actually need to update state to avoid loops/renders
        if (JSON.stringify(localStats) !== JSON.stringify(mergedStats)) {
          setStats(mergedStats);
        }
      } else {
        // First time user (doc doesn't exist): push local data to cloud
        console.log("New cloud user. Pushing local stats...");
        const localStats = statsRef.current;
        setDoc(userRef, {
          ...localStats,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const saveStats = async (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem("holavoca_stats", JSON.stringify(newStats));

    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        ...newStats,
        displayName: user.displayName,
        photoURL: user.photoURL
      }, { merge: true });
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

  return { stats, user, addXP, completeUnit };
}
