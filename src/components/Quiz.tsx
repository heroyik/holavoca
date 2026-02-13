"use client";

import { useState, useCallback, useMemo } from "react";
import { VocabEntry } from "@/utils/vocab";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, CheckCircle, XCircle } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";

interface QuizProps {
  unitId: string;
  unitWords: VocabEntry[];
  unitTitle?: string;
  sources: string[];
}

export default function Quiz({ unitId, unitWords, unitTitle }: QuizProps) {
  const router = useRouter();
  const { addXP, addGem, addMistake, completeUnit } = useGamification();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [questions] = useState(() => [...unitWords].sort(() => Math.random() - 0.5));

  const generateOptions = useCallback((correctAnswer: string) => {
    const distractors = unitWords
      .map(v => v["한국어 의미"])
      .filter(v => v !== correctAnswer);
    const shuffledDistractors = distractors.sort(() => Math.random() - 0.5).slice(0, 3);
    return [...shuffledDistractors, correctAnswer].sort(() => Math.random() - 0.5);
  }, [unitWords]);

  const options = useMemo(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      return generateOptions(questions[currentIndex]["한국어 의미"]);
    }
    return [];
  }, [currentIndex, questions, generateOptions]);

  const handleCheck = (option: string) => {
    if (selectedOption) return;
    
    setSelectedOption(option);
    const correct = option === questions[currentIndex]["한국어 의미"];
    setIsCorrect(correct);

    if (correct) {
      setScore(prev => prev + 1);
      addXP(10);
    } else {
      addMistake(questions[currentIndex]["스페인어 단어"]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setShowResult(true);
      if (unitId !== 'review') {
        const passThreshold = Math.ceil(questions.length * 0.8);
        if (score >= passThreshold) {
          completeUnit(unitId);
          addGem(20);
        }
      }
    }
  };

  if (questions.length === 0) return <div className="flex-center min-h-screen font-800">Cargando...</div>;

  if (showResult) {
    return (
      <div className="container flex-center min-h-screen flex-col pt-40-pb-20">
        <h2 className="text-main-title text-duo-green mb-20">¡Terminado!</h2>
        <div className="text-center mb-32">
          <div className="text-subtitle mb-8">Tu Puntuación:</div>
          <span className="score-text">
            {score} / {questions.length}
          </span>
          <p className="pass-message">
            {score === questions.length ? "¡Perfecto! 🌟" : score >= questions.length * 0.8 ? "¡Muy bien! 🔥" : "¡Sigue practicando! 💪"}
          </p>
        </div>
        <button 
          onClick={() => router.push('/')}
          className="duo-button duo-button-primary w-auto px-40 py-12"
        >
          CONTINUAR
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="container flex flex-col min-h-screen p-20-120">
      {/* Header */}
      <div className="flex-between gap-16 mb-32">
        <Link href="/" aria-label="Cerrar lección" className="no-underline">
          <X className="text-subtitle pointer" />
        </Link>
        <div className="flex-1 progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-title mb-32">
          {unitTitle && <span className="text-duo-blue mr-8">{unitTitle}:</span>}
          ¿Qué significa esta palabra?
        </h2>

        <div className="quiz-card mb-32">
          <div className="text-main-title text-es-red mb-8">
            {currentQuestion["스페인어 단어"]}
          </div>
          {currentQuestion["예문"] && (
            <div className="text-subtitle italic font-16">
              &quot;{currentQuestion["예문"]}&quot;
            </div>
          )}
        </div>

        <div className="grid-gap-12">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleCheck(option)}
              className={`duo-button duo-button-outline ${
                selectedOption === option
                  ? (isCorrect ? 'correct' : 'incorrect')
                  : (selectedOption && option === currentQuestion["한국어 의미"] ? 'correct' : '')
              }`}
              disabled={!!selectedOption}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Bar */}
      {selectedOption && (
        <div className={`quiz-feedback-bar ${isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="container flex-between">
            <div className="flex-center gap-12">
              {isCorrect ? (
                <CheckCircle size={32} className="text-duo-green" />
              ) : (
                <XCircle size={32} className="text-es-red" />
              )}
              <div>
                <h3 className={`text-subtitle ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}>
                  {isCorrect ? '¡Excelente!' : 'Solución correcta:'}
                </h3>
                {!isCorrect && (
                  <p className="correct-solution">
                    {questions[currentIndex]["한국어 의미"]}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`duo-button w-auto px-40 py-12 ${isCorrect ? 'duo-button-primary' : ''}`}
              style={{ 
                backgroundColor: isCorrect ? 'var(--duo-green)' : 'var(--es-red)',
                color: 'white',
                boxShadow: isCorrect ? '0 4px 0 var(--duo-green-dark)' : '0 4px 0 var(--es-red)'
              }}
            >
              SIGUIENTE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
