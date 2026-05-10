// ============================================================
// SHAIKH RACE — Shared TypeScript Types
// ============================================================

// ----- CAR TYPES -----

export type CarId =
  | 'basic-car'
  | 'sports-car'
  | 'suv'
  | 'hypercar'
  | 'truck'
  | 'police-car'
  | 'super-racing-car';

export interface CarStats {
  /** Top speed multiplier (1–10) */
  speed: number;
  /** Nitro boost potency (1–10) */
  nitro: number;
  /** Braking power (1–10) */
  brake: number;
  /** Turn responsiveness (1–10) */
  handling: number;
  /** Time-to-speed rating (1–10) */
  acceleration: number;
  /** Starting health pool (50–200) */
  health: number;
  /** Drift coefficient (0.0–1.0) */
  drift: number;
}

export interface CarUpgrade {
  level: number;           // Current upgrade level (0–5)
  maxLevel: number;        // Always 5
  costPerLevel: number;    // Coins per level-up
}

export interface Car {
  id: CarId;
  name: string;
  stats: CarStats;
  /** XP required to unlock this car */
  unlockXP: number;
  /** Coin cost to upgrade (per level) */
  upgradeCost: number;
  /** CSS / Three.js hex color string */
  color: string;
  isUnlocked: boolean;
  /** Visual description used for 3D mesh variants */
  bodyType: 'sedan' | 'sport' | 'suv' | 'hyper' | 'truck' | 'muscle';
  description: string;
}

// ----- GAME STATE TYPES -----

export type GamePhase = 'menu' | 'garage' | 'playing' | 'paused' | 'game-over';

export interface PlayerState {
  speed: number;         // Current speed in km/h
  maxSpeed: number;      // Max speed for current car
  health: number;        // 0–100
  nitro: number;         // 0–100
  nitroActive: boolean;
  coins: number;
  distance: number;      // Meters traveled
  xp: number;
  score: number;
}

// ----- TRAFFIC TYPES -----

export interface TrafficCar {
  id: string;
  laneIndex: number;     // 0, 1, 2 (left, center, right)
  position: [number, number, number];
  speed: number;
  color: string;
  isActive: boolean;
}

// ----- COIN TYPES -----

export interface Coin {
  id: string;
  position: [number, number, number];
  collected: boolean;
}

// ----- INPUT STATE -----

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  nitro: boolean;
  brake: boolean;
  /** Steering value from -1 (left) to 1 (right) */
  steering: number;
  /** Acceleration value from 0 to 1 */
  acceleration: number;
}

// ----- UPGRADE RECORD -----

export type UpgradeMap = Record<CarId, CarUpgrade>;

// ----- ROAD SEGMENT -----

export interface RoadSegment {
  id: number;
  zPosition: number;
}

// ----- MAP TYPES -----

export type MapId = 'city' | 'highway' | 'desert' | 'neon_cyber';

export interface MapData {
  id: MapId;
  name: string;
  bgColor: string;
  fogColor: string;
  fogDensity: number;
  lightIntensity: number;
  ambientColor: string;
  unlockXP: number;
  description: string;
}

