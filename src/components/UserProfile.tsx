import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { UserStats } from '@/hooks/useGamification';
import { User } from 'firebase/auth';

interface UserProfileProps {
    user: User | null;
    stats: UserStats;
}

export default function UserProfile({ user, stats }: UserProfileProps) {
    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
            alert("Google Login failed. Please check your Firebase config.");
        }
    };

    const handleLogout = () => signOut(auth);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '32px', border: '2px solid var(--border-light)', boxShadow: '0 8px 0 var(--border-light)', textAlign: 'center' }}>
                {user ? (
                    <>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 16px', border: '4px solid var(--duo-blue)', overflow: 'hidden' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={user.photoURL || ''} alt={user.displayName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '8px' }}>
                            {user.displayName}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '24px' }}>
                            Welcome back, Spanish Master! 🇪🇸
                        </p>

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
