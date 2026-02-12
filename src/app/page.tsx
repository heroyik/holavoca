"use client";

import { useState } from 'react';
import { getUnits, getTotalWordCount } from '@/utils/vocab';
import Link from 'next/link';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import { useGamification } from '@/hooks/useGamification';
import vol1 from '../../public/vol1.jpg';
import vol2 from '../../public/vol2.jpg';
export default function Home() {
  const units = getUnits();
  const totalWords = getTotalWordCount();
  const { stats } = useGamification();
  const [selectedImage, setSelectedImage] = useState<StaticImageData | null>(null);

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
        flexDirection: 'column',
        alignItems: 'center'
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

        <div style={{
          width: '100%',
          maxWidth: '600px',
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--es-red)' }}>HolaVoca</h1>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div
              onClick={() => setSelectedImage(vol1)}
              style={{ width: '32px', height: '44px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <Image src={vol1} alt="Book 1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div
              onClick={() => setSelectedImage(vol2)}
              style={{ width: '32px', height: '44px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-light)', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <Image src={vol2} alt="Book 2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Stats Info */}
      <div style={{
        padding: '16px 20px',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '700' }}>Total XP: {stats.xp}</p>
      </div>


      {/* Learning Path (Snake UI) */}
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '24px 20px 140px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px', // height (160) + gap (40) = 200px centers
        position: 'relative'
      }}>
        {/* Connector SVG Background */}
        <svg style={{
          position: 'absolute',
          top: '68px', // Start exactly at the first circle center (24px padding + 44px half-circle)
          left: '50%',
          transform: 'translateX(-50%)',
          width: '240px',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          <path
            d={units.slice(0, 15).map((_, i) => {
              const x = 120 + (Math.sin(i * 1.2) * 60);
              const y = i * 200; // Adjusted for better alignment with larger gaps
              return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#e5e5e5"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {units.slice(0, 15).map((unit, index) => {
          // Snake pattern offsets
          const offset = Math.sin(index * 1.2) * 60;
          const isCompleted = stats.completedUnits.includes(unit.id);
          const isLocked = index > stats.completedUnits.length;
          const isCurrent = index === stats.completedUnits.length;

          // Gamification: Different badges/emojis based on level
          const getLevelTitle = (idx: number) => {
            if (idx < 5) return "PRINCIPIANTE"; // Beginner
            if (idx < 10) return "INTERMEDIO";   // Intermediate
            return "AVANZADO";                 // Advanced
          };

          const getUnitIcon = (idx: number) => {
            if (isLocked) return '🔒';
            if (isCompleted) return '✅';
            if (idx === 4 || idx === 9 || idx === 14) return '👑'; // Milestone
            return '⭐';
          };

          const getLevelColor = (idx: number) => {
            if (isLocked) return '#afafaf';
            if (idx < 5) return 'var(--es-red)';
            if (idx < 10) return '#3b82f6'; // Blue for Intermediate
            return 'var(--es-yellow)';      // Gold for Advanced
          };

          return (
            <div key={unit.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: `translateX(${offset}px)`,
              zIndex: 1,
              position: 'relative',
              height: '160px' // Fixed height for better line alignment
            }}>
              <Link
                href={isLocked ? '#' : `/quiz/${unit.id}`}
                onClick={(e) => isLocked && e.preventDefault()}
                style={{ textDecoration: 'none' }}
              >
                <button
                  className="flex-center"
                  style={{
                    width: '95px',
                    height: '88px',
                    backgroundColor: isLocked ? '#e5e5e5' : (isCurrent ? 'var(--es-red)' : (isCompleted ? 'var(--duo-green)' : 'var(--es-yellow)')),
                    borderRadius: '50%',
                    boxShadow: isLocked
                      ? '0 10px 0 #afafaf'
                      : (isCurrent ? '0 10px 0 #b91c1c' : (isCompleted ? '0 10px 0 #16a34a' : '0 10px 0 #d97706')),
                    color: 'white',
                    fontSize: '40px',
                    cursor: isLocked ? 'default' : 'pointer',
                    transition: 'all 0.1s',
                    position: 'relative',
                    border: 'none',
                    ...(isCurrent ? { animation: 'pulse-node 2s infinite ease-in-out' } : {})
                  }}
                >
                  {getUnitIcon(index)}

                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '-45px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--es-red)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '800',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    }}>
                      GET READY!
                      <div style={{
                        position: 'absolute',
                        bottom: '-8px',
                        left: '50%',
                        marginLeft: '-8px',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '8px solid var(--es-red)'
                      }} />
                    </div>
                  )}
                </button>
              </Link>

              <div style={{
                marginTop: '16px',
                textAlign: 'center',
                backgroundColor: 'white',
                padding: '6px 14px',
                borderRadius: '16px',
                border: `3px solid ${isLocked ? 'var(--border-light)' : getLevelColor(index)}`,
                boxShadow: `0 4px 0 ${isLocked ? '#e5e5e5' : 'rgba(0,0,0,0.1)'}`,
                minWidth: '110px'
              }}>
                <p style={{
                  fontWeight: '900',
                  fontSize: '11px',
                  color: getLevelColor(index),
                  letterSpacing: '0.5px',
                  marginBottom: '1px'
                }}>
                  {getLevelTitle(index)} {index + 1}
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: isLocked ? '#afafaf' : 'var(--text-main)'
                }}>
                  {unit.source}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes pulse-node {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>

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
        </div>
      </nav>

      {/* Lightbox / Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            cursor: 'zoom-out'
          }}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '350px',
            aspectRatio: '1/1.4',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backgroundColor: 'white'
          }}>
            <Image
              src={selectedImage}
              alt="Zoomed book"
              fill
              style={{ objectFit: 'contain', padding: '10px' }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
