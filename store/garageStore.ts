// ============================================================
// SHAIKH RACE — Garage Store (Zustand)
// Manages: car roster, active car selection, upgrades
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CARS } from '@/data/cars';
import type { Car, CarId, CarUpgrade, UpgradeMap } from '@/types/game';

// ----- INITIAL UPGRADE MAP -----

function buildInitialUpgrades(): UpgradeMap {
  const map = {} as UpgradeMap;
  for (const car of CARS) {
    map[car.id as CarId] = {
      level: 0,
      maxLevel: 5,
      costPerLevel: car.upgradeCost,
    };
  }
  return map;
}

// ----- STORE INTERFACE -----

interface GarageState {
  // Car list (mutable — unlocks persist)
  cars: Car[];

  // Currently selected car
  activeCarId: CarId;

  // Upgrade records per car
  upgrades: UpgradeMap;

  // Player's coin wallet (persisted)
  wallet: number;

  // ----- Actions -----

  /** Set the active (selected) car */
  selectCar: (id: CarId) => void;

  /** Unlock a car (spend wallet coins) — returns success */
  unlockCar: (id: CarId) => boolean;

  /** Upgrade a car by one level — returns success */
  upgradeCar: (id: CarId) => boolean;

  /** Update a car's color */
  updateCarColor: (id: CarId, color: string) => void;

  /** Add coins to wallet (called from gameStore on session end) */
  depositCoins: (amount: number) => void;

  /** Spend coins from wallet */
  spendCoins: (amount: number) => boolean;

  // ----- Computed helpers -----

  /** Get the active car object */
  getActiveCar: () => Car;

  /** Get effective stats of a car (applying upgrade bonuses) */
  getEffectiveStats: (id: CarId) => Car['stats'];

  /** Get upgrade for a given car */
  getUpgrade: (id: CarId) => CarUpgrade;
}

// ----- UPGRADE BONUS CALCULATOR -----
// Each upgrade level grants +5% to all numeric stats

function applyUpgrades(car: Car, upgrade: CarUpgrade): Car['stats'] {
  const bonus = 1 + upgrade.level * 0.08; // 8% per level
  return {
    speed:        Math.min(10, car.stats.speed * bonus),
    nitro:        Math.min(10, car.stats.nitro * bonus),
    brake:        Math.min(10, car.stats.brake * bonus),
    handling:     Math.min(10, car.stats.handling * bonus),
    acceleration: Math.min(10, car.stats.acceleration * bonus),
    health:       Math.round(car.stats.health * bonus),
    drift:        Math.min(0.9, car.stats.drift),
  };
}

// ----- STORE -----

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      // ── State ─────────────────────────────────────────────
      cars: CARS.map((c) => ({ ...c })),
      activeCarId: 'basic-car',
      upgrades: buildInitialUpgrades(),
      wallet: 0,

      // ── Actions ───────────────────────────────────────────

      selectCar: (id) => {
        const car = get().cars.find((c) => c.id === id);
        if (!car) return;
        if (!car.isUnlocked) return; // must be unlocked first
        set({ activeCarId: id });
      },

      unlockCar: (id) => {
        const state = get();
        const car = state.cars.find((c) => c.id === id);
        if (!car || car.isUnlocked) return false;

        // For demo: unlock costs upgradeCost * 10 coins
        const cost = car.upgradeCost * 10;
        if (state.wallet < cost) return false;

        set((s) => ({
          wallet: s.wallet - cost,
          cars: s.cars.map((c) =>
            c.id === id ? { ...c, isUnlocked: true } : c
          ),
        }));
        return true;
      },

      upgradeCar: (id) => {
        const state = get();
        const upgrade = state.upgrades[id as CarId];
        if (!upgrade) return false;
        if (upgrade.level >= upgrade.maxLevel) return false;

        const cost = upgrade.costPerLevel * (upgrade.level + 1);
        if (state.wallet < cost) return false;

        set((s) => ({
          wallet: s.wallet - cost,
          upgrades: {
            ...s.upgrades,
            [id]: { ...upgrade, level: upgrade.level + 1 },
          },
        }));
        return true;
      },

      updateCarColor: (id, color) => {
        set((s) => ({
          cars: s.cars.map((c) => (c.id === id ? { ...c, color } : c)),
        }));
      },

      depositCoins: (amount) =>
        set((s) => ({ wallet: s.wallet + amount })),


      spendCoins: (amount) => {
        const state = get();
        if (state.wallet < amount) return false;
        set((s) => ({ wallet: s.wallet - amount }));
        return true;
      },

      // ── Computed Helpers ──────────────────────────────────

      getActiveCar: () => {
        const state = get();
        return (
          state.cars.find((c) => c.id === state.activeCarId) ?? state.cars[0]
        );
      },

      getEffectiveStats: (id) => {
        const state = get();
        const car = state.cars.find((c) => c.id === id);
        const upgrade = state.upgrades[id];
        if (!car || !upgrade) {
          // fallback to base stats
          return CARS[0].stats;
        }
        return applyUpgrades(car, upgrade);
      },

      getUpgrade: (id) => {
        return get().upgrades[id] ?? { level: 0, maxLevel: 5, costPerLevel: 50 };
      },
    }),
    {
      name: 'shaikh-race-garage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these keys
      partialize: (state) => ({
        cars: state.cars,
        activeCarId: state.activeCarId,
        upgrades: state.upgrades,
        wallet: state.wallet,
      }),
    }
  )
);

// ── Selectors ────────────────────────────────────────────────

export const selectCars        = (s: GarageState) => s.cars;
export const selectActiveCar   = (s: GarageState) => s.getActiveCar();
export const selectActiveCarId = (s: GarageState) => s.activeCarId;
export const selectUpgrades    = (s: GarageState) => s.upgrades;
export const selectWallet      = (s: GarageState) => s.wallet;
