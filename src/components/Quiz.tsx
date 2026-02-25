"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { VocabEntry, guessPOS } from "@/utils/vocab";
import vocabData from "@/data/vocab.json"; // Import full vocab for distractors
import deleSentences from "@/data/dele_sentences.json";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, CheckCircle, XCircle, HelpCircle, Frown } from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useGlobalTop20 } from "@/hooks/useGlobalTop20";
import { useRank } from "@/hooks/useRank";
import Image from "next/image";
import vol1 from "../../public/vol1.jpg";
import vol2 from "../../public/vol2.jpg";

type DeleSentenceMap = Record<string, { sentence: string; translation: string }>;
const DELE: DeleSentenceMap = deleSentences as DeleSentenceMap;

interface QuizProps {
  unitId: string;
  unitWords: VocabEntry[];
  unitTitle?: string;
  sources: string[];
}

export default function Quiz({ unitId, unitWords, unitTitle }: QuizProps) {
  const router = useRouter();
  const { addXP, addGem, addMistake, completeUnit, user, stats } = useGamification();

  // 6.2 — Live rank refresh after quiz ends
  const { refresh: refreshRank } = useRank(user?.uid ?? null, stats.xp);

  // Wall of Pain lookup (session-cached, no extra Firestore reads)
  const { top20 } = useGlobalTop20();
  const wallOfPainMap = useMemo(() => {
    const map = new Map<string, number>();
    top20.forEach((entry, idx) => map.set(entry.word, idx + 1));
    return map;
  }, [top20]);

  // Memoize grouped vocabulary by POS to optimize generation
  const vocabByPOS = useMemo(() => {
    const groups: Record<string, VocabEntry[]> = {
      noun: [],
      verb: [],
      adjective: [],
      other: []
    };
    (vocabData as VocabEntry[]).forEach(entry => {
      const pos = guessPOS(entry);
      groups[pos].push(entry);
    });
    return groups;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [comboCount, setComboCount] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hasMistakes, setHasMistakes] = useState(false);
  const [questions] = useState(() => [...unitWords].sort(() => Math.random() - 0.5));

  // Refresh rank when quiz finishes (6.2)
  useEffect(() => {
    if (showResult) {
      refreshRank();
    }
  }, [showResult, refreshRank]);

  const generateOptions = useCallback((currentEntry: VocabEntry) => {
    const correctAnswer = currentEntry["한국어 의미"];
    const pos = guessPOS(currentEntry);

    // 1. Try to get 3 distractors from the same POS
    const samePOSDistractors = vocabByPOS[pos]
      .filter(v => v["한국어 의미"] !== correctAnswer)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    let finalDistractors = samePOSDistractors.map(v => v["한국어 의미"]);

    // 2. Fallback if not enough same-POS words (unlikely with this dataset but safe)
    if (finalDistractors.length < 3) {
      const fallbackDistractors = (vocabData as VocabEntry[])
        .filter(v => v["한국어 의미"] !== correctAnswer && !finalDistractors.includes(v["한국어 의미"]))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 - finalDistractors.length)
        .map(v => v["한국어 의미"]);

      finalDistractors = [...finalDistractors, ...fallbackDistractors];
    }

    return [correctAnswer, ...finalDistractors].sort(() => Math.random() - 0.5);
  }, [vocabByPOS]);

  const options = useMemo(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      return generateOptions(questions[currentIndex]);
    }
    return [];
  }, [currentIndex, questions, generateOptions]);

  const handleCheck = (option: string) => {
    if (selectedOption) return;

    setSelectedOption(option);
    const correct = option === questions[currentIndex]["한국어 의미"];
    setIsCorrect(correct);

    if (correct) {
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      setScore(prev => prev + 1);
      addXP(10);

      if (newCombo >= 3) {
        playSound("cheer");
        triggerHaptic("combo");
      } else {
        playSound("correct");
        triggerHaptic("success");
      }
    } else {
      setComboCount(0);
      setHasMistakes(true);
      addMistake(questions[currentIndex]["스페인어 단어"], unitId);
      playSound("incorrect");
      triggerHaptic("error");
    }
  };

  const handleDontKnow = () => {
    if (selectedOption) return;

    setComboCount(0);
    setHasMistakes(true);
    addMistake(questions[currentIndex]["스페인어 단어"], unitId);
    setIsCorrect(false);
    setSelectedOption("DONT_KNOW");
    playSound("incorrect");
    triggerHaptic("error");
  };

  const playSound = (type: "correct" | "incorrect" | "cheer") => {
    if (!stats.settings?.soundEnabled) return;
    try {
      const soundFile = type === "cheer"
        ? `cheer${Math.floor(Math.random() * 5) + 1}.mp3`
        : `${type}.mp3`;
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.play().catch(e => console.warn("Audio play blocked or file missing:", e));
    } catch (e) {
      console.error("Audio initialization failed:", e);
    }
  };

  const triggerHaptic = (type: "success" | "error" | "combo") => {
    if (!stats.settings?.hapticsEnabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    if (type === "success") {
      navigator.vibrate(50);
    } else if (type === "combo") {
      navigator.vibrate([50, 30, 50, 30, 50]);
    } else {
      navigator.vibrate([100, 50, 100]);
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
          completeUnit(unitId, 0, !hasMistakes);
          addGem(20);
        }
      }
    }
  };

  if (questions.length === 0) return <div className="flex-center min-h-screen font-800">Loading...</div>;

  if (showResult) {
    return (
      <div className="container flex-center min-h-screen flex-col pt-40-pb-20 relative">
        {/* Book Source Badge */}
        {questions.length > 0 && questions[currentIndex] && (
          <div className="source-badge" data-testid="source-badge">
            <Image
              src={questions[currentIndex]["출처"] === "2" ? vol2 : vol1}
              alt="Book Source"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
        )}

        <div className="w-full max-w-md mb-8 flex justify-between items-center px-4"></div>
        <h2 className="text-main-title text-duo-green mb-20">Finished!</h2>
        <div className="text-center mb-32">
          <div className="text-subtitle mb-8">Your Score:</div>
          <span className="score-text">
            {score} / {questions.length}
          </span>
          <p className="pass-message">
            {score === questions.length ? "Perfect! 🌟" : score >= questions.length * 0.8 ? "Great job! 🔥" : "Keep practicing! 💪"}
          </p>
        </div>
        <button
          onClick={() => router.push('/')}
          className="duo-button duo-button-primary w-auto px-40 py-12"
        >
          CONTINUE
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;
  const painRank = wallOfPainMap.get(currentQuestion["스페인어 단어"]);
  const isDontKnow = selectedOption === "DONT_KNOW";

  // 6.4 — DELE sentence lookup
  const deleSentence = isCorrect
    ? DELE[currentQuestion["스페인어 단어"]] ?? null
    : null;

  return (
    <div className="container flex flex-col min-h-screen p-20-120 relative">
      {/* Header */}
      <div className="flex-between gap-16 mb-32">
        <Link href="/" aria-label="Close lesson" className="no-underline">
          <X className="text-subtitle pointer" />
        </Link>
        <div className="flex-1 progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-title mb-32">
          {unitTitle && <span className="text-duo-blue mr-8">{unitTitle}:</span>}
          What does this word mean?
        </h2>

        <div className="quiz-card mb-32">
          {/* Book Source Badge inside Card */}
          {questions.length > 0 && questions[currentIndex] && (
            <div className="source-badge" data-testid="source-badge">
              <Image
                src={questions[currentIndex]["출처"] === "2" ? vol2 : vol1}
                alt="Book Source"
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          )}
          <div className="text-main-title text-es-red mb-8">
            {currentQuestion["스페인어 단어"]}
          </div>
          {currentQuestion["예문"] && (
            <div className="text-subtitle italic font-16">
              &quot;{currentQuestion["예문"]}&quot;
            </div>
          )}
          {/* 6.2 — Wall of Pain badge */}
          {painRank && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                marginTop: "10px",
                background: "#fee2e2",
                color: "#dc2626",
                borderRadius: "10px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 700,
              }}
            >
              <Frown size={13} />
              Wall of Pain #{painRank}
            </div>
          )}
        </div>
        <div className="grid-gap-12">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleCheck(option)}
              className={`duo-button duo-button-outline ${selectedOption === option
                ? (isCorrect ? 'correct' : 'incorrect')
                : (selectedOption && option === currentQuestion["한국어 의미"] ? 'correct' : '')
                }`}
              disabled={!!selectedOption}
            >
              {option}
            </button>
          ))}
        </div>

        {/* 6.3 — Funnier No Lo Sé button */}
        {!selectedOption && (
          <button
            onClick={handleDontKnow}
            className="duo-button duo-button-outline btn-nolo w-full mt-24 text-subtitle"
            style={{ borderColor: '#afafaf', color: '#777' }}
          >
            <HelpCircle size={16} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
            No Lo Sé... (I have no idea!)
          </button>
        )}
      </div>

      {/* 6.3 + 6.4 — Feedback Bar */}
      {selectedOption && (
        <div
          className={`quiz-feedback-bar ${isCorrect ? 'correct' : 'incorrect'}`}
          style={isDontKnow ? { background: "#fff0f0", borderColor: "#fecaca" } : undefined}
        >
          <div className="container flex-between">
            <div className="flex-center gap-12">
              {isCorrect ? (
                <CheckCircle size={32} className="text-duo-green" />
              ) : (
                <XCircle size={32} className="text-es-red" />
              )}
              <div>
                {/* 6.3 — Friendlier message for "don't know" */}
                <h3
                  className={`text-subtitle ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`}
                  style={isDontKnow ? { color: "#dc2626" } : undefined}
                >
                  {isDontKnow
                    ? "😅 That's okay! Here's the answer:"
                    : isCorrect
                      ? "✅ ¡Correcto!"
                      : "Correct solution:"}
                </h3>
                {(!isCorrect || isDontKnow) && (
                  <p className="correct-solution">
                    {questions[currentIndex]["한국어 의미"]}
                  </p>
                )}
                {/* 6.4 — DELE contextual sentence */}
                {isCorrect && deleSentence && (
                  <div
                    style={{
                      marginTop: "8px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      color: "#166534",
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "2px" }}>
                      💬 &quot;{deleSentence.sentence}&quot;
                    </div>
                    <div style={{ opacity: 0.75 }}>({deleSentence.translation})</div>
                  </div>
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
              NEXT
            </button>
          </div>
        </div>
      )}

      {/* 6.3 — No Lo Sé jiggle animation */}
      <style>{`
        @keyframes jiggle {
          0%  { transform: rotate(0deg); }
          20% { transform: rotate(-3deg); }
          40% { transform: rotate(3deg); }
          60% { transform: rotate(-3deg); }
          80% { transform: rotate(3deg); }
          100%{ transform: rotate(0deg); }
        }
        .btn-nolo:hover {
          animation: jiggle 0.4s ease;
        }
      `}</style>
    </div>
  );
}
