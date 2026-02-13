"use client";

import { useState, useEffect } from "react";
import { VocabEntry, getRandomWords, getGenderedForm } from "@/utils/vocab";
import { useRouter } from "next/navigation";
import { useGamification } from "@/hooks/useGamification";

interface QuizProps {
  unitId: string;
  unitWords: VocabEntry[];
  unitTitle: string;
  sources?: string[]; // Added sources prop
}

type QuestionType = "translate-ko" | "translate-es" | "gender";

interface Question {
  word: VocabEntry;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  displayWord?: string;
}

export default function Quiz({ unitId, unitWords, unitTitle, sources = ['1'] }: QuizProps) {
  const router = useRouter();
  const { completeUnit } = useGamification();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Generate questions from unit words and reset quiz state
  useEffect(() => {
    const generated: Question[] = unitWords.map((word) => {
      let type: QuestionType = "translate-ko";
      const hasGender = word["성별/문법 정보"]?.includes("m") || word["성별/문법 정보"]?.includes("f");

      const rand = Math.random();
      if (hasGender && rand > 0.8) {
        type = "gender";
      } else if (rand > 0.5) {
        type = "translate-es";
      } else {
        type = "translate-ko";
      }

      let options: string[] = [];
      let correctAnswer = "";
      let displayWord = "";

      if (type === "gender") {
        const info = word["성별/문법 정보"];
        const isBoth = info.includes("m") && info.includes("f");
        let targetGender: "m" | "f" = info.includes("m") ? "m" : "f";

        if (isBoth) {
          targetGender = Math.random() > 0.5 ? "m" : "f";
        }

        correctAnswer = targetGender === "m" ? "El (Masculine)" : "La (Feminine)";
        options = ["El (Masculine)", "La (Feminine)"];
        displayWord = getGenderedForm(word["스페인어 단어"], targetGender);
      } else if (type === "translate-ko") {
        correctAnswer = word["한국어 의미"];
        const distractors = getRandomWords(3, sources, word["스페인어 단어"])
          .map(w => w["한국어 의미"]);
        options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
      } else { // translate-es
        correctAnswer = word["스페인어 단어"];
        const distractors = getRandomWords(3, sources, word["스페인어 단어"])
          .map(w => w["스페인어 단어"]);
        options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
      }

      return { word, type, options, correctAnswer, displayWord };
    });

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setIsFinished(false);
  }, [unitId, unitWords, sources]);

  const handleCheck = (option: string) => {
    if (isCorrect !== null) return;

    setSelectedOption(option);
    const correct = option === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // Quiz Finished - Reward XP (10 XP per correct answer)
      const xpEarned = score * 10;
      completeUnit(unitId, xpEarned);
      setIsFinished(true);
    }
  };

  if (questions.length === 0) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;

  if (isFinished) {
    return (
      <div className="container flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--duo-green)' }}>Finished!</h2>
        <div style={{ fontSize: '24px', textAlign: 'center' }}>
          Your Score: <br />
          <span style={{ fontSize: '48px', color: 'var(--duo-blue)' }}>{score} / {questions.length}</span>
          <p style={{ fontSize: '18px', color: 'var(--duo-orange)', marginTop: '8px' }}>+ {score * 10} XP / + {Math.floor(score / 10)} Gems</p>
        </div>
        <button
          className="duo-button duo-button-primary"
          onClick={() => router.push('/')}
        >
          Continue
        </button>
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="container" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <button onClick={() => router.push('/')} style={{ fontSize: '24px', color: 'var(--text-secondary)' }}>✕</button>
        <div style={{
          flex: 1,
          height: '16px',
          backgroundColor: 'var(--border-light)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--duo-green)',
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      {/* Question Area */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>
          {unitTitle && <span style={{ color: 'var(--duo-blue)', marginRight: '8px' }}>{unitTitle}:</span>}
          {current.type === 'translate-ko'
            ? 'Translate to Korean'
            : current.type === 'gender'
              ? 'Identify the Gender'
              : 'Choose the correct Spanish word'}
        </h2>

        <div style={{
          padding: '24px',
          border: '2px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '32px',
          fontSize: '24px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          {current.type === 'translate-ko'
            ? current.word["스페인어 단어"]
            : current.type === 'gender'
              ? current.displayWord || current.word["스페인어 단어"]
              : current.word["한국어 의미"]}
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {current.options.map((option) => (
            <button
              key={option}
              onClick={() => handleCheck(option)}
              className="duo-button duo-button-outline"
              style={{
                borderColor: selectedOption === option
                  ? (isCorrect ? 'var(--duo-green)' : 'var(--es-red)')
                  : 'var(--border-light)',
                backgroundColor: selectedOption === option
                  ? (isCorrect ? '#eefced' : '#fff0f0')
                  : 'white',
                color: selectedOption === option
                  ? (isCorrect ? 'var(--duo-green-dark)' : 'var(--es-red-dark)')
                  : 'var(--text-main)',
                borderWidth: '2px'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Feedback */}
      {isCorrect !== null && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 20px calc(24px + var(--safe-area-inset-bottom))',
          backgroundColor: isCorrect ? '#eefced' : '#fff0f0',
          borderTop: '2px solid',
          borderColor: isCorrect ? 'var(--duo-green)' : 'var(--duo-red)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              color: isCorrect ? 'var(--duo-green-dark)' : 'var(--duo-red-dark)',
              fontWeight: '800',
              fontSize: '20px'
            }}>
              {isCorrect ? 'Excellent!' : 'Correct Answer:'}
            </h3>
            {!isCorrect && <p style={{ color: 'var(--duo-red-dark)' }}>{current.correctAnswer}</p>}
          </div>
          <button
            className={`duo-button ${isCorrect ? 'duo-button-primary' : 'duo-button-blue'}`}
            style={{ width: 'auto', padding: '12px 48px' }}
            onClick={handleNext}
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
}
