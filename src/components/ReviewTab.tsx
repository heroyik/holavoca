"use client";

import { useGamification } from "@/hooks/useGamification";
import vocabData from "@/data/vocab.json";
import { VocabEntry } from "@/utils/vocab";
import Link from "next/link";
import { Trash2, AlertCircle } from "lucide-react";

export default function ReviewTab() {
  const { stats, clearMistake, clearAllMistakes } = useGamification();
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
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '24px',
        border: '3px solid var(--border-light)',
        boxShadow: '0 8px 0 var(--border-light)',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', margin: 0 }}>Mis Errores</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '700', margin: '4px 0 0' }}>
              {missedEntries.length} {missedEntries.length === 1 ? 'palabra' : 'palabras'} para repasar
            </p>
          </div>
          <Link href={`/quiz/review`} style={{ textDecoration: 'none' }}>
            <button className="duo-button duo-button-primary" style={{ width: 'auto', padding: '10px 24px' }}>
              Repasar ahora
            </button>
          </Link>
        </div>

        <button 
          onClick={() => {
            if (confirm('¿Borrar toda la lista de repaso?')) {
              clearAllMistakes();
            }
          }}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#fff1f2',
            color: '#e11d48',
            border: '2px solid #fecdd3',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Trash2 size={16} /> Borrar todo
        </button>
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--es-red)' }}>{entry!["스페인어 단어"]}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)' }}>{entry!["한국어 의미"]}</div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              
              <button 
                onClick={() => clearMistake(entry!["스페인어 단어"])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  backgroundColor: 'var(--bg-soft)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#dc2626';
                  e.currentTarget.style.backgroundColor = '#fee2e2';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-soft)';
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
