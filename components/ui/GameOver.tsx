// ============================================================
// SHAIKH RACE — GameOver component
// Final stats + GSAP slide-up, deposits earned coins to wallet
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import { useGarageStore } from '@/store/garageStore';
import { leaderboardService } from '@/services/leaderboard';
import { gameService } from '@/services/game';
import styles from './GameOver.module.scss';

interface StatItemProps {
  label: string;
  value: string;
  accent?: boolean;
  gold?: boolean;
}

function StatItem({ label, value, accent, gold }: StatItemProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;
    gsap.from(rowRef.current, {
      x: -20,
      opacity: 0,
      duration: 0.4,
      delay: Math.random() * 0.3,
      ease: 'power2.out',
    });
  }, []);

  return (
    <div
      ref={rowRef}
      className={`${styles.statRow} ${accent ? styles.statAccent : ''} ${gold ? styles.statGold : ''}`}
    >
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
    </div>
  );
}

export default function GameOver() {
  const player      = useGameStore((s) => s.player);
  const highScore   = useGameStore((s) => s.highScore);
  const resetGame   = useGameStore((s) => s.resetGame);
  const startGame   = useGameStore((s) => s.startGame);
  const depositCoins = useGarageStore((s) => s.depositCoins);
  const getActiveCar = useGarageStore((s) => s.getActiveCar);
  const getEffectiveStats = useGarageStore((s) => s.getEffectiveStats);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef    = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const deposited  = useRef(false);
  const [globalRank, setGlobalRank] = React.useState<number | null>(null);

  // Submit score and sync stats on mount
  useEffect(() => {
    const syncData = async () => {
      try {
        const res = await leaderboardService.submitScore(
          player.distance,
          player.coins,
          'endless'
        );
        setGlobalRank(res.rank);

        // Sync XP and Coins to persistent backend profile
        await gameService.updateCoins(player.coins);
        await gameService.updateXP(Math.floor(player.distance * 0.1));
      } catch (err) {
        console.error('Failed to sync game data', err);
      }
    };
    syncData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Deposit coins once (local store backup)
  useEffect(() => {
    if (!deposited.current && player.coins > 0) {
      deposited.current = true;
      depositCoins(player.coins);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // GSAP slide-up entrance
  useEffect(() => {
    if (!overlayRef.current || !cardRef.current || !titleRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    tl.fromTo(
      cardRef.current,
      { y: 60, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' },
      '-=0.1'
    );
    tl.fromTo(
      titleRef.current,
      { letterSpacing: '0.05em', opacity: 0 },
      { letterSpacing: '0.25em', opacity: 1, duration: 0.4, ease: 'power3.out' },
      '-=0.2'
    );
  }, []);

  const handlePlayAgain = () => {
    const car   = getActiveCar();
    const stats = getEffectiveStats(car.id);
    startGame(stats.speed * 30 + 60, stats.health);
  };

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div ref={cardRef} className={styles.card}>
        {/* Title */}
        <h2 ref={titleRef} className={styles.title}>GAME OVER</h2>
        <div className={styles.titleUnderline} />

        {globalRank && (
          <p className={styles.newRecord} style={{ marginBottom: 15, fontSize: '0.9rem' }}>
            GLOBAL RANK: #{globalRank}
          </p>
        )}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <StatItem
            label="Score"
            value={player.score.toLocaleString()}
            accent
          />
          <StatItem
            label="Distance"
            value={`${(player.distance / 1000).toFixed(2)} km`}
          />
          <StatItem
            label="Coins Collected"
            value={`+${player.coins}`}
            gold
          />
          <StatItem
            label="Max Speed"
            value={`${Math.round(player.maxSpeed)} km/h`}
          />
          {highScore > 0 && (
            <StatItem
              label="Best Score"
              value={highScore.toLocaleString()}
              accent
            />
          )}
        </div>

        {/* New high-score banner */}
        {player.score >= highScore && highScore > 0 && (
          <div className={styles.newRecord}>
            🏆 NEW RECORD!
          </div>
        )}

        {/* Actions */}
        <div className={styles.actions}>
          <button
            id="btn-play-again"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handlePlayAgain}
            autoFocus
          >
            ▶ PLAY AGAIN
          </button>
          <button
            id="btn-to-menu"
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={resetGame}
          >
            ⌂ MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
