
import React, { useState, useEffect } from 'react';
import { Word } from '../types';

interface QuizModeProps {
  words: Word[];
  onComplete: () => void;
}

const QuizMode: React.FC<QuizModeProps> = ({ words, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState<string | null>(null);

  const quizWords = React.useMemo(() => {
    return [...words].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [words]);

  const generateOptions = (correctAnswer: string) => {
    const wrong = words
      .filter(w => w.korean !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.korean);
    return [...wrong, correctAnswer].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (quizWords.length > 0 && currentQuestion < quizWords.length) {
      setOptions(generateOptions(quizWords[currentQuestion].korean));
      setAnswered(null);
    }
  }, [currentQuestion, quizWords]);

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(option);
    if (option === quizWords[currentQuestion].korean) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < quizWords.length - 1) {
        setCurrentQuestion(c => c + 1);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  if (words.length < 4) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Not enough words for a quiz.</h2>
        <p className="text-slate-500 mb-6">Add at least 4 words to your library first.</p>
        <button onClick={onComplete} className="bg-amber-500 text-white px-6 py-2 rounded-lg">Back to Home</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="max-w-md mx-auto text-center py-10 space-y-6 animate-in zoom-in duration-300">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold text-slate-900">Quiz Completed!</h2>
        <div className="bg-amber-50 p-8 rounded-3xl border-2 border-amber-100">
          <div className="text-5xl font-black text-amber-600 mb-2">{score} / {quizWords.length}</div>
          <p className="text-amber-800 font-medium">Great effort!</p>
        </div>
        <button 
          onClick={onComplete}
          className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold hover:bg-amber-600 shadow-lg shadow-amber-100"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const current = quizWords[currentQuestion];

  return (
    <div className="max-w-xl mx-auto py-8 space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="h-2 flex-1 bg-slate-100 rounded-full mr-4 overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(currentQuestion / quizWords.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-400">{currentQuestion + 1} / {quizWords.length}</span>
      </div>

      <div className="bg-white p-12 rounded-3xl border-2 border-slate-200 text-center shadow-xl">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 block">Translate this word</span>
        <h2 className="text-5xl font-black text-slate-900 mb-2">{current.spanish}</h2>
        {current.gender && <p className="text-slate-400 uppercase text-xs font-bold">({current.gender})</p>}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, idx) => {
          let color = "bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50";
          if (answered === option) {
            color = option === current.korean ? "bg-green-100 border-green-500 text-green-700" : "bg-red-100 border-red-500 text-red-700";
          } else if (answered && option === current.korean) {
            color = "bg-green-100 border-green-500 text-green-700";
          }

          return (
            <button
              key={idx}
              disabled={!!answered}
              onClick={() => handleAnswer(option)}
              className={`p-5 rounded-2xl border-2 font-bold text-lg text-left transition-all ${color}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizMode;
