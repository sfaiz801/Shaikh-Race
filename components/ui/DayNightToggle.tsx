// ============================================================
// SHAIKH RACE — DayNightToggle Component
// ============================================================

'use client';

import React from 'react';
import { useGameStore } from '@/store/gameStore';
import styles from '@/styles/lighting.module.scss';

export default function DayNightToggle() {
  const dayNightMode = useGameStore((s) => s.dayNightMode);
  const toggleDayNightMode = useGameStore((s) => s.toggleDayNightMode);

  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggleBtn} ${styles.dayBtn} ${dayNightMode === 'day' ? styles.active : ''}`}
        onClick={() => { if (dayNightMode !== 'day') toggleDayNightMode(); }}
        title="Day Mode"
      >
        ☀
      </button>
      <button
        className={`${styles.toggleBtn} ${styles.nightBtn} ${dayNightMode === 'night' ? styles.active : ''}`}
        onClick={() => { if (dayNightMode !== 'night') toggleDayNightMode(); }}
        title="Night Mode"
      >
        ☾
      </button>
    </div>
  );
}
