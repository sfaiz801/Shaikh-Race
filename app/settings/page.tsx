// ============================================================
// SHAIKH RACE — Settings Screen
// ============================================================

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSettingsStore, GraphicsQuality } from '@/store/settingsStore';
import styles from '@/styles/settings.module.scss';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    musicOn,
    soundOn,
    graphicsQuality,
    toggleMusic,
    toggleSound,
    setGraphicsQuality,
  } = useSettingsStore();

  const handleQualityChange = (q: GraphicsQuality) => {
    setGraphicsQuality(q);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.push('/menu')}>
          ← BACK
        </button>
        <h1 className={styles.title}>SETTINGS</h1>
      </header>

      <main className={styles.content}>
        {/* Audio Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>AUDIO</h2>
          
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>🎵 Music</span>
            <button
              className={`${styles.toggleBtn} ${musicOn ? styles.active : ''}`}
              onClick={toggleMusic}
            >
              {musicOn ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>🔊 Sound Effects</span>
            <button
              className={`${styles.toggleBtn} ${soundOn ? styles.active : ''}`}
              onClick={toggleSound}
            >
              {soundOn ? 'ON' : 'OFF'}
            </button>
          </div>
        </section>

        {/* Graphics Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>GRAPHICS</h2>
          
          <div className={styles.settingRow}>
            <span className={styles.settingLabel}>Quality</span>
            <div className={styles.qualityGroup}>
              {(['Low', 'Medium', 'High'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  className={`${styles.qualityBtn} ${graphicsQuality === q ? styles.active : ''}`}
                  onClick={() => handleQualityChange(q)}
                >
                  {q.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Controls Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>CONTROLS</h2>
          
          <div className={styles.controlsList}>
            <div className={styles.controlItem}>
              <span className={styles.controlAction}>Accelerate</span>
              <span className={styles.controlKeys}>W / ↑</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlAction}>Brake / Reverse</span>
              <span className={styles.controlKeys}>S / ↓</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlAction}>Steer Left</span>
              <span className={styles.controlKeys}>A / ←</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlAction}>Steer Right</span>
              <span className={styles.controlKeys}>D / →</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlAction}>Nitro Boost</span>
              <span className={styles.controlKeys}>SHIFT</span>
            </div>
            <div className={styles.controlItem}>
              <span className={styles.controlAction}>Pause Game</span>
              <span className={styles.controlKeys}>ESC</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
