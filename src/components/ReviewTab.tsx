"use client";

import { useGamification } from "@/hooks/useGamification";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import { Trash2 } from "lucide-react";
import Link from "next/link";

export default function ReviewTab() {
  const { stats, removeMistake, clearAllMistakes } = useGamification();
  const mistakes = stats.mistakes || {};
  const missedWordList = Object.keys(mistakes);

  if (missedWordList.length === 0) {
    return (
      <div className="flex-center min-h-60 flex-col gap-16">
        <div className="font-64">✨</div>
        <h2 className="text-title">¡Todo despejado!</h2>
        <p className="text-subtitle text-center px-20">
          No tienes palabras pendientes de repaso. ¡Sigue así!
        </p>
      </div>
    );
  }

  // Get full entries
  const reviewEntries = (vocabData as VocabEntry[]).filter(v =>
    missedWordList.includes(v["스페인어 단어"])
  );

  return (
    <div className="review-content">
      <div className="review-card flex-between">
        <div className="flex-1">
          <h2 className="text-title m-0">Mis Errores</h2>
          <p className="text-small mt-4">
            Tienes <span className="text-error">{reviewEntries.length}</span> {reviewEntries.length === 1 ? 'palabra' : 'palabras'} por repasar
          </p>
        </div>
        <div className="flex-center flex-gap-12">
          <Link href={`/quiz/review`} className="no-underline">
            <button className="duo-button duo-button-primary button-standard">
              REPASAR
            </button>
          </Link>
          <button
            onClick={() => clearAllMistakes()}
            className="button-danger-outline"
            aria-label="Borrar toda la lista de repaso"
          >
            <Trash2 size={16} /> Borrar todo
          </button>
        </div>
      </div>

      <div className="mistake-list">
        {reviewEntries.map((entry) => (
          <div key={entry["스페인어 단어"]} className="mistake-item flex-between">
            <div className="flex-1">
              <div className="text-subtitle text-es-red">{entry["스페인어 단어"]}</div>
              <div className="text-small">{entry["한국어 의미"]}</div>
            </div>
            <div className="flex-center gap-12">
              <div className="mistake-count">
                {mistakes[entry["스페인어 단어"]]} {mistakes[entry["스페인어 단어"]] === 1 ? 'error' : 'errores'}
              </div>
              <button
                onClick={() => removeMistake(entry["스페인어 단어"])}
                className="trash-button"
                aria-label={`Eliminar ${entry["스페인어 단어"]} de la lista de repaso`}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
