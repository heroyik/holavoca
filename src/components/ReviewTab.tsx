"use client";

import { useGamification } from "@/hooks/useGamification";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import Link from "next/link";

export default function ReviewTab() {
  const { stats } = useGamification();
  const mistakes = stats.mistakes || {};
  const missedWordList = Object.keys(mistakes);

  if (missedWordList.length === 0) {
    return (
      <div className="flex-center" style={{ flexDirection: 'column', gap: '20px', padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px' }}>✨</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800' }}>¡Todo despejado!</h2>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>No tienes palabras pendientes de repaso. ¡Sigue así!</p>
      </div>
    );
  }

  // Map mistake keys to actual vocab entries
  const missedEntries = missedWordList.map(spanishWord => {
    const entry = (vocabData as VocabEntry[]).find(v => v["스페인어 단어"] === spanishWord);
    return {
      entry,
      count: mistakes[spanishWord]
    };
  }).filter(item => item.entry !== undefined)
    .sort((a, b) => b.count - a.count); // Show most mistakes first

  return (
    <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '24px',
        border: '3px solid var(--border-light)',
        boxShadow: '0 8px 0 var(--border-light)'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Mis Errores</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '700', margin: '4px 0 0' }}>
            {missedEntries.length} palabras para repasar
          </p>
        </div>
        <Link href={`/quiz/review`} style={{ textDecoration: 'none' }}>
          <button className="duo-button duo-button-primary" style={{ width: 'auto', padding: '10px 24px' }}>
            Repasar ahora
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {missedEntries.map(({ entry, count }) => (
          <div key={entry!["스페인어 단어"]} style={{
            backgroundColor: 'white',
            padding: '16px 20px',
            borderRadius: '16px',
            border: '2px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transition: 'transform 0.1s'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--es-red)' }}>{entry!["스페인어 단어"]}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>{entry!["한국어 의미"]}</div>
            </div>
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: '800',
              border: '1px solid #fecaca'
            }}>
              {count} {count === 1 ? 'error' : 'errores'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
