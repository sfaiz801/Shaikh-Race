// ============================================================
// SHAIKH RACE — LightingSystem Component
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import { getMapById, MAPS } from '@/data/maps';

const STREET_LAMP_COUNT = 6;
const LAMP_SPACING = 40;

export default function LightingSystem() {
  const activeMapId = useGameStore((s) => s.activeMapId);
  const dayNightMode = useGameStore((s) => s.dayNightMode);

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  
  // Array of street lamps
  const lampsRef = useRef<THREE.Group>(null);
  const lampLightsRef = useRef<THREE.PointLight[]>([]);

  useEffect(() => {
    if (!ambientRef.current || !dirRef.current) return;

    const map = getMapById(activeMapId) || MAPS[0];
    
    // Base colors
    let targetAmbientColor = new THREE.Color(map.ambientColor);
    let targetAmbientIntensity = map.lightIntensity;
    let targetDirIntensity = map.lightIntensity * 1.5;
    let lampIntensity = 0; // Off during the day

    if (dayNightMode === 'night') {
      targetAmbientColor = targetAmbientColor.clone().multiplyScalar(0.2);
      targetAmbientIntensity *= 0.3;
      targetDirIntensity *= 0.1; // Moon light
      lampIntensity = 2.5; // Turn on street lamps
    }

    const tl = gsap.timeline();

    // Ambient
    tl.to(ambientRef.current.color, { r: targetAmbientColor.r, g: targetAmbientColor.g, b: targetAmbientColor.b, duration: 1.5 }, 0);
    tl.to(ambientRef.current, { intensity: targetAmbientIntensity, duration: 1.5 }, 0);

    // Directional
    tl.to(dirRef.current, { intensity: targetDirIntensity, duration: 1.5 }, 0);

    // Street Lamps
    lampLightsRef.current.forEach((lamp) => {
      if (lamp) {
        tl.to(lamp, { intensity: lampIntensity, duration: 1.5 }, 0);
      }
    });

  }, [activeMapId, dayNightMode]);

  // Scroll street lamps towards player
  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'playing' || !lampsRef.current) return;

    const speed = useGameStore.getState().player.speed;
    const moveZ = (speed / 3.6) * delta * 10;

    lampsRef.current.children.forEach((lampGroup) => {
      lampGroup.position.z += moveZ;
      if (lampGroup.position.z > 20) {
        lampGroup.position.z -= STREET_LAMP_COUNT * LAMP_SPACING;
      }
    });
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} color="#ffffff" />
      <directionalLight
        ref={dirRef}
        position={[10, 20, 10]}
        intensity={1.0}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      {/* Street Lamps Container */}
      <group ref={lampsRef}>
        {Array.from({ length: STREET_LAMP_COUNT }).map((_, i) => {
          const zPos = -i * LAMP_SPACING;
          // Alternate left and right side of the road
          const xPos = i % 2 === 0 ? -8 : 8;
          
          return (
            <group key={i} position={[xPos, 5, zPos]}>
              <pointLight
                ref={(el) => {
                  if (el) lampLightsRef.current[i] = el;
                }}
                color="#ffe600"
                intensity={0}
                distance={30}
              />
              {/* Optional: A small glowing mesh to represent the lamp bulb */}
              <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>
    </>
  );
}
