"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface GlobalWordStat {
  word: string;
  meaning: string;
  totalCount: number; // seedCount + failCount
}

/**
 * Fetches the global TOP 20 hardest words from Firestore.
 * Fetched once per session (cached in module-level variable).
 * Read cost: 1 collection read (up to 730 documents max) per session.
 */
let sessionCache: GlobalWordStat[] | null = null;

export function useGlobalTop20() {
  const [top20, setTop20] = useState<GlobalWordStat[]>(sessionCache || []);
  const [loading, setLoading] = useState(!sessionCache);
  const [error, setError] = useState<string | null>(null);

  const fetchTop20 = useCallback(async () => {
    if (sessionCache) {
      setTop20(sessionCache);
      setLoading(false);
      return;
    }
    if (!db) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, "globalWordStats"));
      const all: GlobalWordStat[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          word: data.word ?? decodeURIComponent(d.id),
          meaning: data.meaning ?? "",
          totalCount: (data.seedCount ?? 0) + (data.failCount ?? 0),
        };
      });
      // Sort by totalCount descending, take top 20
      all.sort((a, b) => b.totalCount - a.totalCount);
      const result = all.slice(0, 20);
      sessionCache = result;
      setTop20(result);
    } catch (e) {
      console.error("[useGlobalTop20] fetch error", e);
      setError("Failed to load global stats.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTop20();
  }, [fetchTop20]);

  return { top20, loading, error, refresh: fetchTop20 };
}
