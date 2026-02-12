import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

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
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    gems: 0,
    streak: 0,
    lastStudyDate: null,
    completedUnits: [],
  });

  // Handle Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        // Load local if not logged in
        const saved = localStorage.getItem("holavoca_stats");
        if (saved) setStats(JSON.parse(saved));
      }
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

        // Smart Merge Strategy: Keep the best progress
        // This handles cases where user studies offline/anon then logs in
        const mergedStats = {
          xp: Math.max(cloudData.xp, stats.xp),
          gems: Math.max(cloudData.gems, stats.gems),
          streak: Math.max(cloudData.streak, stats.streak),
          // Keep the latest date
          lastStudyDate: (new Date(cloudData.lastStudyDate || 0) > new Date(stats.lastStudyDate || 0))
            ? cloudData.lastStudyDate
            : stats.lastStudyDate,
          // Union of completed units
          completedUnits: Array.from(new Set([...cloudData.completedUnits, ...stats.completedUnits]))
        };

        // If local had better stats, update cloud immediately
        if (JSON.stringify(mergedStats) !== JSON.stringify(cloudData)) {
          setDoc(userRef, {
            ...mergedStats,
            displayName: user.displayName,
            photoURL: user.photoURL
          }, { merge: true });
        }

        setStats(mergedStats);
      } else {
        // First time user: push local data to cloud
        const saved = localStorage.getItem("holavoca_stats");
        const initialData = saved ? JSON.parse(saved) : stats;
        setDoc(userRef, {
          ...initialData,
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
