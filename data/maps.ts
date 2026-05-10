// ============================================================
// SHAIKH RACE — Map Data
// ============================================================

import type { MapData } from '@/types/game';

export const MAPS: MapData[] = [
  {
    id: 'city',
    name: 'Midnight City',
    bgColor: '#020408',
    fogColor: '#050c14',
    fogDensity: 0.015,
    lightIntensity: 0.4,
    ambientColor: '#1a2a4a',
    unlockXP: 0,
    description: 'Neon-lit streets with moderate visibility. A classic starting point.',
  },
  {
    id: 'highway',
    name: 'Pacific Highway',
    bgColor: '#4ca1af',
    fogColor: '#c4e0e5',
    fogDensity: 0.002, // very low fog
    lightIntensity: 1.0,
    ambientColor: '#ffffff',
    unlockXP: 500,
    description: 'Clear skies and endless roads. Perfect for reaching top speed.',
  },
  {
    id: 'desert',
    name: 'Scorched Desert',
    bgColor: '#ff9a44',
    fogColor: '#fc6076',
    fogDensity: 0.008,
    lightIntensity: 0.8,
    ambientColor: '#ffd89b',
    unlockXP: 1500,
    description: 'Blistering heat and orange haze. Visibility drops over distance.',
  },
  {
    id: 'neon_cyber',
    name: 'Cyber Grid',
    bgColor: '#1a0033',
    fogColor: '#ff00aa',
    fogDensity: 0.02,
    lightIntensity: 0.6,
    ambientColor: '#a855f7',
    unlockXP: 3000,
    description: 'A virtual reality dreamscape. Heavy neon fog and glowing dark horizons.',
  },
];

export function getMapById(id: string): MapData | undefined {
  return MAPS.find((m) => m.id === id);
}
