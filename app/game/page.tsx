'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useGarageStore } from '@/store/garageStore';
import HUD from '@/components/game/HUD';
import PauseMenu from '@/components/ui/PauseMenu';
import GameOver from '@/components/ui/GameOver';

// Load the heavy 3D canvas client-side only
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'fixed', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-void)', gap: 20,
      }}
    >
      <div
        style={{
          width: 48, height: 48,
          border: '3px solid rgba(0,245,255,0.15)',
          borderTopColor: 'var(--neon-cyan)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: 'var(--text-secondary)',
        }}
      >
        Loading Race Engine…
      </p>
    </div>
  ),
});

export default function GamePage() {
  const phase       = useGameStore((s) => s.phase);
  const startGame   = useGameStore((s) => s.startGame);
  const pauseGame   = useGameStore((s) => s.pauseGame);
  const resumeGame  = useGameStore((s) => s.resumeGame);
  const resetGame   = useGameStore((s) => s.resetGame);

  // Boot directly into playing when this route is loaded
  useEffect(() => {
    if (phase === 'menu') {
      const car   = useGarageStore.getState().getActiveCar();
      const stats = useGarageStore.getState().getEffectiveStats(car.id);
      startGame(stats.speed * 30 + 60, stats.health);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC key — pause / resume
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Escape') return;
      const p = useGameStore.getState().phase;
      if (p === 'playing') pauseGame();
      else if (p === 'paused') resumeGame();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pauseGame, resumeGame]);

  return (
    <main
      id="game-page"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--bg-void)' }}
    >
      {/* 3D canvas — always present during play/pause */}
      {(phase === 'playing' || phase === 'paused') && (
        <>
          <GameCanvas />
          <HUD />
        </>
      )}

      {/* Pause overlay — rendered on top of canvas */}
      {phase === 'paused' && <PauseMenu />}

      {/* Game Over screen */}
      {phase === 'game-over' && <GameOver />}
    </main>
  );
}
