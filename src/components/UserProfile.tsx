import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { UserStats, useGamification } from '@/hooks/useGamification';
import { User } from 'firebase/auth';

import { useState } from 'react';
import { getUnits } from '@/utils/vocab';

interface UserProfileProps {
    user: User | null;
    stats: UserStats;
}

export default function UserProfile({ user, stats }: UserProfileProps) {
    const { unlockProgress } = useGamification();
    const [devClickCount, setDevClickCount] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState(1);

    const handleLogin = async () => {
        if (!auth || !googleProvider) {
            alert("Firebase Authentication is not available in this environment.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Google Login failed. Please check your Firebase config.");
        }
    };

    const handleLogout = () => {
        if (auth) signOut(auth);
    };

    const handleDevTrigger = () => {
        setDevClickCount(prev => prev + 1);
    };

    const handleUnlockLevel = () => {
        const units = getUnits();
        // Get first N units based on selected level
        const targetUnits = units.slice(0, selectedLevel).map(u => u.id);

        // Calculate stats: 200 XP per unit, 20 Gems per unit
        const targetXp = selectedLevel * 200;
        const targetGems = selectedLevel * 20;

        unlockProgress(targetUnits, targetXp, targetGems);

        alert(`🔓 Unlocked Level ${selectedLevel}!\n\nXP: ${targetXp}\nGems: ${targetGems}\nUnits: ${selectedLevel} Completed`);
        setDevClickCount(0); // Reset
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '2px solid var(--border-light)', boxShadow: '0 8px 0 var(--border-light)', textAlign: 'center' }}>
                {user ? (
                    <>
                        <div
                            onClick={handleDevTrigger}
                            style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px', border: '4px solid var(--duo-blue)', overflow: 'hidden', cursor: 'pointer' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.photoURL || ''} alt={user.displayName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2
                            onClick={handleDevTrigger}
                            style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px', cursor: 'pointer', userSelect: 'none' }}
                        >
                            {user.displayName}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '24px' }}>
                            Welcome back, Spanish Master! 🇪🇸
                        </p>

                        {/* Hidden Dev Tools - Admin Only */}
                        {user.email === 'heroyik@gmail.com' && devClickCount >= 5 && (
                            <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f3f4f6', borderRadius: '12px', border: '2px dashed var(--duo-green)' }}>
                                <p style={{ fontSize: '14px', fontWeight: '800', color: 'var(--duo-green)', marginBottom: '12px' }}>🔧 DEVELOPER CONSOLE</p>

                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Target Level:</span>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(Number(e.target.value))}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '8px',
                                            border: '2px solid var(--border-light)',
                                            fontWeight: '700',
                                            color: 'var(--text-main)',
                                            outline: 'none'
                                        }}
                                    >
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map(level => (
                                            <option key={level} value={level}>Level {level}</option>
                                        ))}
                                    </select>

                                    <button
                                        onClick={handleUnlockLevel}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: 'var(--duo-green)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 0 #15803d'
                                        }}
                                    >
                                        Unlock 🔓
                                    </button>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ padding: '16px', backgroundColor: 'var(--bg-soft)', borderRadius: '16px', border: '2px solid var(--border-light)' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800' }}>STREAK</p>
                                <p style={{ fontSize: '20px', fontWeight: '900', color: 'var(--duo-orange)' }}>🔥 {stats.streak}</p>
                            </div>
                            <div style={{ padding: '16px', backgroundColor: 'var(--bg-soft)', borderRadius: '16px', border: '2px solid var(--border-light)' }}>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '800' }}>TOTAL GEMS</p>
                                <p style={{ fontSize: '20px', fontWeight: '900', color: 'var(--duo-blue)' }}>💎 {stats.gems}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            style={{ padding: '12px 24px', backgroundColor: '#ef4444', color: 'white', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 0 #b91c1c' }}
                        >
                            SIGN OUT
                        </button>
                    </>
                ) : (
                    <>
                        {/* Login View - Unchanged */}
                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔑</div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '16px' }}>
                            Save Your Progress
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '32px' }}>
                            Sign in with Google to sync your XP, streaks, and rank on the global leaderboard!
                        </p>
                        <button
                            onClick={handleLogin}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                width: '100%',
                                padding: '16px',
                                backgroundColor: 'white',
                                color: 'var(--text-main)',
                                borderRadius: '16px',
                                border: '2px solid var(--border-light)',
                                fontWeight: '800',
                                cursor: 'pointer',
                                boxShadow: '0 4px 0 var(--border-light)'
                            }}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '20px' }} />
                            SIGN IN WITH GOOGLE
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
