// ============================================================
// SHAIKH RACE — HUD Component
// Displays: Speed, Coins, Nitro bar, Health bar, Distance
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import DayNightToggle from '@/components/ui/DayNightToggle';
import { useAudio } from '@/hooks/useAudio';
import styles from './HUD.module.scss';

// ----- SUB COMPONENTS -----

interface BarProps {
  value: number;     // 0–100
  label: string;
  colorVar: string;  // CSS variable name
  icon: string;
}

function StatBar({ value, label, colorVar, icon }: BarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    if (!fillRef.current) return;
    const prev = prevRef.current;
    prevRef.current = value;

    gsap.fromTo(
      fillRef.current,
      { width: `${prev}%` },
      {
        width: `${value}%`,
        duration: 0.3,
        ease: 'power2.out',
      }
    );
  }, [value]);

  return (
    <div className={styles.barGroup}>
      <div className={styles.barHeader}>
        <span className={styles.barIcon}>{icon}</span>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barValue}>{Math.round(value)}%</span>
      </div>
      <div className={`${styles.barTrack}`} style={{ '--bar-color': `var(${colorVar})` } as React.CSSProperties}>
        <div ref={fillRef} className={styles.barFill} />
        <div className={styles.barShine} />
      </div>
    </div>
  );
}

// ----- SPEED DIAL -----

interface SpeedDialProps {
  speed: number;
  maxSpeed: number;
}

function SpeedDial({ speed, maxSpeed }: SpeedDialProps) {
  const numRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (!numRef.current) return;
    const obj = { val: prevRef.current };
    prevRef.current = speed;

    gsap.to(obj, {
      val: speed,
      duration: 0.2,
      ease: 'none',
      onUpdate: () => {
        if (numRef.current) {
          numRef.current.textContent = Math.round(obj.val).toString();
        }
      },
    });
  }, [speed]);

  const pct = Math.min(100, (speed / maxSpeed) * 100);
  const isHighSpeed = pct > 80;

  return (
    <div className={`${styles.speedDial} ${isHighSpeed ? styles.speedHigh : ''}`}>
      <div className={styles.speedArc}>
        <svg viewBox="0 0 100 60" className={styles.speedSvg}>
          {/* Track */}
          <path
            d="M 5 55 A 50 50 0 0 1 95 55"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Fill */}
          <path
            d="M 5 55 A 50 50 0 0 1 95 55"
            fill="none"
            stroke={isHighSpeed ? 'var(--neon-red)' : 'var(--neon-orange)'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="141"
            strokeDashoffset={141 - (141 * pct) / 100}
            style={{ filter: `drop-shadow(0 0 4px ${isHighSpeed ? 'var(--neon-red)' : 'var(--neon-orange)'})`, transition: 'stroke-dashoffset 0.2s ease-out, stroke 0.3s' }}
          />
        </svg>
      </div>
      <div className={styles.speedNumber}>
        <span ref={numRef} className={styles.speedValue}>0</span>
        <span className={styles.speedUnit}>km/h</span>
      </div>
    </div>
  );
}

// ----- COIN COUNTER -----

function CoinCounter({ coins }: { coins: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(0);

  const { playSound } = useAudio();

  useEffect(() => {
    if (!ref.current || coins === prevRef.current) return;
    
    // Play sound on increase
    if (coins > prevRef.current) {
      playSound('coin', { volume: 0.3 });
    }

    const obj = { val: prevRef.current };
    prevRef.current = coins;

    gsap.to(obj, {
      val: coins,
      duration: 0.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = Math.round(obj.val).toString();
      },
    });

    // Pulse animation on coin pickup
    gsap.fromTo(
      ref.current.parentElement,
      { scale: 1.3 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
  }, [coins, playSound]);

  return (
    <div className={styles.coinCounter}>
      <span className={styles.coinIcon}>⬡</span>
      <span ref={ref} className={styles.coinValue}>0</span>
    </div>
  );
}

// ----- DISTANCE -----

function DistanceDisplay({ distance }: { distance: number }) {
  const km = (distance / 1000).toFixed(2);
  return (
    <div className={styles.distanceDisplay}>
      <span className={styles.distanceIcon}>📍</span>
      <span className={styles.distanceValue}>{km}</span>
      <span className={styles.distanceUnit}>km</span>
    </div>
  );
}

// ----- NITRO INDICATOR -----

function NitroIndicator({ nitro, active }: { nitro: number; active: boolean }) {
  return (
    <div className={`${styles.nitroContainer} ${active ? styles.nitroActive : ''}`}>
      <div className={styles.nitroLabel}>
        <span>⚡ NITRO</span>
        {active && <span className={styles.nitroFlash}>BOOST!</span>}
      </div>
      <div className={styles.nitroSegments}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.nitroSegment} ${nitro > i * 10 ? styles.nitroSegmentFull : ''} ${active ? styles.nitroSegmentActive : ''}`}
          />
        ))}
      </div>

      <DayNightToggle />
    </div>
  );
}

// ----- MAIN HUD -----

export default function HUD() {
  const player = useGameStore((s) => s.player);
  const phase = useGameStore((s) => s.phase);

  if (phase !== 'playing' && phase !== 'paused') return null;

  const { speed, maxSpeed, health, nitro, nitroActive, coins, distance } = player;

  return (
    <div className={styles.hud} aria-label="Game HUD" role="status">
      {/* TOP BAR ── Speed + Distance */}
      <div className={styles.topBar}>
        <SpeedDial speed={speed} maxSpeed={maxSpeed} />
        <DistanceDisplay distance={distance} />
        <CoinCounter coins={coins} />
      </div>

      {/* LEFT PANEL ── Health + Nitro */}
      <div className={styles.leftPanel}>
        <StatBar
          value={health}
          label="HEALTH"
          colorVar="--neon-green"
          icon="❤"
        />
        <NitroIndicator nitro={nitro} active={nitroActive} />
      </div>

      {/* PAUSE HINT */}
      {phase === 'paused' && (
        <div className={styles.pauseOverlay}>
          <span className={styles.pauseText}>PAUSED</span>
        </div>
      )}

      {/* KEYBOARD HINTS (bottom right) */}
      <div className={styles.controls}>
        <span className={styles.controlHint}>WASD / ↑↓←→ Move</span>
        <span className={styles.controlHint}>SHIFT Nitro</span>
        <span className={styles.controlHint}>ESC Pause</span>
      </div>
    </div>
  );
}
