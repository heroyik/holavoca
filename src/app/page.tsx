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
