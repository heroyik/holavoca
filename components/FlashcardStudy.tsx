
import React, { useState } from 'react';
import { Word } from '../types';

interface FlashcardStudyProps {
  words: Word[];
  onUpdate: (word: Word) => void;
  onBack: () => void;
}

const FlashcardStudy: React.FC<FlashcardStudyProps> = ({ words, onUpdate, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900">All caught up!</h2>
        <p className="text-slate-500 max-w-md">You've mastered all the words in your current list. Add more or review existing ones.</p>
        <button 
          onClick={onBack}
          className="bg-amber-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  const handleNext = (mastered: boolean) => {
    onUpdate({ ...currentWord, mastered, level: mastered ? (currentWord.level || 0) + 1 : currentWord.level });
    setIsFlipped(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 py-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Quit Session
        </button>
        <div className="text-sm font-bold text-slate-400">
          {currentIndex + 1} / {words.length}
        </div>
      </div>

      <div 
        className={`relative h-80 perspective-1000 cursor-pointer group`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Front */}
          <div className="absolute inset-0 w-full h-full bg-white border-2 border-slate-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Spanish</span>
            <h2 className="text-5xl font-black text-slate-900 text-center break-words w-full">
              {currentWord.spanish}
              {currentWord.gender && (
                <span className="text-lg font-bold text-slate-400 ml-2">
                  ({currentWord.gender})
                </span>
              )}
            </h2>
            <p className="mt-8 text-slate-400 text-sm animate-pulse">Click to flip</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 w-full h-full bg-amber-50 border-2 border-amber-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">Korean</span>
            <h2 className="text-4xl font-bold text-amber-900 text-center">
              {currentWord.korean}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(false); }}
          className="p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
        >
          Study Again
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); handleNext(true); }}
          className="p-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-100"
        >
          Got it!
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default FlashcardStudy;
