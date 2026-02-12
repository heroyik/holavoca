"use client";

import { getUnits, getTotalWordCount } from '@/utils/vocab';
import Link from 'next/link';
import { useGamification } from '@/hooks/useGamification';
export default function Home() {
  const units = getUnits();
  const totalWords = getTotalWordCount();
  const { stats } = useGamification();

  return (
    <main className="container" style={{ minHeight: '100vh', backgroundColor: 'var(--bg-soft)' }}>
      {/* Premium Header/Stats Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'white',
        borderBottom: '2px solid var(--border-light)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          <div style={{ flex: 1, height: '14px', backgroundColor: '#e5e5e5', borderRadius: '7px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min((stats.xp % 100), 100)}%`,
              height: '100%',
              backgroundColor: 'var(--duo-green)',
              transition: 'width 0.5s'
            }} />
          </div>
          <div style={{ display: 'flex', gap: '12px', fontWeight: '700', fontSize: '18px' }}>
            <span style={{ color: 'var(--duo-orange)' }}>🔥 {stats.streak}</span>
            <span style={{ color: 'var(--duo-blue)' }}>💎 {stats.gems}</span>
          </div>
        </div>
      </header>

      {/* Hero / Course Title */}
      <div style={{
        padding: '32px 20px',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, white, var(--bg-soft))'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', color: 'var(--es-red)' }}>HolaVoca</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Total XP: {stats.xp}</p>
      </div>

      {/* Studying From Section */}
      <section style={{
        padding: '0 20px 32px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{
          fontSize: '14px',
          fontWeight: '800',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '20px'
        }}>
          Currently Studying From
        </h2>
        <div style={{
          display: 'flex',
          gap: '24px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '140px'
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1/1.4',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-light)',
              transition: 'transform 0.3s'
            }}>
              <img
                src="/vol1.jpg"
                alt="¡Hola, español! 1"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
              ¡Hola, español! 1
            </p>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            width: '140px'
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1/1.4',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              border: '1px solid var(--border-light)',
              transition: 'transform 0.3s'
            }}>
              <img
                src="/vol2.jpg"
                alt="¡Hola, español! 2"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)', textAlign: 'center' }}>
              ¡Hola, español! 2
            </p>
          </div>
        </div>
      </section>

      {/* Learning Path */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '48px',
        padding: '24px 0 120px 0'
      }}>
        {units.slice(0, 15).map((unit, index) => {
          const offset = Math.sin(index * 1.2) * 45;
          const isCompleted = stats.completedUnits.includes(unit.id);
          const isLocked = index > stats.completedUnits.length;

          return (
            <div key={unit.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `translateX(${offset}px)`
            }}>
              <Link href={isLocked ? '#' : `/quiz/${unit.id}`}>
                <button
                  className="flex-center"
                  style={{
                    width: '80px',
                    height: '74px',
                    backgroundColor: isLocked ? '#e5e5e5' : (isCompleted ? 'var(--es-yellow)' : 'var(--es-red)'),
                    borderRadius: '50%',
                    boxShadow: `0 8px 0 ${isLocked ? '#afafaf' : (isCompleted ? 'var(--es-yellow-dark)' : 'var(--es-red-dark)')}`,
                    color: 'white',
                    fontSize: '32px',
                    cursor: isLocked ? 'default' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {isLocked ? '🔒' : (isCompleted ? '✓' : '★')}
                </button>
              </Link>
              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                backgroundColor: 'white',
                padding: '4px 12px',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)',
                border: '2px solid var(--border-light)'
              }}>
                <p style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  {unit.title}
                </p>
                <p style={{ fontSize: '14px', fontWeight: '700' }}>{unit.source}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Nav */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '2px solid var(--border-light)',
        height: '70px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'var(--safe-area-inset-bottom)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--duo-blue)' }}>
          <span style={{ fontSize: '24px' }}>🏠</span>
          <span style={{ fontSize: '10px', fontWeight: '800' }}>LEARN</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <span style={{ fontSize: '24px' }}>🏆</span>
          <span style={{ fontSize: '10px', fontWeight: '800' }}>LEADER</span>
        </div>
        <div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}
        >
          <span style={{ fontSize: '24px' }}>👤</span>
          <span style={{ fontSize: '10px', fontWeight: '800' }}>PROFILE</span>
        </div>
        <div style={{ position: 'absolute', bottom: '70px', left: 0, right: 0, textAlign: 'center', padding: '10px', fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-soft)', borderTop: '1px solid var(--border-light)' }}>
          Total Spanish Words: <strong>{totalWords.toLocaleString()}</strong>
          {totalWords < 1000 && <span style={{ marginLeft: '8px', color: 'var(--es-red)', fontSize: '10px' }}>(Partial Data Loaded)</span>}
        </div>
      </nav>
    </main>
  );
}
