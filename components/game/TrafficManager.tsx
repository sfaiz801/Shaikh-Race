// ============================================================
// SHAIKH RACE — Traffic Manager
// Spawns and manages 6 AI traffic cars using object pooling
// ============================================================

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import CarModel from './CarModel';
import type { TrafficCar } from '@/types/game';

// ----- CONSTANTS -----

const LANE_X_POSITIONS = [-3.5, 0, 3.5] as const;   // 3 lanes
const TRAFFIC_POOL_SIZE = 6;
const SPAWN_Z = -120;           // Spawn ahead of player (negative Z = forward)
const DESPAWN_Z = 30;           // Remove behind player
const BASE_SPEED = 0.06;        // World units per frame
const TRAFFIC_COLORS = [
  '#ff4444', '#44aaff', '#ffaa00',
  '#44ff88', '#cc44ff', '#ffffff',
] as const;

// ----- SINGLE TRAFFIC CAR MESH -----

interface TrafficCarMeshProps {
  car: TrafficCar;
  playerZRef: React.MutableRefObject<number>;
}

function TrafficCarMesh({ car, playerZRef }: TrafficCarMeshProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (!meshRef.current || !car.isActive) return;

    // Move traffic car toward player (positive Z = toward camera)
    meshRef.current.position.z += car.speed;

    // Sync position to store for collision detection (done in GameCanvas)
    car.position[2] = meshRef.current.position.z;
  });

  if (!car.isActive) return null;

  return (
    <group
      ref={meshRef}
      position={new THREE.Vector3(...car.position)}
    >
      <CarModel 
        type="Basic Car" 
        color={car.color} 
      />

      {/* Headlights for visibility */}
      <pointLight position={[0, 0.4, -1.8]} color="#ffffff" intensity={1.5} distance={8} />
    </group>
  );
}

// ----- TRAFFIC MANAGER -----

interface TrafficManagerProps {
  playerZRef: React.MutableRefObject<number>;
}

export default function TrafficManager({ playerZRef }: TrafficManagerProps) {
  const setTrafficCars = useGameStore((s) => s.setTrafficCars);
  const phase = useGameStore((s) => s.phase);

  // Object pool — mutable ref to avoid re-renders
  const poolRef = useRef<TrafficCar[]>([]);
  const frameCountRef = useRef(0);
  const SPAWN_INTERVAL = 90; // frames between spawn attempts

  // Initialize pool
  const initialPool = useMemo<TrafficCar[]>(() => {
    return Array.from({ length: TRAFFIC_POOL_SIZE }, (_, i) => ({
      id: `traffic-${i}`,
      laneIndex: i % 3,
      position: [
        LANE_X_POSITIONS[i % 3],
        0,
        SPAWN_Z - i * 25,
      ] as [number, number, number],
      speed: BASE_SPEED + Math.random() * 0.02,
      color: TRAFFIC_COLORS[i % TRAFFIC_COLORS.length],
      isActive: true,
    }));
  }, []);

  useEffect(() => {
    poolRef.current = initialPool.map((c) => ({ ...c }));
    setTrafficCars(poolRef.current);
  }, [initialPool, setTrafficCars]);

  // Per-frame: recycle cars that pass the player
  useFrame(() => {
    if (phase !== 'playing') return;
    frameCountRef.current++;

    let needsUpdate = false;

    for (const car of poolRef.current) {
      if (!car.isActive) continue;

      // Despawn check (car passed behind player)
      if (car.position[2] > DESPAWN_Z) {
        // Reset to front
        const lane = Math.floor(Math.random() * 3);
        car.laneIndex = lane;
        car.position = [LANE_X_POSITIONS[lane], 0, SPAWN_Z];
        car.speed = BASE_SPEED + Math.random() * 0.025;
        car.color = TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)];
        needsUpdate = true;
      }
    }

    // Stagger new spawns
    if (frameCountRef.current % SPAWN_INTERVAL === 0) {
      const inactive = poolRef.current.find((c) => !c.isActive);
      if (inactive) {
        inactive.isActive = true;
        const lane = Math.floor(Math.random() * 3);
        inactive.laneIndex = lane;
        inactive.position = [LANE_X_POSITIONS[lane], 0, SPAWN_Z];
        inactive.speed = BASE_SPEED + Math.random() * 0.02;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setTrafficCars([...poolRef.current]);
    }
  });

  const cars = poolRef.current.length > 0 ? poolRef.current : initialPool;

  return (
    <group>
      {cars.map((car) => (
        <TrafficCarMesh
          key={car.id}
          car={car}
          playerZRef={playerZRef}
        />
      ))}
    </group>
  );
}
