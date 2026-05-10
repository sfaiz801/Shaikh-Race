// ============================================================
// SHAIKH RACE — MapLoader Component
// ============================================================

'use client';

import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { useGameStore } from '@/store/gameStore';
import { getMapById, MAPS } from '@/data/maps';

export default function MapLoader() {
  const { scene } = useThree();
  const activeMapId = useGameStore((s) => s.activeMapId);
  const dayNightMode = useGameStore((s) => s.dayNightMode);

  // References to the actual Three.js objects we'll animate
  const bgRef = useRef<THREE.Color>(new THREE.Color('#020408'));
  const fogRef = useRef<THREE.FogExp2>(new THREE.FogExp2('#050c14', 0.015));

  useEffect(() => {
    // Attach objects to scene on mount
    scene.background = bgRef.current;
    scene.fog = fogRef.current;
  }, [scene]);

  useEffect(() => {
    const map = getMapById(activeMapId) || MAPS[0];
    
    // Determine colors based on day/night mode
    // (If it's night, we darken the map's base background and fog)
    let targetBg = new THREE.Color(map.bgColor);
    let targetFog = new THREE.Color(map.fogColor);

    if (dayNightMode === 'night') {
      targetBg = targetBg.clone().multiplyScalar(0.15); // Darken heavily
      targetFog = targetFog.clone().multiplyScalar(0.2);
    }

    // GSAP animation for smooth transition
    const tl = gsap.timeline();
    
    // Animate background color
    tl.to(bgRef.current, {
      r: targetBg.r,
      g: targetBg.g,
      b: targetBg.b,
      duration: 1.5,
      ease: 'power2.inOut',
    }, 0);

    // Animate fog color and density
    tl.to(fogRef.current.color, {
      r: targetFog.r,
      g: targetFog.g,
      b: targetFog.b,
      duration: 1.5,
      ease: 'power2.inOut',
    }, 0);

    tl.to(fogRef.current, {
      density: map.fogDensity,
      duration: 1.5,
      ease: 'power2.inOut',
    }, 0);

  }, [activeMapId, dayNightMode]);

  return null;
}
