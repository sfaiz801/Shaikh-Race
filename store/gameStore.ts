// ============================================================
// SHAIKH RACE — Game Store (Zustand)
// Manages: phase, player stats, coins, health, nitro, speed,
//          traffic, coins on road, input state
// ============================================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  GamePhase,
  PlayerState,
  TrafficCar,
  Coin,
  InputState,
} from '@/types/game';

// ----- DEFAULTS -----

const DEFAULT_PLAYER: PlayerState = {
  speed: 0,
  maxSpeed: 180,
  health: 100,
  nitro: 100,
  nitroActive: false,
  coins: 0,
  distance: 0,
  xp: 0,
  score: 0,
};

const DEFAULT_INPUT: InputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  nitro: false,
  brake: false,
  steering: 0,
  acceleration: 0,
};

// ----- STORE INTERFACE -----

interface GameState {
  // Phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Environment
  activeMapId: string;
  setActiveMapId: (mapId: string) => void;
  dayNightMode: 'day' | 'night';
  toggleDayNightMode: () => void;

  // Player
  player: PlayerState;
  setSpeed: (speed: number) => void;
  setMaxSpeed: (maxSpeed: number) => void;
  addCoins: (amount: number) => void;
  takeDamage: (amount: number) => void;
  healPlayer: (amount: number) => void;
  setNitro: (nitro: number) => void;
  setNitroActive: (active: boolean) => void;
  addDistance: (meters: number) => void;
  addXP: (xp: number) => void;
  addScore: (pts: number) => void;

  // Input
  input: InputState;
  setInput: (partial: Partial<InputState>) => void;

  // Traffic
  trafficCars: TrafficCar[];
  setTrafficCars: (cars: TrafficCar[]) => void;
  updateTrafficCar: (id: string, partial: Partial<TrafficCar>) => void;

  // Coins on road
  roadCoins: Coin[];
  setRoadCoins: (coins: Coin[]) => void;
  collectCoin: (id: string) => void;

  // Game lifecycle
  startGame: (maxSpeed: number, startHealth: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // High score
  highScore: number;
}

// ----- STORE -----

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // ── Phase ───────────────────────────────────────────────
    phase: 'menu',
    setPhase: (phase) => set({ phase }),

    // ── Environment ─────────────────────────────────────────
    activeMapId: 'city',
    setActiveMapId: (activeMapId) => set({ activeMapId }),
    dayNightMode: 'night',
    toggleDayNightMode: () => set((s) => ({ dayNightMode: s.dayNightMode === 'day' ? 'night' : 'day' })),

    // ── Player ──────────────────────────────────────────────
    player: { ...DEFAULT_PLAYER },

    setSpeed: (speed) =>
      set((s) => ({ player: { ...s.player, speed } })),

    setMaxSpeed: (maxSpeed) =>
      set((s) => ({ player: { ...s.player, maxSpeed } })),

    addCoins: (amount) =>
      set((s) => ({
        player: {
          ...s.player,
          coins: s.player.coins + amount,
          score: s.player.score + amount * 10,
        },
      })),

    takeDamage: (amount) =>
      set((s) => {
        const health = Math.max(0, s.player.health - amount);
        if (health <= 0 && s.phase === 'playing') {
          return {
            player: { ...s.player, health },
            phase: 'game-over' as GamePhase,
            highScore: Math.max(s.highScore, s.player.score),
          };
        }
        return { player: { ...s.player, health } };
      }),

    healPlayer: (amount) =>
      set((s) => ({
        player: { ...s.player, health: Math.min(100, s.player.health + amount) },
      })),

    setNitro: (nitro) =>
      set((s) => ({ player: { ...s.player, nitro: Math.min(100, Math.max(0, nitro)) } })),

    setNitroActive: (nitroActive) =>
      set((s) => ({ player: { ...s.player, nitroActive } })),

    addDistance: (meters) =>
      set((s) => {
        const distance = s.player.distance + meters;
        const scoreGain = Math.floor(meters * 0.5);
        const xpGain = Math.floor(meters * 0.1);
        return {
          player: {
            ...s.player,
            distance,
            score: s.player.score + scoreGain,
            xp: s.player.xp + xpGain,
          },
        };
      }),

    addXP: (xp) =>
      set((s) => ({ player: { ...s.player, xp: s.player.xp + xp } })),

    addScore: (pts) =>
      set((s) => ({ player: { ...s.player, score: s.player.score + pts } })),

    // ── Input ───────────────────────────────────────────────
    input: { ...DEFAULT_INPUT },
    setInput: (partial) =>
      set((s) => ({ input: { ...s.input, ...partial } })),

    // ── Traffic ─────────────────────────────────────────────
    trafficCars: [],
    setTrafficCars: (trafficCars) => set({ trafficCars }),
    updateTrafficCar: (id, partial) =>
      set((s) => ({
        trafficCars: s.trafficCars.map((c) =>
          c.id === id ? { ...c, ...partial } : c
        ),
      })),

    // ── Road Coins ──────────────────────────────────────────
    roadCoins: [],
    setRoadCoins: (roadCoins) => set({ roadCoins }),
    collectCoin: (id) => {
      const state = get();
      if (state.phase !== 'playing') return;
      set((s) => ({
        roadCoins: s.roadCoins.map((c) =>
          c.id === id ? { ...c, collected: true } : c
        ),
      }));
      state.addCoins(1);
    },

    // ── Lifecycle ───────────────────────────────────────────
    startGame: (maxSpeed, startHealth) =>
      set({
        phase: 'playing',
        player: { ...DEFAULT_PLAYER, maxSpeed, health: startHealth },
        input: { ...DEFAULT_INPUT },
        trafficCars: [],
        roadCoins: [],
      }),

    pauseGame: () => {
      if (get().phase === 'playing') set({ phase: 'paused' });
    },

    resumeGame: () => {
      if (get().phase === 'paused') set({ phase: 'playing' });
    },

    endGame: () =>
      set((s) => ({
        phase: 'game-over',
        highScore: Math.max(s.highScore, s.player.score),
      })),

    resetGame: () =>
      set((s) => ({
        phase: 'menu',
        player: { ...DEFAULT_PLAYER },
        input: { ...DEFAULT_INPUT },
        trafficCars: [],
        roadCoins: [],
        // keep highScore persistent
        highScore: s.highScore,
      })),

    highScore: 0,
  }))
);

// ── Selectors (memoized access) ──────────────────────────────

export const selectPhase        = (s: GameState) => s.phase;
export const selectPlayer       = (s: GameState) => s.player;
export const selectSpeed        = (s: GameState) => s.player.speed;
export const selectHealth       = (s: GameState) => s.player.health;
export const selectNitro        = (s: GameState) => s.player.nitro;
export const selectNitroActive  = (s: GameState) => s.player.nitroActive;
export const selectCoins        = (s: GameState) => s.player.coins;
export const selectDistance     = (s: GameState) => s.player.distance;
export const selectScore        = (s: GameState) => s.player.score;
export const selectInput        = (s: GameState) => s.input;
export const selectTrafficCars  = (s: GameState) => s.trafficCars;
export const selectRoadCoins    = (s: GameState) => s.roadCoins;
export const selectHighScore    = (s: GameState) => s.highScore;
export const selectActiveMapId  = (s: GameState) => s.activeMapId;
export const selectDayNightMode = (s: GameState) => s.dayNightMode;
