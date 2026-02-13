"use client";

import vocabData from '@/data/vocab.json';

import { useState } from 'react';
import { APP_VERSION } from '@/lib/constants';
import { getUnits, getTotalWordCount } from '@/utils/vocab';
import Link from 'next/link';
import Image from 'next/image';
import { useGamification } from '@/hooks/useGamification';
import Leaderboard from '@/components/Leaderboard';
import UserProfile from '@/components/UserProfile';
import ReviewTab from '@/components/ReviewTab';
import vol1 from '../../public/vol1.jpg';
import vol2 from '../../public/vol2.jpg';
import { Github } from 'lucide-react';

// Gamification Helpers
const getLevelTitle = (idx: number) => {
  if (idx < 5) return "BEGINNER";
  if (idx < 10) return "INTERMEDIATE";
  return "ADVANCED";
};

const getUnitIcon = (idx: number, isLocked: boolean, isCompleted: boolean) => {
  if (isLocked) return '🔒';
  if (isCompleted) return '✅';
  if (idx === 4 || idx === 9 || idx === 14) return '👑'; // Milestone
  return '⭐';
};

const getLevelColor = (idx: number, isLocked: boolean) => {
  if (isLocked) return '#afafaf';
  if (idx < 5) return 'var(--es-red)';
  if (idx < 10) return '#3b82f6'; // Blue for Intermediate
  return 'var(--es-yellow)';      // Gold for Advanced
};

const getMotivationalSticker = (idx: number) => {
  const stickers = [
    "🌱 First Steps", "🔍 Word Hunter", "🎯 Target Hit", "🚀 Blasting Off", "💎 Shiny Start",
    "🌉 Bridge Builder", "🔥 Getting Hotter", "🎭 Story Teller", "🧩 Mastermind", "⛰️ Leveling Up",
    "👑 Word Royalty", "🎓 Wise Scholar", "⚡ Power Flow", "🌌 Zen Master", "🏆 Legend!"
  ];
  return stickers[idx] || "🔥 Keep Going!";
};

