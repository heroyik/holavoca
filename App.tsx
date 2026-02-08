
import React, { useState, useEffect, useCallback } from 'react';
import { View, Word } from './types';
import Landing from './components/Landing';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import WordList from './components/WordList';
import FlashcardStudy from './components/FlashcardStudy';
import QuizMode from './components/QuizMode';
import VoicePractice from './components/VoicePractice';

// Initial sample data so the app isn't empty on first load
const SAMPLE_WORDS: Word[] = [
  { id: '1', spanish: 'hola', korean: '안녕', mastered: true, level: 5 },
  { id: '2', spanish: 'gracias', korean: '감사합니다', mastered: false, level: 2 },
  { id: '3', spanish: 'amor', gender: 'm', korean: '사랑', mastered: false, level: 0 },
  { id: '4', spanish: 'casa', gender: 'f', korean: '집', mastered: true, level: 4 },
  { id: '5', spanish: 'agua', gender: 'f', korean: '물', mastered: false, level: 1 },
];

export default function App() {
  const [view, setView] = useState<View>(View.LANDING);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('holaVoca_words');
    if (saved) {
      setWords(JSON.parse(saved));
    } else {
      setWords(SAMPLE_WORDS);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem('holaVoca_words', JSON.stringify(words));
    }
  }, [words]);

  const handleUpdateWord = (updatedWord: Word) => {
    setWords(prev => prev.map(w => w.id === updatedWord.id ? updatedWord : w));
  };

  const handleAddWords = (newWords: Word[]) => {
    setWords(prev => {
      const existing = new Set(prev.map(w => w.spanish.toLowerCase()));
      const filtered = newWords.filter(w => !existing.has(w.spanish.toLowerCase()));
      return [...prev, ...filtered];
    });
  };

  const renderContent = () => {
    switch (view) {
      case View.LANDING:
        return <Landing onStart={() => setView(View.DASHBOARD)} onImport={handleAddWords} />;
      case View.DASHBOARD:
        return <Dashboard words={words} onNavigate={setView} />;
      case View.LIST:
        return <WordList words={words} onUpdate={handleUpdateWord} onNavigate={() => setView(View.DASHBOARD)} />;
      case View.STUDY:
        return <FlashcardStudy words={words.filter(w => !w.mastered)} onUpdate={handleUpdateWord} onBack={() => setView(View.DASHBOARD)} />;
      case View.QUIZ:
        return <QuizMode words={words} onComplete={() => setView(View.DASHBOARD)} />;
      case View.VOICE:
        return <VoicePractice words={words} onBack={() => setView(View.DASHBOARD)} />;
      default:
        return <Dashboard words={words} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {view !== View.LANDING && (
        <Header 
          currentView={view} 
          onNavigate={setView} 
          wordsCount={words.length}
        />
      )}
      <main className="flex-1 container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}
