"use client";

import { useState, useEffect } from "react";
import { useGamification } from "@/hooks/useGamification";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import Quiz from "@/components/Quiz";

export default function ReviewQuizLoader() {
    const { stats } = useGamification();
    const mistakes = stats.mistakes || {};
    const missedWordList = Object.keys(mistakes);

    const [shuffledWords, setShuffledWords] = useState<VocabEntry[]>([]);

    useEffect(() => {
        const words = (vocabData as VocabEntry[]).filter(v => 
            missedWordList.includes(v["스페인어 단어"])
        );
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setTimeout(() => setShuffledWords(shuffled), 0);
    }, [missedWordList]);

    if (missedWordList.length === 0) {
        return <div className="flex-center min-h-screen text-main font-800">¡No hay errores para repasar!</div>;
    }

    return (
        <Quiz 
            unitId="review" 
            unitWords={shuffledWords} 
            unitTitle="Session de Repaso" 
            sources={['1', '2']} // Include all sources for distractors
        />
    );
}
