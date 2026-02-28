"use client";

import { useSearchParams } from "next/navigation";
import { getUnits } from "@/utils/vocab";
import Quiz from "./Quiz";
import { useGamification } from "@/hooks/useGamification";

interface QuizLoaderProps {
    unitId: string;
}

export default function QuizLoader({ unitId }: QuizLoaderProps) {
    const searchParams = useSearchParams();
    const { stats } = useGamification();
    const excludeEasyWords = stats?.settings?.excludeEasyWords ?? false;

    const sourcesStr = searchParams.get("sources");
    const mode = searchParams.get("mode");
    const sources = sourcesStr ? sourcesStr.split(",") : ["1"];

    const units = getUnits(sources, excludeEasyWords);
    const unit = units.find((u) => u.id === unitId);

    if (!unit) {
        return <div className="flex-center" style={{ height: '100vh' }}>Unit not found or loading...</div>;
    }

    const isReviewMode = mode === 'review';
    let unitWords = unit.words;

    if (isReviewMode && stats.mistakes) {
        // Filter words that are in the mistakes list
        unitWords = unit.words.filter(word => {
            const normalized = word["스페인어 단어"].toLowerCase().trim();
            return !!stats.mistakes[normalized];
        });

        // Fallback: If no mistakes found (e.g. they were cleared elsewhere), show all words or handle gracefully
        if (unitWords.length === 0) {
            return (
                <div className="flex-center flex-col gap-16" style={{ height: '100vh' }}>
                    <div className="font-64">✨</div>
                    <h2 className="text-title">All Caught Up!</h2>
                    <p className="text-subtitle text-center px-20">You have no mistakes to review in this unit.</p>
                    <button onClick={() => window.location.href = '/'} className="duo-button duo-button-primary w-auto px-40">GO BACK</button>
                </div>
            );
        }
    }

    return <Quiz unitId={unit.id} unitWords={unitWords} unitTitle={unit.title} sources={sources} isReview={isReviewMode} />;
}
