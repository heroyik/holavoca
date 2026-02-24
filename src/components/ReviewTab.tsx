"use client";

import { useGamification } from "@/hooks/useGamification";
import { useGlobalTop20 } from "@/hooks/useGlobalTop20";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import { Trash2, Brain, Frown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import vol1 from "../../public/vol1.jpg";
import vol2 from "../../public/vol2.jpg";

export default function ReviewTab() {
  const { stats, removeMistake, clearAllMistakes } = useGamification();
  const { top20, loading: top20Loading, error: top20Error } = useGlobalTop20();

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

      {/* ── Wall of Pain ──────────────────────────────────────────────────── */}
      <div className="review-card-modern" style={{ marginTop: "24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h2 className="text-title m-0" style={{ letterSpacing: "-0.5px" }}>
            Wall of Pain
          </h2>
          <span style={{ fontSize: "22px", lineHeight: 1 }}>😤</span>
        </div>
        <p className="text-small" style={{ margin: "0 0 16px", color: "#9ca3af" }}>
          words everyone&#39;s fumbling rn
        </p>

        {top20Loading && (
          <div className="flex-center py-24" style={{ color: "#9ca3af" }}>
            <span className="text-small">Loading…</span>
          </div>
        )}

        {top20Error && (
          <div className="text-small text-center py-16" style={{ color: "#ef4444" }}>
            {top20Error}
          </div>
        )}

        {!top20Loading && !top20Error && top20.length === 0 && (
          <div className="text-small text-center py-16" style={{ color: "#9ca3af" }}>
            No global data yet.
          </div>
        )}

        {!top20Loading && top20.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {top20.map((entry, idx) => {
              const rank = idx + 1;
              const bookImg = entry.book === "2" ? vol2 : vol1;
              return (
                <Link
                  key={entry.word}
                  href={`/quiz/${entry.unitId}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "#fafafa",
                      border: "1px solid #f0f0f0",
                      borderRadius: "12px",
                      padding: "9px 12px",
                      transition: "background 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#fafafa")}
                  >
                    {/* ── Row 1: rank · book img · word · fail count ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Rank circle */}
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: rank <= 3 ? "#fef3c7" : "#f3f4f6",
                          color: rank <= 3 ? "#92400e" : "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "11px",
                          flexShrink: 0,
                        }}
                      >
                        {rank}
                      </div>

                      {/* Book thumbnail — small */}
                      <Image
                        src={bookImg}
                        alt={`Vol.${entry.book}`}
                        width={20}
                        height={27}
                        style={{
                          objectFit: "cover",
                          borderRadius: "3px",
                          flexShrink: 0,
                          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
                        }}
                      />

                      {/* Spanish word — full, wraps if very long */}
                      <div
                        style={{
                          flex: 1,
                          fontWeight: 700,
                          fontSize: "15px",
                          color: "#dc2626",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                          minWidth: 0,
                        }}
                      >
                        {entry.word}
                      </div>

                      {/* Fail count badge */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                          flexShrink: 0,
                          background: "#fee2e2",
                          color: "#dc2626",
                          borderRadius: "8px",
                          padding: "3px 8px",
                          fontSize: "13px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Frown size={11} />
                        {entry.totalCount}
                      </div>
                    </div>

                    {/* ── Row 2: meaning · unit badge ── */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "5px",
                        paddingLeft: "32px", /* align with word above */
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#6b7280", flex: 1 }}>
                        {entry.meaning}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#7c3aed",
                          background: "#ede9fe",
                          borderRadius: "6px",
                          padding: "2px 6px",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        Unit {entry.unitNum}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
