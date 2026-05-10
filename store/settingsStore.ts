// ============================================================
// SHAIKH RACE — Settings Store (Zustand)
// Manages: music, sound, graphics quality
// ============================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GraphicsQuality = 'Low' | 'Medium' | 'High';

interface SettingsState {
  musicOn: boolean;
  soundOn: boolean;
  graphicsQuality: GraphicsQuality;

  toggleMusic: () => void;
  toggleSound: () => void;
  setGraphicsQuality: (q: GraphicsQuality) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      musicOn: true,
      soundOn: true,
      graphicsQuality: 'High',

      toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      setGraphicsQuality: (graphicsQuality) => set({ graphicsQuality }),
    }),
    {
      name: 'shaikh-race-settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