export default function Home() {
  const [selectedBooks, setSelectedBooks] = useState<string[]>(() => {
    // Lazy initializer to avoid useEffect setState warning
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('selected_books');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // Error ignored
        }
      }
    }
    return ['1'];
  });
  const [activeTab, setActiveTab] = useState<'learn' | 'review' | 'leader' | 'profile'>('learn');
  const { stats, user } = useGamification();

  // Load selection effect removed - now handled in initializer

  const units = getUnits(selectedBooks);
  const totalWords = getTotalWordCount(selectedBooks);

  const toggleBook = (bookId: string) => {
    setSelectedBooks(prev => {
      let newState;
      if (prev.includes(bookId)) {
        if (prev.length === 1) return prev;
        newState = prev.filter(id => id !== bookId);
      } else {
        newState = [...prev, bookId];
      }
      sessionStorage.setItem('selected_books', JSON.stringify(newState));
      return newState;
    });
  };

  const handleDownload = () => {
    const date = new Date().toISOString().split('T')[0];
    const fileName = `${date}-voca.json`;
    const jsonString = JSON.stringify(vocabData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement('a'));
    link.href = url;
    link.download = fileName;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="container min-h-screen bg-soft pb-140">
      {/* Premium Compact Header */}
      <header className="sticky-header">
        <div className="flex items-center gap-6">
          <h1 className="font-18 font-900 m-0 text-es-red leading-1-1">HolaVoca</h1>
          <span className="version-badge font-10">{APP_VERSION.replace('v', '')}</span>
        </div>

        <div className="header-progress-container">
          <div className="stat-badge font-14 flex items-center gap-6 px-0 bg-transparent border-none shadow-none">
            <span className="text-duo-orange">🔥{stats.streak}</span>
            <span className="text-duo-blue">💎{stats.gems}</span>
          </div>
          
          <div className="header-progress">
            <div 
              className="header-progress-inner"
              style={{ width: `${Math.min((stats.xp % 100), 100)}%` }} 
            />
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div
            onClick={handleDownload}
            className="vocab-stash-pill mt-0 flex items-center gap-2"
          >
            <strong className="text-es-red">{totalWords.toLocaleString()}</strong>📚
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => toggleBook('1')}
              className={`book-cover-mini ${selectedBooks.includes('1') ? 'active' : ''}`}
            >
              <Image src={vol1} alt="Book 1" className="w-full h-full object-cover" />
            </div>
            <div
              onClick={() => toggleBook('2')}
              className={`book-cover-mini ${selectedBooks.includes('2') ? 'active' : ''}`}
            >
              <Image src={vol2} alt="Book 2" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </header>

      <div className="p-8" />

      {activeTab === 'learn' && (
        <div className="learn-container">
          {/* Connector SVG Background */}
          <svg className="connector-svg">
            <path
              d={units.slice(0, 15).map((_, i) => {
                const x = (120 + (Math.sin(i * 1.2) * 60)).toFixed(2);
                const y = (i * 200).toFixed(2);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {units.slice(0, 15).map((unit, index) => {
            const offset = (Math.sin(index * 1.2) * 60).toFixed(2);
            const isCompleted = stats.completedUnits.includes(unit.id);
            const isLocked = index > stats.completedUnits.length;
            const isCurrent = index === stats.completedUnits.length;

            const unitStatusClass = isLocked ? 'locked' : (isCurrent ? 'current' : (isCompleted ? 'completed' : 'available'));

            return (
              <div key={unit.id} 
                className="unit-node-container"
                style={{ transform: `translateX(${offset}px)` }}
              >
                <Link
                  href={isLocked ? '#' : `/quiz/${unit.id}?sources=${selectedBooks.join(',')}`}
                  onClick={(e) => isLocked && e.preventDefault()}
                  className="no-underline"
                >
                  <button
                    className={`unit-button ${unitStatusClass}`}
                  >
                    {getUnitIcon(index, isLocked, isCompleted)}

                    {isCurrent && (
                      <div className="start-indicator">
                        START!
                      </div>
                    )}
                  </button>
                </Link>

                <div className="unit-label-card" style={{
                  border: `3px solid ${isLocked ? 'var(--border-light)' : getLevelColor(index, isLocked)}`,
                  boxShadow: `0 4px 0 ${isLocked ? '#e5e5e5' : 'rgba(0,0,0,0.1)'}`,
                }}>
                  <p className="font-11 font-900 letter-spacing-0-5 mb-1" style={{ color: getLevelColor(index, isLocked) }}>
                    {getLevelTitle(index)} {index + 1}
                  </p>
                  <p className={`font-14 font-800 ${isLocked ? 'text-disabled' : 'text-main'} mt-4`}>
                    {getMotivationalSticker(index)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'review' && <ReviewTab />}
      {activeTab === 'leader' && <Leaderboard />}
      {activeTab === 'profile' && <UserProfile user={user} stats={stats} />}

      <style jsx global>{`
        @keyframes pulse-node {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Footer Nav */}
      <nav className="footer-nav">
        <div
          onClick={() => setActiveTab('learn')}
          className={`nav-item ${activeTab === 'learn' ? 'active' : ''}`}
        >
          <span className="font-24">🏠</span>
          <span className="font-10 font-800">LEARN</span>
        </div>
        <div
          onClick={() => setActiveTab('leader')}
          className={`nav-item ${activeTab === 'leader' ? 'active' : ''}`}
        >
          <span className="font-24">🏆</span>
          <span className="font-10 font-800">LEADER</span>
        </div>
        <div
          onClick={() => setActiveTab('review')}
          className={`nav-item ${activeTab === 'review' ? 'active' : ''}`}
        >
          <span className="font-24">📚</span>
          <span className="font-10 font-800">REVIEW</span>
        </div>
        <div
          onClick={() => setActiveTab('profile')}
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <span className="font-24">👤</span>
          <span className="font-10 font-800">PROFILE</span>
        </div>
        
        <div className="aura-bar">
          <div>My Learning Aura: <strong className="text-es-red font-15">{stats.xp.toLocaleString()} ✨</strong></div>
          <div className="separator-v"></div>
          <a
            href="https://github.com/heroyik/holavoca"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Repositorio de GitHub"
            title="GitHub Repository"
            className="aura-link"
          >
            <Github size={16} />
          </a>
        </div>
      </nav>
    </main>
  );
}
