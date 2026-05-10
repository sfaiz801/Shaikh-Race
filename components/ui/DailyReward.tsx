// ============================================================
// SHAIKH RACE — Daily Reward Popup
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { gameService } from '@/services/game';
import styles from './DailyReward.module.scss';

interface Props {
  onClaim: (reward: number) => void;
  onClose: () => void;
  streak: number;
}

export default function DailyReward({ onClaim, onClose, streak }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current) {
      gsap.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        y: -10,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'power1.inOut'
      });
    }
  }, []);

  const handleClaim = async () => {
    try {
      const res = await gameService.claimDailyReward();
      if (!res.already_claimed) {
        onClaim(res.reward);
      }
      onClose();
    } catch (err) {
      console.error(err);
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div ref={modalRef} className={styles.modal}>
        <div ref={iconRef} className={styles.coinIcon}>🪙</div>
        <h2 className={styles.title}>DAILY REWARD!</h2>
        <p className={styles.streak}>STREAK: {streak} DAYS</p>
        <p className={styles.message}>Claim your daily bonus of 50 coins!</p>
        <button className={styles.claimBtn} onClick={handleClaim}>
          CLAIM 50 COINS
        </button>
      </div>
    </div>
  );
}
