import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface LeaderboardEntry {
    id: string;
    displayName?: string;
    photoURL?: string;
    xp: number;
}

export default function Leaderboard() {
    const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const loadLeaderboard = () => {
            setLoading(true);
            setError(false);

            // Timeout fallback (10s)
            timeoutId = setTimeout(() => {
                setLoading(false);
                setError(true);
            }, 10000);

            const q = query(
                collection(db, "users"),
                orderBy("xp", "desc"),
                limit(10)
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                clearTimeout(timeoutId);
                const entries = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as LeaderboardEntry[];
                setLeaders(entries);
                setLoading(false);
            }, (err) => {
                console.error("Leaderboard error:", err);
                clearTimeout(timeoutId);
                setLoading(false);
                setError(true);
            });

            return unsubscribe;
        };

        const unsubscribe = loadLeaderboard();
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
                Global Hall of Fame 🏆
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
                            {index + 1}
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
