// ============================================================
// SHAIKH RACE — RoadSystem
// 5 road segments that scroll and recycle infinitely.
// Lane markings, edge barriers, ground plane.
// ============================================================

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';

// ── CONSTANTS ─────────────────────────────────────────────────
const SEGMENT_LENGTH = 60;      // world-units per segment
const SEGMENT_COUNT  = 5;       // number of pooled segments
const ROAD_WIDTH     = 14;      // total road width
const TOTAL_LOOP     = SEGMENT_COUNT * SEGMENT_LENGTH;

// Lane divider X positions (two dividers split 3 lanes)
const DIVIDER_X = [-3.5, 0, 3.5] as const;

// Barrier colours
const BARRIER_COLORS = ['#ff2244', '#00f5ff'] as const;

// ── ROAD SEGMENT ──────────────────────────────────────────────
interface SegmentProps {
  segRef: React.RefObject<THREE.Group>;
  zStart: number;
}

function RoadSegment({ segRef, zStart }: SegmentProps) {
  return (
    <group ref={segRef} position={[0, 0, zStart]}>
      {/* Tarmac */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ROAD_WIDTH, SEGMENT_LENGTH]} />
        <meshStandardMaterial color="#0d1a2d" metalness={0.12} roughness={0.95} />
      </mesh>

      {/* Lane markings — dashed centre lines */}
      {DIVIDER_X.slice(0, 2).map((x, i) => (
        <mesh key={i} position={[x, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, SEGMENT_LENGTH]} />
          <meshStandardMaterial
            color="#00f5ff"
            emissive="#00f5ff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Road shoulders (outer lines) */}
      {([-6.6, 6.6] as const).map((x, i) => (
        <mesh key={`shoulder-${i}`} position={[x, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, SEGMENT_LENGTH]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export default function RoadSystem() {
  const phase = useGameStore((s) => s.phase);

  // Create refs for each segment group
  const segRefs = useRef<React.RefObject<THREE.Group>[]>(
    Array.from({ length: SEGMENT_COUNT }, () =>
      React.createRef<THREE.Group>()
    )
  );

  useFrame((_, delta) => {
    if (phase !== 'playing') return;

    const speed = useGameStore.getState().player.speed;
    // Convert km/h to world-units/frame with a visual scale factor
    const moveZ = (speed / 3.6) * delta * 10;

    for (const ref of segRefs.current) {
      const seg = ref.current;
      if (!seg) continue;

      seg.position.z += moveZ;

      // Recycle: when segment is fully behind the player, jump it to the front
      if (seg.position.z > SEGMENT_LENGTH) {
        seg.position.z -= TOTAL_LOOP;
      }
    }
  });

  // Initial Z positions — spread evenly ahead of player (negative Z = forward)
  const initialPositions = useMemo(
    () =>
      Array.from(
        { length: SEGMENT_COUNT },
        (_, i) => -i * SEGMENT_LENGTH + SEGMENT_LENGTH / 2
      ),
    []
  );

  return (
    <group>
      {/* Road segments */}
      {segRefs.current.map((ref, i) => (
        <RoadSegment
          key={i}
          segRef={ref}
          zStart={initialPositions[i]}
        />
      ))}

      {/* Edge barriers — static, just cosmetic */}
      {BARRIER_COLORS.map((color, i) => {
        const side = i === 0 ? -1 : 1;
        return (
          <mesh
            key={`barrier-${i}`}
            position={[side * (ROAD_WIDTH / 2 + 0.35), 0.5, 0]}
            castShadow
          >
            <boxGeometry args={[0.5, 1.1, TOTAL_LOOP]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.35}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        );
      })}

      {/* Ground plane (far beyond road) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
        <planeGeometry args={[500, 1000]} />
        <meshStandardMaterial color="#020408" />
      </mesh>
    </group>
  );
}
