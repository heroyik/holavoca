"use client";

import { useState, useEffect, useMemo } from "react";
import { useGamification } from "@/hooks/useGamification";
import vocabData from "@/data/vocab.json";
import { VocabEntry, isEasyCognate } from "@/utils/vocab";
import Quiz from "@/components/Quiz";

export default function ReviewQuizLoader() {
    const { stats } = useGamification();
    const mistakes = stats.mistakes || {};
    // Memoize the list to prevent infinite loops. JSON.stringify ensures deep comparison.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const missedWordList = useMemo(() => Object.keys(mistakes), [JSON.stringify(mistakes)]);

    const excludeEasyWords = stats.settings?.excludeEasyWords ?? false;
    const [shuffledWords, setShuffledWords] = useState<VocabEntry[]>([]);

    useEffect(() => {
        let words = (vocabData as VocabEntry[]).filter(v => 
            missedWordList.includes(v["스페인어 단어"])
        );
        if (excludeEasyWords) {
            words = words.filter(v => !isEasyCognate(v["스페인어 단어"], v["한국어 의미"]));
        }
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        setTimeout(() => setShuffledWords(shuffled), 0);
    }, [missedWordList, excludeEasyWords]);

    if (missedWordList.length === 0) {
        return <div className="flex-center min-h-screen text-main font-800">¡No hay errores para repasar!</div>;
    }

    if (shuffledWords.length === 0) {
        return <div className="flex-center min-h-screen text-main font-800">Cargando...</div>;
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
