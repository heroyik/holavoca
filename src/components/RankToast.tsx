"use client";

import { useEffect, useRef } from "react";

interface RankToastProps {
  rank: number | null;
  rankDelta: number | null; // how many spots improved
  onDismiss: () => void;
}

/**
 * Floating slide-up toast that appears when rank improves after a quiz.
 * Auto-dismisses after 4 seconds.
 */
export default function RankToast({ rank, rankDelta, onDismiss }: RankToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = rankDelta !== null && rankDelta > 0;

  useEffect(() => {
    if (!visible) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss]);

  if (!visible || rank === null) return null;

  const isFirst = rank === 1;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        animation: "rankToastSlideUp 0.35s ease",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: isFirst
            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
            : "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          borderRadius: "16px",
          padding: "12px 20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          fontSize: "14px",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "22px" }}>{isFirst ? "🥇" : "🎉"}</span>
        {isFirst
          ? `You're #1! Keep it up!`
          : `You moved up to #${rank}! (+${rankDelta} spots)`}
      </div>
      <style>{`
        @keyframes rankToastSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
