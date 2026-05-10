// ============================================================
// SHAIKH RACE — Car Data
// 7 fully typed car objects
// ============================================================

import type { Car } from '@/types/game';

export const CARS: Car[] = [
  // ── 1. BASIC CAR ─────────────────────────────────────────
  {
    id: 'basic-car',
    name: 'Basic Car',
    bodyType: 'sedan',
    color: '#4fc3f7',
    isUnlocked: true,
    unlockXP: 0,
    upgradeCost: 50,
    description: 'The everyday starter. Reliable but nothing fancy.',
    stats: {
      speed: 4,
      nitro: 3,
      brake: 5,
      handling: 5,
      acceleration: 4,
      health: 80,
      drift: 0.25,
    },
  },

  // ── 2. SPORTS CAR ────────────────────────────────────────
  {
    id: 'sports-car',
    name: 'Sports Car',
    bodyType: 'sport',
    color: '#ff4081',
    isUnlocked: false,
    unlockXP: 500,
    upgradeCost: 150,
    description: 'Sleek aerodynamics and a roaring engine under the hood.',
    stats: {
      speed: 7,
      nitro: 6,
      brake: 6,
      handling: 7,
      acceleration: 7,
      health: 70,
      drift: 0.35,
    },
  },

  // ── 3. SUV ───────────────────────────────────────────────
  {
    id: 'suv',
    name: 'SUV',
    bodyType: 'suv',
    color: '#69f0ae',
    isUnlocked: false,
    unlockXP: 300,
    upgradeCost: 100,
    description: 'High ride and tough armor. Takes hits like a champ.',
    stats: {
      speed: 5,
      nitro: 4,
      brake: 6,
      handling: 4,
      acceleration: 5,
      health: 130,
      drift: 0.15,
    },
  },

  // ── 4. HYPERCAR ──────────────────────────────────────────
  {
    id: 'hypercar',
    name: 'HyperCar',
    bodyType: 'hyper',
    color: '#b3ff00',
    isUnlocked: false,
    unlockXP: 2000,
    upgradeCost: 500,
    description: 'Beyond supercar. Maximum velocity, minimal mercy.',
    stats: {
      speed: 10,
      nitro: 9,
      brake: 7,
      handling: 8,
      acceleration: 10,
      health: 60,
      drift: 0.5,
    },
  },

  // ── 5. TRUCK ─────────────────────────────────────────────
  {
    id: 'truck',
    name: 'Truck',
    bodyType: 'truck',
    color: '#ffb300',
    isUnlocked: false,
    unlockXP: 800,
    upgradeCost: 200,
    description: 'Massive and merciless. Slam through traffic with authority.',
    stats: {
      speed: 4,
      nitro: 5,
      brake: 4,
      handling: 3,
      acceleration: 3,
      health: 200,
      drift: 0.1,
    },
  },

  // ── 6. POLICE CAR ────────────────────────────────────────
  {
    id: 'police-car',
    name: 'Police Car',
    bodyType: 'muscle',
    color: '#536dfe',
    isUnlocked: false,
    unlockXP: 1200,
    upgradeCost: 300,
    description: 'Pursuit-grade power. Lights blazing, always chasing.',
    stats: {
      speed: 7,
      nitro: 8,
      brake: 7,
      handling: 6,
      acceleration: 7,
      health: 100,
      drift: 0.3,
    },
  },

  // ── 7. SUPER RACING CAR ──────────────────────────────────
  {
    id: 'super-racing-car',
    name: 'Super Racing Car',
    bodyType: 'hyper',
    color: '#ff6b00',
    isUnlocked: false,
    unlockXP: 5000,
    upgradeCost: 1000,
    description: 'Track-bred monster. Forged in fire, born for glory.',
    stats: {
      speed: 10,
      nitro: 10,
      brake: 9,
      handling: 9,
      acceleration: 10,
      health: 75,
      drift: 0.6,
    },
  },
];

/** Helper: find a car by ID */
export function getCarById(id: string): Car | undefined {
  return CARS.find((c) => c.id === id);
}

/** Stat ranges for normalization in UI */
export const STAT_MAX = 10;
export const HEALTH_MAX = 200;
