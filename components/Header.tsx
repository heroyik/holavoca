
import React from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  wordsCount: number;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, wordsCount }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => onNavigate(View.DASHBOARD)}
        >
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">HolaVoca</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate(View.DASHBOARD)}
            className={`text-sm font-medium ${currentView === View.DASHBOARD ? 'text-amber-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => onNavigate(View.LIST)}
            className={`text-sm font-medium ${currentView === View.LIST ? 'text-amber-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Words
          </button>
          <button 
            onClick={() => onNavigate(View.STUDY)}
            className={`text-sm font-medium ${currentView === View.STUDY ? 'text-amber-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Study
          </button>
          <button 
            onClick={() => onNavigate(View.QUIZ)}
            className={`text-sm font-medium ${currentView === View.QUIZ ? 'text-amber-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Quiz
          </button>
          <button 
            onClick={() => onNavigate(View.VOICE)}
            className={`text-sm font-medium ${currentView === View.VOICE ? 'text-amber-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Voice Tutor
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
            {wordsCount} Words
          </span>
          <button 
            onClick={() => onNavigate(View.VOICE)}
            className="bg-amber-100 text-amber-700 p-2 rounded-full hover:bg-amber-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
