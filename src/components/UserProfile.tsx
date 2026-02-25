"use client";

import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useGamification } from '@/hooks/useGamification';
import { UserStats } from '@/hooks/useGamification';
import { User } from 'firebase/auth';
import Image from 'next/image';
import { useState } from 'react';
import { getUnits } from '@/utils/vocab';
import { getAvatarColor, getInitial } from '@/utils/ui';

interface UserProfileProps {
    user: User | null;
    stats: UserStats;
}

export default function UserProfile({ user, stats }: UserProfileProps) {
    const { unlockProgress, updateSettings } = useGamification();
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

    const toggleSetting = (key: 'soundEnabled' | 'hapticsEnabled' | 'excludeEasyWords' | 'unlockAllLevels') => {
        if (stats.settings) {
            updateSettings({ [key]: !stats.settings[key] });
        }
    };

    return (
        <div className="profile-container pb-140">
            <div className="card-premium text-center p-32 mb-24">
                {user ? (
                    <>
                        <div
                            onClick={() => setDevClickCount(prev => prev + 1)}
                            className="avatar-container w-100 h-100 rounded-full relative mb-16 overflow-hidden flex-center"
                            style={{
                                backgroundColor: user.photoURL ? 'transparent' : getAvatarColor(user.uid),
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '48px'
                            }}
                        >
                            {user.photoURL ? (
                                <Image
                                    src={user.photoURL}
                                    alt={user.displayName || 'User'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span>{getInitial(user.displayName || undefined)}</span>
                            )}
                        </div>
                        <h2 className="font-24 font-900 text-main mb-4">{user.displayName}</h2>
                        <p className="text-secondary font-700 mb-24">Spanish Enthusiast 🇪🇸</p>

                        <div className="stat-grid">
                            <div className="profile-stat-card">
                                <span className="font-12 font-800 text-secondary uppercase">Streak</span>
                                <span className="font-24 font-900 text-duo-orange">🔥 {stats.streak}</span>
                            </div>
                            <div className="profile-stat-card">
                                <span className="font-12 font-800 text-secondary uppercase">Total XP</span>
                                <span className="font-24 font-900 text-duo-green">✨ {stats.xp}</span>
                            </div>
                            <div className="profile-stat-card">
                                <span className="font-12 font-800 text-secondary uppercase">Gems</span>
                                <span className="font-24 font-900 text-duo-blue">💎 {stats.gems}</span>
                            </div>
                            <div className="profile-stat-card">
                                <span className="font-12 font-800 text-secondary uppercase">Crowns</span>
                                <span className="font-24 font-900 text-duo-yellow">👑 {stats.masteredUnits?.length || 0}</span>
                            </div>
                        </div>

                        {/* Developer Tools */}
                        {user.email === 'heroyik@gmail.com' && devClickCount >= 5 && (
                            <div className="mt-32 p-16 bg-dev border-dev rounded-12 text-left">
                                <p className="font-14 font-800 text-duo-green mb-12">🔧 DEV CONSOLE</p>
                                <div className="flex items-center gap-8">
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(Number(e.target.value))}
                                        className="select-standard flex-1"
                                    >
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map(level => (
                                            <option key={level} value={level}>Unlock to Level {level}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            const units = getUnits();
                                            unlockProgress(units.slice(0, selectedLevel).map(u => u.id), selectedLevel * 500, selectedLevel * 50);
                                            setDevClickCount(0);
                                        }}
                                        className="duo-button duo-button-primary w-auto py-8"
                                    >
                                        GO
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="duo-button bg-danger shadow-danger mt-32"
                        >
                            LOG OUT
                        </button>
                    </>
                ) : (
                    <div className="py-24">
                        <div className="font-64 mb-16">🔑</div>
                        <h2 className="font-24 font-900 text-main mb-16">Save Your Progress</h2>
                        <p className="text-secondary font-700 mb-32">
                            Sign in with Google to sync your XP, streak, and mastered crowns across devices!
                        </p>
                        <button
                            onClick={handleLogin}
                            className="duo-button duo-button-outline flex-center gap-12 p-16 bg-google"
                        >
                            <Image
                                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                alt="Google"
                                width={20}
                                height={20}
                            />
                            LOG IN WITH GOOGLE
                        </button>
                    </div>
                )}

                {/* Settings Section (Moved outside to allow Guest access) */}
                <div className="settings-section mt-24 pt-24 border-t-glass">
                    <h3 className="font-18 font-900 text-main mb-16 text-left">Settings</h3>

                    <div className="settings-item">
                        <div className="flex flex-col">
                            <span className="font-16 font-700">Sound Effects</span>
                            <span className="font-12 text-secondary">Audio feedback in quiz</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={stats.settings?.soundEnabled ?? true}
                                onChange={() => toggleSetting('soundEnabled')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="flex flex-col">
                            <span className="font-16 font-700">Haptic Feedback</span>
                            <span className="font-12 text-secondary">Vibration on interactions</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={stats.settings?.hapticsEnabled ?? true}
                                onChange={() => toggleSetting('hapticsEnabled')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="flex flex-col">
                            <span className="font-16 font-700">Exclude Easy Cognates</span>
                            <span className="font-12 text-secondary">Hide words similar to English</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={stats.settings?.excludeEasyWords ?? false}
                                onChange={() => toggleSetting('excludeEasyWords')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>

                    <div className="settings-item">
                        <div className="flex flex-col">
                            <span className="font-16 font-700">Unlock All Levels</span>
                            <span className="font-12 text-secondary">Start any level freely</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={stats.settings?.unlockAllLevels ?? false}
                                onChange={() => toggleSetting('unlockAllLevels')}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
