
import React from 'react';
import { View, Word } from '../types';

interface DashboardProps {
  words: Word[];
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ words, onNavigate }) => {
  const masteredCount = words.filter(w => w.mastered).length;
  const learningCount = words.length - masteredCount;
  const progressPercent = words.length > 0 ? Math.round((masteredCount / words.length) * 100) : 0;

  const quickActions = [
    { title: 'Start Flashcards', desc: 'Quickly review new words', view: View.STUDY, icon: '📇', color: 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' },
    { title: 'Take a Quiz', desc: 'Test your knowledge', view: View.QUIZ, icon: '📝', color: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100' },
    { title: 'Voice Practice', desc: 'Speak with AI Tutor', view: View.VOICE, icon: '🎙️', color: 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100' },
    { title: 'View Word List', desc: 'Browse all vocabulary', view: View.LIST, icon: '📚', color: 'bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">¡Hola, Estudiante!</h1>
          <p className="text-slate-500">Keep up the great work. Here's your progress.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigate(View.STUDY)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-amber-200 transition-all"
          >
            Study Now
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-black text-slate-900 mb-1">{words.length}</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Words</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-black text-green-600 mb-1">{masteredCount}</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Mastered</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="text-4xl font-black text-amber-500 mb-1">{learningCount}</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Learning</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Overall Progress</h3>
          <span className="text-sm font-bold text-amber-600">{progressPercent}%</span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(action.view)}
            className={`p-6 rounded-2xl border flex items-center text-left gap-4 transition-all group ${action.color}`}
          >
            <span className="text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
            <div>
              <div className="font-bold text-lg">{action.title}</div>
              <div className="text-sm opacity-80">{action.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
