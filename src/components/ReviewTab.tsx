"use client";

import { useGamification } from "@/hooks/useGamification";
import { useGlobalTop20 } from "@/hooks/useGlobalTop20";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import { Trash2, Brain, Globe, Trophy, RefreshCw } from "lucide-react";
import Link from "next/link";

// ── Medal colours for top 3 ───────────────────────────────────────────────────
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

// ── Helper: rank badge background ─────────────────────────────────────────────
function rankBg(rank: number) {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "#e5e7eb";
}
function rankColor(rank: number) {
  return rank <= 3 ? "#000" : "#374151";
}

export default function ReviewTab() {
  const { stats, removeMistake, clearAllMistakes } = useGamification();
  const { top20, loading: top20Loading, error: top20Error, refresh } = useGlobalTop20();

  const mistakes = stats.mistakes || {};
  const missedWordList = Object.keys(mistakes);
  const reviewEntries = (vocabData as VocabEntry[]).filter((v) =>
    missedWordList.includes(v["스페인어 단어"])
  );

  return (
    <div className="review-content">

      {/* ── Personal Tricky Words ──────────────────────────────────────────── */}
      {reviewEntries.length === 0 ? (
        <div className="flex-center min-h-60 flex-col gap-16">
          <div className="font-64">✨</div>
          <h2 className="text-title">All Clear!</h2>
          <p className="text-subtitle text-center px-20">
            You have no words pending for review. Keep it up!
          </p>
        </div>
      ) : (
        <div className="review-card-modern">
          <div className="review-header">
            <div className="review-header-icon">
              <Brain size={28} />
            </div>
            <h2 className="text-title m-0">Tricky Words</h2>
          </div>

          <div className="stat-container">
            <span className="stat-value">{reviewEntries.length}</span>
            <span className="stat-label">
              {reviewEntries.length === 1 ? "word" : "words"} need more practice
            </span>
          </div>

          <div className="review-actions">
            <Link href="/quiz/review" className="flex-1 no-underline">
              <button className="duo-button duo-button-primary button-standard w-full button-review-pulse">
                START REVIEW
              </button>
            </Link>
            <button
              onClick={() => clearAllMistakes()}
              className="icon-button-round"
              aria-label="Clear entire review list"
              title="Clear list"
              style={{ width: "48px", height: "48px" }}
            >
              <Trash2 size={24} />
            </button>
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
                    {mistakes[entry["스페인어 단어"]]}{" "}
                    {mistakes[entry["스페인어 단어"]] === 1 ? "error" : "errors"}
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
      )}

      {/* ── Global TOP 20 Hardest Words ─────────────────────────────────────── */}
      <div className="review-card-modern" style={{ marginTop: "24px" }}>
        <div className="review-header">
          <div className="review-header-icon" style={{ background: "linear-gradient(135deg,#f59e0b,#ef4444)" }}>
            <Globe size={24} color="#fff" />
          </div>
          <div className="flex-1">
            <h2 className="text-title m-0">Global TOP 20</h2>
            <p className="text-small" style={{ margin: 0, color: "#6b7280" }}>
              Most missed words by all learners
            </p>
          </div>
          <button
            onClick={refresh}
            className="icon-button-round"
            aria-label="Refresh global stats"
            title="Refresh"
            style={{ width: "36px", height: "36px" }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {top20Loading && (
          <div className="flex-center py-24" style={{ gap: "8px", color: "#9ca3af" }}>
            <span className="text-small">Loading global stats…</span>
          </div>
        )}

        {top20Error && (
          <div className="text-small text-center py-16" style={{ color: "#ef4444" }}>
            {top20Error}
          </div>
        )}

        {!top20Loading && !top20Error && top20.length === 0 && (
          <div className="text-small text-center py-16" style={{ color: "#9ca3af" }}>
            No global data yet. Be the first to practise!
          </div>
        )}

        {!top20Loading && top20.length > 0 && (
          <div className="mistake-list" style={{ marginTop: "12px" }}>
            {top20.map((entry, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={entry.word}
                  className="mistake-item flex-between"
                  style={{ alignItems: "center", gap: "12px" }}
                >
                  {/* Rank badge */}
                  <div
                    style={{
                      minWidth: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: rankBg(rank),
                      color: rankColor(rank),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: rank <= 3 ? "16px" : "13px",
                      flexShrink: 0,
                    }}
                  >
                    {rank <= 3 ? MEDAL[rank] : rank}
                  </div>

                  {/* Word info */}
                  <div className="flex-1">
                    <div className="text-subtitle text-es-red">{entry.word}</div>
                    <div className="text-small">{entry.meaning}</div>
                  </div>

                  {/* Fail count */}
                  <div
                    className="mistake-count"
                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Trophy size={12} />
                    {entry.totalCount}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
