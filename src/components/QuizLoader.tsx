"use client";

import { useSearchParams } from "next/navigation";
import { getUnits } from "@/utils/vocab";
import Quiz from "./Quiz";

interface QuizLoaderProps {
    unitId: string;
}

export default function QuizLoader({ unitId }: QuizLoaderProps) {
    const searchParams = useSearchParams();
    const sourcesStr = searchParams.get("sources");
    const sources = sourcesStr ? sourcesStr.split(",") : ["1"];

    const units = getUnits(sources);
    const unit = units.find((u) => u.id === unitId);

    if (!unit) {
        // In a client component, we should handle this gracefully 
        // but notFound() works if wrapped in suspense or handled by Next.js
        return <div className="flex-center" style={{ height: '100vh' }}>Unit not found or loading...</div>;
    }

    return <Quiz unitId={unit.id} unitWords={unit.words} unitTitle={unit.title} sources={sources} />;
}
