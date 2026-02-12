"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';

interface LeaderboardEntry {
    id: string;
    displayName?: string;
    photoURL?: string;
    xp: number;
    gems?: number; // Optional as not all users might have it synced yet
    broken?: boolean; // For visual flair if needed
}

// Demo Data for Offline/Fallback
const DEMO_LEADERS: LeaderboardEntry[] = [
    { id: 'd1', displayName: 'Maria Garcia', photoURL: undefined, xp: 2500, gems: 120, broken: false },
    { id: 'd2', displayName: 'John Doe', photoURL: undefined, xp: 2100, gems: 90, broken: false },
    { id: 'd3', displayName: 'Sakura Tanaka', photoURL: undefined, xp: 1800, gems: 50, broken: false },
    { id: 'd4', displayName: 'Ali Khan', photoURL: undefined, xp: 1500, gems: 30, broken: false },
    { id: 'd5', displayName: 'Emma Wilson', photoURL: undefined, xp: 1200, gems: 20, broken: false },
];

export default function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let unsubscribe: (() => void) | undefined;

        const loadLeaderboard = () => {
            setLoading(true);
            setError(false);

            // Timeout fallback (5s for faster offline detection)
            timeoutId = setTimeout(() => {
                console.warn("Leaderboard timed out. Switching to DEMO Mode (Timeout).");
                setLeaders(DEMO_LEADERS);
                setLoading(false);
                // setError(true); // Removed error state for better UX
            }, 5000);

            try {
                // Primary Query: Standard Leaderboard
                const q = query(
                    collection(db, "users"),
                    orderBy("xp", "desc"),
                    limit(10)
                );

                unsubscribe = onSnapshot(q, (snapshot) => {
                    clearTimeout(timeoutId);
                    const entries = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as LeaderboardEntry[];

                    console.log("Leaderboard loaded:", entries.length, "entries");
                    setLeaders(entries);
                    setLoading(false);
                }, async (err) => {
                    console.error("Leaderboard primary query error:", err);

                    // Fallback 1: Missing Index -> Client-side Sort
                    if (err.code === 'failed-precondition' || err.message.includes('index')) {
                        console.warn("Index missing. Switching to Fallback Mode (Client-side Sort).");
                        try {
                            // Fetch 20 users comfortably (limit to avoid reading whole DB)
                            // Without 'orderBy', this doesn't need an index.
                            const fallbackQ = query(collection(db, "users"), limit(50));
                            const snapshot = await getDocs(fallbackQ);
                            const entries = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as LeaderboardEntry[];

                            // Sort client-side
                            entries.sort((a, b) => b.xp - a.xp);
                            setLeaders(entries.slice(0, 10)); // Top 10
                            setLoading(false);
                            clearTimeout(timeoutId);
                            return; // Success fallback
                        } catch (fallbackErr) {
                            console.error("Fallback query failed:", fallbackErr);
                        }
                    }

                    // Fallback 2: Connection Failed / DB Not Found -> Demo Data
                    // This allows the UI to be tested even without a real backend
                    console.warn("Firestore unavailable. Switching to DEMO Mode.");
                    setLeaders(DEMO_LEADERS);
                    setLoading(false);
                    clearTimeout(timeoutId);
                    // setError(true); // Don't show error, show demo data
                });
            } catch (e) {
                console.error("Leaderboard init error:", e);
                clearTimeout(timeoutId);
                setLoading(false);
                setError(true);
            }
        };

        loadLeaderboard();

        return () => {
            if (unsubscribe) unsubscribe();
            clearTimeout(timeoutId);
        };
    }, []);

    if (loading) return <div className="flex-center" style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading Rankings...</div>;

    if (error) return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Failed to load rankings.</p>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                }}
            >
                Retry
            </button>
        </div>
    );

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--es-red)', marginBottom: '20px', textAlign: 'center' }}>
                Hall of Fame 🏆
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {leaders.map((entry, index) => (
                    <div
                        key={entry.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '16px',
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            border: '2px solid var(--border-light)',
                            boxShadow: '0 4px 0 var(--border-light)'
                        }}
                    >
                        <div style={{ width: '30px', fontWeight: '900', fontSize: '18px', color: 'var(--text-secondary)' }}>
                            {index === 0 ? '👑' : index + 1}
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e5e5e5', marginRight: '12px', overflow: 'hidden' }}>
                            {entry.photoURL ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={entry.photoURL} alt={entry.displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👤</div>
                            )}
                        </div>
                        <div style={{ flex: 1, fontWeight: '700', color: 'var(--text-main)' }}>
                            {entry.displayName || "Anonymous Explorer"}
                        </div>
                        <div style={{ fontWeight: '900', color: 'var(--es-red)' }}>
                            {entry.xp.toLocaleString()} XP
                        </div>
                    </div>
                ))}
                {leaders.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>
                        Be the first to join the leaderboard! 🚀
                    </div>
                )}
            </div>
        </div>
    );
}
