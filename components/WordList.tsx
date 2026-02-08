
import React, { useState } from 'react';
import { Word } from '../types';

interface WordListProps {
  words: Word[];
  onUpdate: (word: Word) => void;
  onNavigate: () => void;
}

const WordList: React.FC<WordListProps> = ({ words, onUpdate, onNavigate }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'mastered' | 'learning'>('all');

  const filteredWords = words.filter(w => {
    const matchesSearch = w.spanish.toLowerCase().includes(search.toLowerCase()) || 
                          w.korean.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'mastered' && w.mastered) || 
                          (filter === 'learning' && !w.mastered);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Vocabulary Library</h1>
        <div className="flex items-center gap-2">
           <div className="relative flex-1 min-w-[240px]">
              <input 
                type="text" 
                placeholder="Search words..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
              />
              <svg className="absolute left-3 top-2.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
           </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'learning', 'mastered'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
              filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Spanish</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Korean</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredWords.map(word => (
              <tr key={word.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{word.spanish}</div>
                  {word.gender && <div className="text-[10px] text-slate-400 uppercase font-black">{word.gender === 'm' ? 'Masculino' : 'Femenino'}</div>}
                </td>
                <td className="px-6 py-4 text-slate-600 font-medium">{word.korean}</td>
                <td className="px-6 py-4">
                  {word.mastered ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      Mastered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      Learning
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onUpdate({ ...word, mastered: !word.mastered })}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline decoration-2 underline-offset-4"
                  >
                    Mark as {word.mastered ? 'Learning' : 'Mastered'}
                  </button>
                </td>
              </tr>
            ))}
            {filteredWords.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  No words found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WordList;
