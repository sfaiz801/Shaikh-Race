// ============================================================
// SHAIKH RACE — PauseMenu component
// Semi-transparent overlay with GSAP fade-in animation.
// Buttons: Resume · Restart · Main Menu
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import { useGarageStore } from '@/store/garageStore';
import styles from './PauseMenu.module.scss';

export default function PauseMenu() {
  const phase     = useGameStore((s) => s.phase);
  const resumeGame = useGameStore((s) => s.resumeGame);
  const startGame  = useGameStore((s) => s.startGame);
  const resetGame  = useGameStore((s) => s.resetGame);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);

  // GSAP fade-in on mount
  useEffect(() => {
    if (!overlayRef.current || !cardRef.current) return;
    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
    tl.fromTo(
      cardRef.current,
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.4)' },
      '-=0.1'
    );
  }, []);

  if (phase !== 'paused') return null;

  const handleRestart = () => {
    const car   = useGarageStore.getState().getActiveCar();
    const stats = useGarageStore.getState().getEffectiveStats(car.id);
    startGame(stats.speed * 30 + 60, stats.health);
  };

  return (
    <div ref={overlayRef} className={styles.overlay} aria-modal="true" role="dialog" aria-label="Game Paused">
      <div ref={cardRef} className={styles.card}>
        <div className={styles.pauseIcon}>⏸</div>
        <h2 className={styles.title}>PAUSED</h2>
        <div className={styles.divider} />

        <div className={styles.buttons}>
          <button
            id="btn-resume"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={resumeGame}
            autoFocus
          >
            ▶ RESUME
          </button>
          <button
            id="btn-restart"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleRestart}
          >
            ↺ RESTART
          </button>
          <button
            id="btn-main-menu"
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={resetGame}
          >
            ⌂ MAIN MENU
          </button>
        </div>

        <p className={styles.hint}>Press ESC to resume</p>
      </div>
    </div>
  );
}
