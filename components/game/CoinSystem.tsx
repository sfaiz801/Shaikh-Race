// ============================================================
// SHAIKH RACE — CoinSystem
// Spawns 3D spinning coins on lane positions ahead of player.
// Picks up on overlap, credits gameStore, re-spawns at front.
// ============================================================

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

// ── CONSTANTS ─────────────────────────────────────────────────
const LANE_X          = [-3.5, 0, 3.5] as const;
const ROW_COUNT       = 8;              // number of coin rows in pool
const ROW_SPACING     = 45;            // world units between rows
const COIN_RADIUS     = 0.32;
const COLLECT_DIST_XZ = 1.4;           // pick-up radius (X and Z axes)
const COIN_YELLOW     = '#ffe600';
const COIN_EMISSIVE_I = 1.8;

// ── TYPES ─────────────────────────────────────────────────────
interface CoinRowState {
  id: number;
  /** Which lanes have a coin (up to 3, randomly chosen) */
  activeLanes: number[];
  collected: boolean[];
  zPos: number;
}

// ── SINGLE COIN MESH ─────────────────────────────────────────
interface CoinMeshProps {
  laneX: number;
  visible: boolean;
  groupRef: React.RefObject<THREE.Group>;
}

const CoinMesh = React.memo(function CoinMesh({ laneX, visible, groupRef }: CoinMeshProps) {
  if (!visible) return null;
  return (
    <mesh position={[laneX, 0.55, 0]} castShadow>
      <cylinderGeometry args={[COIN_RADIUS, COIN_RADIUS, 0.12, 18]} />
      <meshStandardMaterial
        color={COIN_YELLOW}
        emissive={COIN_YELLOW}
        emissiveIntensity={COIN_EMISSIVE_I}
        metalness={0.95}
        roughness={0.05}
      />
    </mesh>
  );
});

// ── COIN ROW GROUP ────────────────────────────────────────────
interface CoinRowProps {
  row: CoinRowState;
  onCollect: (rowId: number, laneIdx: number) => void;
  playerXRef: React.MutableRefObject<number>;
}

function CoinRow({ row, onCollect, playerXRef }: CoinRowProps) {
  const groupRef  = useRef<THREE.Group>(null!);
  const rotRef    = useRef(0);
  const localZ    = useRef(row.zPos);
  // shadow-copy collected state locally to avoid re-renders
  const collectedRef = useRef<boolean[]>([...row.collected]);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing') return;

    const speed  = state.player.speed;
    const moveZ  = (speed / 3.6) * delta * 10;
    localZ.current += moveZ;

    const group = groupRef.current;
    if (!group) return;
    group.position.z = localZ.current;

    // Spin
    rotRef.current += delta * 2.8;
    group.rotation.y = rotRef.current;

    // Recycle when behind player
    if (localZ.current > 12) {
      localZ.current -= ROW_COUNT * ROW_SPACING;
      collectedRef.current.fill(false);
    }

    // Collision check
    const px = playerXRef.current;
    for (let i = 0; i < row.activeLanes.length; i++) {
      if (collectedRef.current[i]) continue;
      const laneX = LANE_X[row.activeLanes[i]];
      const dx = Math.abs(laneX - px);
      const dz = Math.abs(localZ.current - 0); // player always at z=0
      if (dx < COLLECT_DIST_XZ && dz < COLLECT_DIST_XZ) {
        collectedRef.current[i] = true;
        onCollect(row.id, i);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, row.zPos]}>
      {row.activeLanes.map((laneIdx, i) => {
        if (collectedRef.current[i]) return null;
        const laneX = LANE_X[laneIdx];
        return (
          <group key={i}>
            <mesh position={[laneX, 0.55, 0]} castShadow>
              <cylinderGeometry args={[COIN_RADIUS, COIN_RADIUS, 0.12, 18]} />
              <meshStandardMaterial
                color={COIN_YELLOW}
                emissive={COIN_YELLOW}
                emissiveIntensity={COIN_EMISSIVE_I}
                metalness={0.95}
                roughness={0.05}
              />
            </mesh>
            {/* Glow light under coin */}
            <pointLight
              position={[laneX, 0.3, 0]}
              color={COIN_YELLOW}
              intensity={0.8}
              distance={2.5}
            />
          </group>
        );
      })}
    </group>
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
interface CoinSystemProps {
  playerXRef: React.MutableRefObject<number>;
}

export default function CoinSystem({ playerXRef }: CoinSystemProps) {
  const collectCoin = useGameStore((s) => s.collectCoin);

  // Build initial row pool
  const rows = useMemo<CoinRowState[]>(() => {
    return Array.from({ length: ROW_COUNT }, (_, i) => {
      // Random subset of lanes (1–3 coins per row)
      const laneCount   = Math.floor(Math.random() * 3) + 1;
      const shuffled    = [0, 1, 2].sort(() => Math.random() - 0.5);
      const activeLanes = shuffled.slice(0, laneCount);
      return {
        id:          i,
        activeLanes,
        collected:   activeLanes.map(() => false),
        zPos:        -30 - i * ROW_SPACING,
      };
    });
  }, []);

  const handleCollect = (rowId: number, laneIdx: number) => {
    collectCoin(`${rowId}-${laneIdx}`);
  };

  return (
    <group>
      {rows.map((row) => (
        <CoinRow
          key={row.id}
          row={row}
          onCollect={handleCollect}
          playerXRef={playerXRef}
        />
      ))}
    </group>
  );
}
