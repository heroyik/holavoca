"use client";

import { useGamification } from "@/hooks/useGamification";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import Quiz from "@/components/Quiz";

export default function ReviewQuizLoader() {
    const { stats } = useGamification();
    const mistakes = stats.mistakes || {};
    const missedWordList = Object.keys(mistakes);

    if (missedWordList.length === 0) {
        return <div className="flex-center" style={{ height: '100vh' }}>No mistakes to review!</div>;
    }

    // Get the full entries for the missed words
    const reviewWords = (vocabData as VocabEntry[]).filter(v => 
        missedWordList.includes(v["스페인어 단어"])
    );

    // Shuffle them
    const shuffledWords = [...reviewWords].sort(() => Math.random() - 0.5);

    return (
        <Quiz 
            unitId="review" 
            unitWords={shuffledWords} 
            unitTitle="Session de Repaso" 
            sources={['1', '2']} // Include all sources for distractors
        />
    );
}
