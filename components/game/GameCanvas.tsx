// ============================================================
// SHAIKH RACE — GameCanvas (React Three Fiber) — FINAL
// Uses: RoadSystem, CoinSystem, TrafficManager, useControls
// ============================================================

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { useGarageStore } from '@/store/garageStore';
import { useControls } from '@/hooks/useControls';
import RoadSystem from './RoadSystem';
import CoinSystem from './CoinSystem';
import TrafficManager from './TrafficManager';
import MapLoader from './MapLoader';
import LightingSystem from './LightingSystem';
import { useAudio } from '@/hooks/useAudio';
import CarModel from './CarModel';
import type { InputState } from '@/types/game';

// ── CONSTANTS ────────────────────────────────────────────────
const ACCEL_LERP = 0.05;
const NITRO_DRAIN_RATE = 0.4;    // %/frame
const NITRO_REGEN_RATE = 0.12;   // %/frame
const DAMAGE_PER_HIT = 18;
const COLLISION_XZ = 2.2;

// ── CAMERA ───────────────────────────────────────────────────
function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 5.5, 9);
    camera.lookAt(0, 0.5, -5);
  }, [camera]);
  return null;
}

// ── PLAYER CAR ───────────────────────────────────────────────
interface PlayerCarProps {
  inputRef: React.MutableRefObject<InputState>;
  playerXRef: React.MutableRefObject<number>;
}

function PlayerCar({ inputRef, playerXRef }: PlayerCarProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const tiltRef = useRef(0);
  const speedRef = useRef(0);
  const nitroRef = useRef(100);
  const exLRef = useRef<THREE.PointLight>(null!);
  const exRRef = useRef<THREE.PointLight>(null!);
  const lastHitRef = useRef(0);

  const car = useGarageStore.getState().getActiveCar();
  const stats = useGarageStore.getState().getEffectiveStats(car.id);
  const maxKmh = stats.speed * 30 + 60;
  const handling = stats.handling / 10;

  const { setSpeed, setNitro, setNitroActive, addDistance, takeDamage } =
    useGameStore.getState();

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'playing') return;

    const inp = inputRef.current;

    // ── Speed ────────────────────────────────────────────
    const nitroMult = inp.nitro && nitroRef.current > 0 ? 1.5 : 1;
    const targetSpd = inp.forward ? maxKmh * nitroMult : inp.backward ? -20 : 0;
    speedRef.current += (targetSpd - speedRef.current) * ACCEL_LERP * (60 * delta);
    if (Math.abs(speedRef.current) < 0.3) speedRef.current = 0;

    const positiveSpeed = Math.max(0, speedRef.current);
    setSpeed(positiveSpeed);

    // ── Nitro ────────────────────────────────────────────
    if (inp.nitro && inp.forward && nitroRef.current > 0) {
      nitroRef.current = Math.max(0, nitroRef.current - NITRO_DRAIN_RATE * 60 * delta);
      setNitroActive(true);
    } else {
      nitroRef.current = Math.min(100, nitroRef.current + NITRO_REGEN_RATE * 60 * delta);
      setNitroActive(false);
    }
    setNitro(nitroRef.current);

    // ── Lateral movement ─────────────────────────────────
    const lateralSpeed = handling * 5;
    if (inp.left) playerXRef.current -= lateralSpeed * delta * 60;
    if (inp.right) playerXRef.current += lateralSpeed * delta * 60;
    playerXRef.current = THREE.MathUtils.clamp(playerXRef.current, -5.5, 5.5);

    // Tilt on steering
    const targetTilt = inp.left ? -0.18 : inp.right ? 0.18 : 0;
    tiltRef.current += (targetTilt - tiltRef.current) * 0.12;

    if (groupRef.current) {
      groupRef.current.position.x = playerXRef.current;
      groupRef.current.rotation.z = tiltRef.current;
    }

    // ── Distance ─────────────────────────────────────────
    addDistance((positiveSpeed / 3.6) * delta);

    // ── Collision with traffic ────────────────────────────
    const now = performance.now();
    if (now - lastHitRef.current > 600) {   // 600ms cooldown between hits
      const traffic = useGameStore.getState().trafficCars;
      for (const tc of traffic) {
        if (!tc.isActive) continue;
        const dx = Math.abs(tc.position[0] - playerXRef.current);
        const dz = Math.abs(tc.position[2]);   // traffic Z is in world space
        if (dx < COLLISION_XZ && dz < COLLISION_XZ) {
          lastHitRef.current = now;
          takeDamage(DAMAGE_PER_HIT);
          // Bounce player away
          playerXRef.current +=
            tc.position[0] > playerXRef.current ? -1.8 : 1.8;
          speedRef.current *= 0.35;
          break;
        }
      }
    }

    // ── Exhaust intensity ─────────────────────────────────
    const exhaustI = inp.nitro && nitroRef.current > 0 ? 3.5 : 0.5;
    if (exLRef.current) exLRef.current.intensity = exhaustI;
    if (exRRef.current) exRRef.current.intensity = exhaustI;
  });

  const carColor = car.color;
  const nitroActive = useGameStore((s) => s.player.nitroActive);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <CarModel
        type={car.name}
        color={carColor}
        nitroActive={nitroActive}
      />

      {/* Headlights */}
      <pointLight position={[0, 0.4, -2.2]} color="#ffffff" intensity={4} distance={22} castShadow />

      {/* Nitro Thrusters / Exhaust */}
      <pointLight
        ref={exLRef}
        position={[-0.6, 0.5, 2]}
        color="#00f5ff"
        distance={8}
        intensity={0.5}
      />
      <pointLight
        ref={exRRef}
        position={[0.6, 0.5, 2]}
        color="#00f5ff"
        distance={8}
        intensity={0.5}
      />
    </group>
  );
}

