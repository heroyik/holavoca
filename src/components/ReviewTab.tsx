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
        <h2 className="text-title">All Clear!</h2>
        <p className="text-subtitle text-center px-20">
          You have no words pending for review. Keep it up!
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
          <h2 className="text-title m-0">My Mistakes</h2>
          <p className="text-small mt-4">
            You have <span className="text-error">{reviewEntries.length}</span> {reviewEntries.length === 1 ? 'word' : 'words'} to review
          </p>
        </div>
        <div className="flex-center flex-gap-12">
          <Link href={`/quiz/review`} className="no-underline">
            <button className="duo-button duo-button-primary button-standard">
              REVIEW NOW
            </button>
          </Link>
          <button
            onClick={() => clearAllMistakes()}
            className="button-danger-outline"
            aria-label="Clear entire review list"
          >
            <Trash2 size={16} /> Clear all
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
                {mistakes[entry["스페인어 단어"]]} {mistakes[entry["스페인어 단어"]] === 1 ? 'error' : 'errors'}
              </div>
              <button
                onClick={() => removeMistake(entry["스페인어 단어"])}
                className="trash-button"
                aria-label={`Remove ${entry["스페인어 단어"]} from review list`}
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
