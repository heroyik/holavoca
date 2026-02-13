"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore';
import Image from 'next/image';

interface LeaderboardEntry {
    id: string;
    displayName?: string;
    photoURL?: string;
    xp: number;
    gems?: number;
    broken?: boolean;
}

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
    const [, setError] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let unsubscribe: (() => void) | undefined;

        const loadLeaderboard = () => {
            setLoading(true);
            setError(false);

            const firestore = db;
            if (!firestore) {
                setLeaders(DEMO_LEADERS);
                setLoading(false);
                return;
            }

            timeoutId = setTimeout(() => {
                setLeaders(DEMO_LEADERS);
                setLoading(false);
            }, 5000);

            try {
                const q = query(
                    collection(firestore, "users"),
                    orderBy("xp", "desc"),
                    limit(10)
                );

                unsubscribe = onSnapshot(q, (snapshot) => {
                    clearTimeout(timeoutId);
                    const entries = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as LeaderboardEntry[];
                    setLeaders(entries);
                    setLoading(false);
                }, async (err) => {
                    console.error("Leaderboard error:", err);
                    if (err.code === 'failed-precondition' || err.message.includes('index')) {
                        try {
                            const fallbackQ = query(collection(firestore, "users"), limit(50));
                            const snapshot = await getDocs(fallbackQ);
                            const entries = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            })) as LeaderboardEntry[];
                            entries.sort((a, b) => b.xp - a.xp);
                            setLeaders(entries.slice(0, 10));
                            setLoading(false);
                            clearTimeout(timeoutId);
                            return;
                        } catch (fallbackErr) {
                            console.error("Fallback query failed:", fallbackErr);
                        }
                    }
                    setLeaders(DEMO_LEADERS);
                    setLoading(false);
                    clearTimeout(timeoutId);
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

    if (loading) return <div className="flex-center p-40 text-secondary">Loading Rankings...</div>;

    return (
        <div className="p-20 max-w-600 mx-auto">
            <h2 className="font-24 font-900 text-es-red mb-20 text-center">
                Hall of Fame 🏆
            </h2>
            <div className="flex flex-col flex-gap-12">
                {leaders.map((entry, index) => (
                    <div key={entry.id} className="leaderboard-item">
                        <div className="rank-text">
                            {index === 0 ? '👑' : index + 1}
                        </div>
                        <div className="user-avatar mr-12 relative">
                            {entry.photoURL ? (
                                <Image 
                                    src={entry.photoURL} 
                                    alt={entry.displayName || "Usuario"} 
                                    fill
                                    className="object-cover rounded-full"
                                />
                            ) : (
                                <span className="font-20">👤</span>
                            )}
                        </div>
                        <div className="leader-item-name">
                            {entry.displayName || "Explorador Anónimo"}
                        </div>
                        <div className="leader-item-xp">
                            {entry.xp.toLocaleString()} XP
                        </div>
                    </div>
                ))}
                {leaders.length === 0 && (
                    <div className="text-center text-secondary p-40">
                        Be the first to join the leaderboard! 🚀
                    </div>
                )}
            </div>
        </div>
    );
}
