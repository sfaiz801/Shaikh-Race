// ============================================================
// SHAIKH RACE — Leaderboard Screen
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import styles from '@/styles/leaderboard.module.scss';

// Mock data for Phase 2
const MOCK_LEADERBOARD = [
  { id: 'u1', username: 'NeonRider', distance: 125.4, coins: 840, score: 25400 },
  { id: 'u2', username: 'SpeedDemon99', distance: 110.2, coins: 720, score: 22100 },
  { id: 'u3', username: 'CyberDrift', distance: 95.8, coins: 650, score: 18900 },
  { id: 'u4', username: 'TurboTurtle', distance: 88.5, coins: 500, score: 16500 },
  { id: 'u5', username: 'PixelRacer', distance: 82.1, coins: 480, score: 15200 },
  { id: 'u6', username: 'GhostDriver', distance: 75.0, coins: 410, score: 13800 },
  { id: 'u7', username: 'NightHawk', distance: 68.3, coins: 350, score: 12100 },
  { id: 'u8', username: 'ApexPredator', distance: 62.9, coins: 310, score: 10500 },
  { id: 'u9', username: 'RetroVibe', distance: 55.4, coins: 280, score: 9200 },
  { id: 'u10', username: 'Newbie123', distance: 40.2, coins: 150, score: 5400 },
];

export default function LeaderboardScreen() {
  const router = useRouter();
  const highScore = useGameStore((s) => s.highScore);
  const rowsRef = useRef<(HTMLTableRowElement | null)[]>([]);

  useEffect(() => {
    // GSAP stagger fade-in for rows
    gsap.fromTo(
      rowsRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }, []);

  // Determine where the user fits in the mock data
  const userScore = highScore;
  let userRank = 11;
  for (let i = 0; i < MOCK_LEADERBOARD.length; i++) {
    if (userScore > MOCK_LEADERBOARD[i].score) {
      userRank = i + 1;
      break;
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/menu')}>
          ← BACK
        </button>
        <h1 className={styles.title}>LEADERBOARD</h1>
      </header>

      <main className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Rank</th>
              <th className={styles.th}>Driver</th>
              <th className={`${styles.th} ${styles.hideMobile}`}>Distance (km)</th>
              <th className={`${styles.th} ${styles.hideMobile}`}>Coins</th>
              <th className={styles.th}>Score</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADERBOARD.map((entry, index) => {
              const rank = index + 1;
              let rankClass = '';
              if (rank === 1) rankClass = styles.rank1;
              if (rank === 2) rankClass = styles.rank2;
              if (rank === 3) rankClass = styles.rank3;

              // Insert user row if they beat this score and we haven't shown them yet
              const showUserHere = userRank === rank;

              return (
                <React.Fragment key={entry.id}>
                  {showUserHere && (
                    <tr
                      ref={(el) => { rowsRef.current.push(el); }}
                      className={`${styles.row} ${styles.currentUserRow}`}
                    >
                      <td className={styles.td}>#{userRank}</td>
                      <td className={styles.td}>YOU</td>
                      <td className={`${styles.td} ${styles.hideMobile}`}>--</td>
                      <td className={`${styles.td} ${styles.hideMobile}`}>--</td>
                      <td className={styles.td}>{userScore.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr
                    ref={(el) => { rowsRef.current.push(el); }}
                    className={styles.row}
                  >
                    <td className={`${styles.td} ${rankClass}`}>#{rank}</td>
                    <td className={styles.td}>{entry.username}</td>
                    <td className={`${styles.td} ${styles.hideMobile}`}>{entry.distance.toFixed(1)}</td>
                    <td className={`${styles.td} ${styles.hideMobile}`}>{entry.coins}</td>
                    <td className={styles.td}>{entry.score.toLocaleString()}</td>
                  </tr>
                </React.Fragment>
              );
            })}
            
            {/* If user rank is below top 10, show at bottom */}
            {userRank > 10 && userScore > 0 && (
              <tr
                ref={(el) => { rowsRef.current.push(el); }}
                className={`${styles.row} ${styles.currentUserRow}`}
                style={{ marginTop: '20px' }}
              >
                <td className={styles.td}>#{userRank}+</td>
                <td className={styles.td}>YOU</td>
                <td className={`${styles.td} ${styles.hideMobile}`}>--</td>
                <td className={`${styles.td} ${styles.hideMobile}`}>--</td>
                <td className={styles.td}>{userScore.toLocaleString()}</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
}
