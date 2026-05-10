// ============================================================
// SHAIKH RACE — useGameLoop hook
// Tracks speed ramp, distance, nitro drain/regen.
// Uses refs throughout — zero re-renders from the loop itself.
// ============================================================

import { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { InputState } from '@/types/game';

// Speed auto-increases every 10 s
const SPEED_INCREMENT_INTERVAL = 10_000; // ms
const SPEED_INCREMENT_KMH      = 8;      // km/h per interval
const NITRO_DRAIN_RATE         = 0.4;    // % per frame (60fps)
const NITRO_REGEN_RATE         = 0.12;   // % per frame
const ACCEL_LERP               = 0.05;   // speed smoothing

export interface GameLoopState {
  speed:       number;
  distance:    number;
  coins:       number;
  health:      number;
  nitro:       number;
  isGameOver:  boolean;
}

interface UseGameLoopOptions {
  inputRef:    React.MutableRefObject<InputState>;
  maxSpeed:    number;
  baseHealth:  number;
}

export function useGameLoop({
  inputRef,
  maxSpeed,
  baseHealth,
}: UseGameLoopOptions): React.MutableRefObject<GameLoopState> {
  const stateRef = useRef<GameLoopState>({
    speed:      0,
    distance:   0,
    coins:      0,
    health:     baseHealth,
    nitro:      100,
    isGameOver: false,
  });

  const frameRef       = useRef<number>(0);
  const lastTimeRef    = useRef<number>(performance.now());
  const speedRampTimer = useRef<number>(0);
  const speedCapRef    = useRef<number>(maxSpeed * 0.4); // start at 40% max

  // Sync derived values back to gameStore
  const {
    setSpeed,
    setNitro,
    setNitroActive,
    addDistance,
    takeDamage,
  } = useGameStore.getState();

  useEffect(() => {
    // Reset cap on mount
    speedCapRef.current = maxSpeed * 0.4;
    stateRef.current    = {
      speed:      0,
      distance:   0,
      coins:      0,
      health:     baseHealth,
      nitro:      100,
      isGameOver: false,
    };

    const tick = (now: number) => {
      const phase = useGameStore.getState().phase;
      if (phase !== 'playing') {
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1); // cap at 100ms
      lastTimeRef.current = now;

      const inp     = inputRef.current;
      const ls      = stateRef.current;

      // ── Speed ramp over time ───────────────────────────
      speedRampTimer.current += delta * 1000;
      if (speedRampTimer.current >= SPEED_INCREMENT_INTERVAL) {
        speedRampTimer.current = 0;
        speedCapRef.current = Math.min(
          maxSpeed,
          speedCapRef.current + SPEED_INCREMENT_KMH
        );
      }

      // ── Target speed based on input ───────────────────
      const nitroMult = inp.nitro && ls.nitro > 0 ? 1.5 : 1;
      const targetSpd = inp.forward
        ? speedCapRef.current * nitroMult
        : inp.backward
        ? -20
        : 0;

      ls.speed += (targetSpd - ls.speed) * ACCEL_LERP * (60 * delta);
      if (Math.abs(ls.speed) < 0.3) ls.speed = 0;

      // ── Nitro ─────────────────────────────────────────
      if (inp.nitro && inp.forward && ls.nitro > 0) {
        ls.nitro = Math.max(0, ls.nitro - NITRO_DRAIN_RATE * 60 * delta);
        setNitroActive(true);
      } else {
        ls.nitro = Math.min(100, ls.nitro + NITRO_REGEN_RATE * 60 * delta);
        setNitroActive(false);
      }

      // ── Sync to store ─────────────────────────────────
      const positiveSpeed = Math.max(0, ls.speed);
      setSpeed(positiveSpeed);
      setNitro(ls.nitro);
      const distDelta = (positiveSpeed / 3.6) * delta;
      addDistance(distDelta);
      ls.distance += distDelta;

      // Check game over
      const storeHealth = useGameStore.getState().player.health;
      ls.health     = storeHealth;
      ls.isGameOver = storeHealth <= 0;
      ls.coins      = useGameStore.getState().player.coins;

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [maxSpeed, baseHealth, inputRef, setSpeed, setNitro, setNitroActive, addDistance]);

  return stateRef;
}
