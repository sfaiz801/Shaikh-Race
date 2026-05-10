// ============================================================
// SHAIKH RACE — Garage Screen
// ============================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGarageStore } from '@/store/garageStore';
import { useGameStore } from '@/store/gameStore';
import styles from '@/styles/garage.module.scss';
import type { CarId } from '@/types/game';

const COLORS = [
  '#00f5ff', // Cyan
  '#ff00aa', // Magenta
  '#b3ff00', // Lime
  '#ff6b00', // Orange
  '#a855f7', // Purple
  '#ff2244', // Red
];

export default function GarageScreen() {
  const router = useRouter();
  const cars = useGarageStore((s) => s.cars);
  const activeCarId = useGarageStore((s) => s.activeCarId);
  const wallet = useGarageStore((s) => s.wallet);
  const selectCar = useGarageStore((s) => s.selectCar);
  const unlockCar = useGarageStore((s) => s.unlockCar);
  const upgradeCar = useGarageStore((s) => s.upgradeCar);
  const updateCarColor = useGarageStore((s) => s.updateCarColor);
  const getUpgrade = useGarageStore((s) => s.getUpgrade);
  const getEffectiveStats = useGarageStore((s) => s.getEffectiveStats);
  const playerXP = useGameStore((s) => s.player.xp);

  const [currentIndex, setCurrentIndex] = useState(
    cars.findIndex((c) => c.id === activeCarId) >= 0
      ? cars.findIndex((c) => c.id === activeCarId)
      : 0
  );

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : cars.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((i) => (i < cars.length - 1 ? i + 1 : 0));
  };

  const car = cars[currentIndex];
  const stats = getEffectiveStats(car.id);
  const upgrade = getUpgrade(car.id);
  const isSelected = activeCarId === car.id;
  const canUnlock = playerXP >= car.unlockXP && wallet >= car.upgradeCost * 10;
  const upgradeCost = upgrade.costPerLevel * (upgrade.level + 1);
  const canUpgrade = wallet >= upgradeCost && upgrade.level < upgrade.maxLevel;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/menu')}>
          ← BACK
        </button>
        <div className={styles.wallet}>
          ⬡ {wallet.toLocaleString()}
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.carCarousel}>
          <button className={styles.navArrow} onClick={handlePrev}>
            ◀
          </button>

          <div ref={cardRef} className={styles.carCard}>
            {!car.isUnlocked && (
              <div className={styles.lockedOverlay}>
                <div className={styles.lockIcon}>🔒</div>
                <div className={styles.lockText}>
                  REQUIRES {car.unlockXP} XP
                </div>
                <div style={{ color: '#fff', marginTop: 10, fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>
                  (You have {playerXP} XP)
                </div>
              </div>
            )}

            <h2 className={styles.carName}>{car.name}</h2>

            {/* 3D-style color swatch */}
            <div
              className={styles.carSwatch}
              style={{
                backgroundColor: car.color,
                boxShadow: `inset 0 0 40px rgba(0,0,0,0.5), 0 0 20px ${car.color}`,
              }}
            />

            {/* Stats */}
            <div className={styles.statsGrid}>
              {(['speed', 'nitro', 'brake', 'handling'] as const).map((stat) => (
                <div key={stat} className={styles.statRow}>
                  <span className={styles.statLabel}>{stat.toUpperCase()}</span>
                  <div className={styles.statBarBg}>
                    <div
                      className={styles.statBarFill}
                      style={{
                        width: `${(stats[stat] / 10) * 100}%`,
                        backgroundColor: car.color,
                        boxShadow: `0 0 10px ${car.color}`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Color Picker */}
            <div className={styles.colorPicker}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`${styles.colorDot} ${car.color === c ? styles.active : ''}`}
                  style={{ backgroundColor: c, color: c }}
                  onClick={() => car.isUnlocked && updateCarColor(car.id, c)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className={styles.actionButtons}>
              {car.isUnlocked ? (
                <>
                  <button
                    className={`${styles.btn} ${styles.btnSelect}`}
                    onClick={() => selectCar(car.id)}
                    disabled={isSelected}
                  >
                    {isSelected ? 'SELECTED ✓' : 'SELECT CAR'}
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnUpgrade}`}
                    onClick={() => upgradeCar(car.id)}
                    disabled={!canUpgrade || upgrade.level >= upgrade.maxLevel}
                  >
                    {upgrade.level >= upgrade.maxLevel
                      ? 'MAX LEVEL'
                      : `UPGRADE (⬡ ${upgradeCost})`}
                  </button>
                </>
              ) : (
                <button
                  className={`${styles.btn} ${styles.btnUnlock}`}
                  onClick={() => unlockCar(car.id)}
                  disabled={!canUnlock}
                >
                  UNLOCK (⬡ {car.upgradeCost * 10})
                </button>
              )}
            </div>
          </div>

          <button className={styles.navArrow} onClick={handleNext}>
            ▶
          </button>
        </div>
      </main>
    </div>
  );
}
