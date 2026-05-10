// ============================================================
// SHAIKH RACE — Main Menu
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import DailyReward from '@/components/ui/DailyReward';
import { gameService } from '@/services/game';
import styles from '@/styles/menu.module.scss';

export default function MainMenu() {
  const router = useRouter();
  const setPhase = useGameStore((s) => s.setPhase);
  const btnsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const [showReward, setShowReward] = React.useState(false);
  const [rewardData, setRewardData] = React.useState({ reward: 0, streak: 0 });

  useEffect(() => {
    // Check for daily reward
    const checkReward = async () => {
      try {
        const res = await gameService.claimDailyReward();
        if (!res.already_claimed) {
          setRewardData({ reward: res.reward, streak: res.streak });
          setShowReward(true);
        }
      } catch (err) {
        console.error('Auth required for rewards', err);
      }
    };
    checkReward();

    // Stagger slide in for buttons
    gsap.fromTo(
      btnsRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.2)' }
    );
  }, []);

  const handlePlay = () => {
    setPhase('menu'); // Ensure gameStore is in menu phase before routing
    router.push('/game');
  };

  return (
    <div className={styles.container}>
      <div className={styles.backgroundScroller} />

      <div className={styles.content}>
        <h1 className={styles.logo}>SHAIKH<br />RACE</h1>

        <div className={styles.buttonGroup}>
          <button
            ref={(el) => { btnsRef.current[0] = el; }}
            className={`${styles.btn} ${styles.btnPlay}`}
            onClick={handlePlay}
          >
            ▶ PLAY
          </button>
          
          <button
            ref={(el) => { btnsRef.current[1] = el; }}
            className={styles.btn}
            onClick={() => router.push('/garage')}
          >
            🔧 GARAGE
          </button>
          
          <button
            ref={(el) => { btnsRef.current[2] = el; }}
            className={styles.btn}
            onClick={() => router.push('/leaderboard')}
          >
            🏆 LEADERBOARD
          </button>
          
          <button
            ref={(el) => { btnsRef.current[3] = el; }}
            className={styles.btn}
            onClick={() => router.push('/settings')}
          >
            ⚙ SETTINGS
          </button>
        </div>
      </div>

      {showReward && (
        <DailyReward 
          streak={rewardData.streak} 
          onClose={() => setShowReward(false)} 
          onClaim={(r) => {
            // Optionally show a "coins added" toast here
            console.log(`Claimed ${r} coins!`);
          }} 
        />
      )}
    </div>
  );
}
