"use client";

import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { UserStats, useGamification } from '@/hooks/useGamification';
import { User } from 'firebase/auth';
import Image from 'next/image';

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
        const targetUnits = units.slice(0, selectedLevel).map(u => u.id);
        const targetXp = selectedLevel * 200;
        const targetGems = selectedLevel * 20;

        unlockProgress(targetUnits, targetXp, targetGems);
        alert(`🔓 Unlocked Level ${selectedLevel}!\n\nXP: ${targetXp}\nGems: ${targetGems}\nUnits: ${selectedLevel} Completed`);
        setDevClickCount(0);
    };

    return (
        <div className="profile-container">
            <div className="card-premium text-center p-32">
                {user ? (
                    <>
                        <div
                            onClick={handleDevTrigger}
                            className="avatar-container w-100 h-100 relative"
                        >
                            <Image 
                                src={user.photoURL || '/default-avatar.png'} 
                                alt={user.displayName || 'User'} 
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h2
                            onClick={handleDevTrigger}
                            className="font-24 font-900 text-main mb-8 cursor-pointer user-select-none"
                        >
                            {user.displayName}
                        </h2>
                        <p className="text-secondary font-700 mb-24">
                            ¡Bienvenido de nuevo, Maestro del Español! 🇪🇸
                        </p>

                        {/* Hidden Dev Tools - Admin Only */}
                        {user.email === 'heroyik@gmail.com' && devClickCount >= 5 && (
                            <div className="mb-20 p-16 bg-dev border-dev rounded-12">
                                <p className="font-14 font-800 text-duo-green mb-12">🔧 DEVELOPER CONSOLE</p>
                                <div className="flex-center gap-8">
                                    <span className="font-12 font-700 text-secondary">Target Level:</span>
                                    <select
                                        value={selectedLevel}
                                        onChange={(e) => setSelectedLevel(Number(e.target.value))}
                                        className="select-standard"
                                        title="Seleccionar nivel para desbloquear"
                                    >
                                        {Array.from({ length: 15 }, (_, i) => i + 1).map(level => (
                                            <option key={level} value={level}>Level {level}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleUnlockLevel}
                                        className="duo-button duo-button-primary w-auto p-16"
                                        style={{ padding: '8px 16px' }}
                                    >
                                        Unlock 🔓
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="stat-grid">
                            <div className="badge-outline">
                                <p className="font-12 text-secondary font-800">STREAK</p>
                                <p className="font-20 font-900 text-duo-orange">🔥 {stats.streak}</p>
                            </div>
                            <div className="badge-outline">
                                <p className="font-12 text-secondary font-800">TOTAL GEMS</p>
                                <p className="font-20 font-900 text-duo-blue">💎 {stats.gems}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="duo-button bg-danger shadow-danger"
                        >
                            CERRAR SESIÓN
                        </button>
                    </>
                ) : (
                    <>
                        <div className="font-64 mb-16">🔑</div>
                        <h2 className="font-24 font-900 text-main mb-16">
                            Guarda tu Progreso
                        </h2>
                        <p className="text-secondary font-700 mb-32">
                            ¡Inicia sesión con Google para sincronizar tu XP, racha y rango en la tabla de clasificación global!
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
                            INICIAR SESIÓN CON GOOGLE
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