// ── TOUCH JOYSTICK ───────────────────────────────────────────
interface JoystickProps {
  onInput: (partial: Partial<InputState>) => void;
}

function TouchJoystick({ onInput }: JoystickProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const active = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const onStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t.clientX > window.innerWidth / 2) return;
    active.current = true;
    setVisible(true);
    setPos({ x: t.clientX, y: t.clientY });
    startPos.current = { x: t.clientX, y: t.clientY };
    if (window.navigator.vibrate) window.navigator.vibrate(10);
  }, []);

  const onMove = useCallback((e: React.TouchEvent) => {
    if (!active.current || !knobRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - startPos.current.x;
    const dy = t.clientY - startPos.current.y;
    const maxDist = 50;
    const dist = Math.min(Math.hypot(dx, dy), maxDist);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * dist;
    const ky = Math.sin(angle) * dist;

    knobRef.current.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;

    const steering = kx / maxDist;
    const accel = -ky / maxDist;

    onInput({
      steering,
      left: steering < -0.2,
      right: steering > 0.2,
      forward: accel > 0.2,
      backward: accel < -0.2,
      acceleration: Math.max(0, accel)
    });
  }, [onInput]);

  const onEnd = useCallback(() => {
    active.current = false;
    setVisible(false);
    onInput({ forward: false, backward: false, left: false, right: false, steering: 0, acceleration: 0 });
  }, [onInput]);

  return (
    <div
      id="joystick-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '50vw',
        height: '100vh',
        zIndex: 10,
        touchAction: 'none'
      }}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      {visible && (
        <div
          ref={baseRef}
          style={{
            position: 'absolute', top: pos.y, left: pos.x,
            width: 100, height: 100, transform: 'translate(-50%, -50%)',
            background: 'rgba(0,245,255,0.08)', border: '2px solid rgba(0,245,255,0.25)',
            borderRadius: '50%',
          }}
        >
          <div
            ref={knobRef}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: 42, height: 42, background: 'var(--neon-cyan)', borderRadius: '50%',
              boxShadow: '0 0 15px var(--neon-cyan)',
            }}
          />
        </div>
      )}
    </div>
  );
}

function NitroButton({ onInput }: JoystickProps) {
  return (
    <button
      style={{
        position: 'fixed', bottom: 40, right: 32,
        width: 78, height: 78,
        background: 'rgba(0,245,255,0.12)',
        border: '2px solid var(--neon-cyan)',
        borderRadius: '50%',
        color: 'var(--neon-cyan)',
        fontFamily: 'var(--font-display)',
        fontSize: '0.58rem', fontWeight: 700,
        letterSpacing: '0.08em',
        cursor: 'pointer', zIndex: 10,
        boxShadow: '0 0 14px rgba(0,245,255,0.25)',
        touchAction: 'none',
        lineHeight: 1.3,
      }}
      onTouchStart={() => {
        onInput({ nitro: true, forward: true, acceleration: 1 });
        if (window.navigator.vibrate) window.navigator.vibrate([15, 30, 15]);
      }}
      onTouchEnd={() => onInput({ nitro: false, forward: false, acceleration: 0 })}
    >
      ⚡<br />NITRO
    </button>
  );
}

// ── SCENE ────────────────────────────────────────────────────
interface SceneProps {
  inputRef: React.MutableRefObject<InputState>;
  playerXRef: React.MutableRefObject<number>;
}

function Scene({ inputRef, playerXRef }: SceneProps) {
  const dummyZRef = useRef(0);
  const { camera } = useThree();
  const { playSound, stopSound } = useAudio();
  const player = useGameStore((s) => s.player);
  const prevHealthRef = useRef(player.health);
  const shakeRef = useRef(0);

  // Sound: Nitro
  useEffect(() => {
    if (inputRef.current.nitro && player.nitro > 0) {
      playSound('nitro', { volume: 0.4, loop: true });
    } else {
      stopSound('nitro');
    }
  }, [inputRef.current.nitro, player.nitro, playSound, stopSound]);

  // Camera Shake & Crash Sound
  useFrame((_, delta) => {
    if (player.health < prevHealthRef.current) {
      shakeRef.current = 0.5; // Trigger shake
      playSound('crash', { volume: 0.6 });
      prevHealthRef.current = player.health;
    }

    if (shakeRef.current > 0) {
      const shake = shakeRef.current;
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
      shakeRef.current -= delta * 1.5;
    }
  });

  return (
    <>
      <CameraSetup />
      <MapLoader />
      <LightingSystem />
      <Stars radius={120} depth={50} count={3000} factor={4} saturation={0.5} fade />
      <RoadSystem />
      <CoinSystem playerXRef={playerXRef} />
      <PlayerCar inputRef={inputRef} playerXRef={playerXRef} />
      <TrafficManager playerZRef={dummyZRef} />

      {/* VFX: Post-processing */}

    </>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────
export default function GameCanvas() {
  const playerXRef = useRef(0);
  const { inputRef, setTouchInput } = useControls();

  return (
    <>
      <Canvas
        id="game-canvas"
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 60, near: 0.1, far: 300 }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        dpr={[1, 1.5]}
      >
        <Scene inputRef={inputRef} playerXRef={playerXRef} />
      </Canvas>

      {/* Mobile controls — hidden on desktop via media query in globals.scss */}
      <TouchJoystick onInput={setTouchInput} />
      <NitroButton onInput={setTouchInput} />
    </>
  );
}
