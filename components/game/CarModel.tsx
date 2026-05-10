// ============================================================
// SHAIKH RACE — CarModel Component
// ============================================================

'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface CarModelProps {
  type: string;
  color: string;
  nitroActive?: boolean;
}

export default function CarModel({ type, color, nitroActive }: CarModelProps) {
  // In a real project, you'd load models like this:
  // const { scene } = useGLTF(`/models/cars/${type}.glb`);
  
  // For now, we use high-quality procedural proxies for Phase 4
  const bodyColor = new THREE.Color(color);
  const emissiveColor = nitroActive ? new THREE.Color('#00ffff') : new THREE.Color('#333');

  const proxy = useMemo(() => {
    switch (type) {
      case 'Sports Car':
      case 'Super Racing Car':
        return (
          <group>
            {/* Low-profile body */}
            <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
              <boxGeometry args={[1.8, 0.5, 4.5]} />
              <meshStandardMaterial color={bodyColor} roughness={0.1} metalness={0.8} />
            </mesh>
            {/* Cockpit */}
            <mesh castShadow position={[0, 0.8, 0.2]}>
              <boxGeometry args={[1.4, 0.4, 1.5]} />
              <meshPhysicalMaterial color="#222" transmission={0.5} opacity={0.5} transparent />
            </mesh>
            {/* Spoiler */}
            <mesh position={[0, 1.0, -1.8]}>
              <boxGeometry args={[1.9, 0.1, 0.4]} />
              <meshStandardMaterial color={bodyColor} />
            </mesh>
          </group>
        );
      case 'SUV':
      case 'Truck':
        return (
          <group>
            <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
              <boxGeometry args={[2.0, 1.2, 4.8]} />
              <meshStandardMaterial color={bodyColor} roughness={0.5} />
            </mesh>
          </group>
        );
      case 'Police Car':
        return (
          <group>
            <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
              <boxGeometry args={[1.8, 0.6, 4.5]} />
              <meshStandardMaterial color="#000000" />
            </mesh>
            {/* Siren */}
            <mesh position={[0, 1.1, 0]}>
              <boxGeometry args={[0.6, 0.1, 0.2]} />
              <meshBasicMaterial color={Math.sin(Date.now() * 0.01) > 0 ? '#ff0000' : '#0000ff'} />
            </mesh>
          </group>
        );
      default:
        // Basic Car / HyperCar
        return (
          <group>
            <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
              <boxGeometry args={[1.8, 0.6, 4.2]} />
              <meshStandardMaterial color={bodyColor} roughness={0.2} metalness={0.5} />
            </mesh>
            <mesh position={[0, 0.8, -0.2]}>
              <boxGeometry args={[1.5, 0.4, 1.8]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        );
    }
  }, [type, bodyColor]);

  return (
    <group>
      {proxy}
      
      {/* Wheels */}
      <mesh position={[-0.9, 0.3, 1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.9, 0.3, 1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.9, 0.3, -1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0.9, 0.3, -1.4]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Underglow (Neon) */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 4.5]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
