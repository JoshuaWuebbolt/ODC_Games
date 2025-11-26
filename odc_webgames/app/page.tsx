'use client'
import React from 'react'
import type { JSX } from 'react'
import { useRouter } from 'next/navigation'

// app/page.tsx

const Button: React.FC<{ label: string; onClick: () => void; children: React.ReactNode; style?: React.CSSProperties }> = ({ label, onClick, children, style }) => (
  <button
    onClick={onClick}
    aria-label={label}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      background: '#fff',
      border: '1px solid #e0e0e0',
      borderRadius: 14,
      padding: 12,
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      width: '100%',
      height: 92,
      touchAction: 'manipulation',
      cursor: 'pointer',
      ...style,
    }}
  >
    {children}
  </button>
)

const IconPuzzle = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <rect x="3" y="3" width="8" height="8" rx="1.5" fill="#FFB86C"/>
    <rect x="13" y="3" width="8" height="8" rx="1.5" fill="#8DE4A2"/>
    <rect x="3" y="13" width="8" height="8" rx="1.5" fill="#9AD0FF"/>
    <rect x="13" y="13" width="8" height="8" rx="1.5" fill="#D2B3FF"/>
  </svg>
)

const IconMemory = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <circle cx="7" cy="7" r="3.2" fill="#FFD66B" />
    <circle cx="17" cy="7" r="3.2" fill="#6FD3FF" />
    <circle cx="7" cy="17" r="3.2" fill="#A9FFB8" />
    <circle cx="17" cy="17" r="3.2" fill="#D6B3FF" />
  </svg>
)

const IconMath = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <rect x="4" y="4" width="16" height="16" rx="3" fill="#FFF1C7" />
    <path d="M9 8h6M9 12h6M9 16h6" stroke="#B06AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconWords = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#E6F7FF"/>
    <path d="M7 9h10M7 13h7" stroke="#2B8CF0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const IconShapes = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <polygon points="6,17 10,7 14,17" fill="#FFB7C2"/>
    <circle cx="18.5" cy="8.5" r="2.2" fill="#B9F0D3"/>
    <rect x="3" y="3" width="3.5" height="3.5" rx="0.7" fill="#FCE6A8"/>
  </svg>
)

export default function Page(): JSX.Element {
  const router = useRouter()
  const handleClick = (game: string) => {
    console.log('Selected game:', game)
    // navigate or open the selected game here
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 16px',
        background: '#f7f9fc',
        boxSizing: 'border-box',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      {/* header: title + subtitle */}
      <header style={{ textAlign: 'center', marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>
          WallPlay: Learn While You Wait
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280' }}>
          Pick a game to start learning
        </p>
      </header>

      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {/* Row 1: one centered */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '72%' }}>
            <Button label="Do's and Don'ts" onClick={() => { router.push('/dos-and-donts') }} style={{ background: '#ffd6d6' }}>
              <IconPuzzle />
              <span style={{ fontSize: 16, color: '#111827' }}>Dos and Don'ts</span>
            </Button>
          </div>
        </div>

        {/* Row 2: two side by side */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Button label="XTool S1" onClick={() => { router.push('/s1') }} style={{ background: '#d9f4cd' }}>
              <IconMemory />
              <span style={{ fontSize: 16, color: '#111827' }}>Lazer Cutter</span>
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button label="3D Printer" onClick={() => { router.push('/3d-printer') }} style={{ background: '#fff3c2' }}>
              <IconMath />
              <span style={{ fontSize: 16, color: '#111827' }}>3D Printer</span>
            </Button>
          </div>
        </div>

        {/* Row 3: two side by side */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <Button label="Cricut" onClick={() => { router.push('/cricut') }} style={{ background: '#c2cdff' }}>
              <IconWords />
              <span style={{ fontSize: 16, color: '#111827' }}>Cricut</span>
            </Button>
          </div>
          <div style={{ flex: 1 }}>
            <Button label="Thread it right" onClick={() => { router.push('/sewing') }} style={{ background: '#e2cbf6' }}>
              <IconShapes />
              <span style={{ fontSize: 16, color: '#111827' }}>Thread it right</span>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}