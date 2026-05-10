// ============================================================
// SHAIKH RACE — useAudio Hook
// ============================================================

import { useCallback } from 'react';
import { Howl } from 'howler';
import { useSettingsStore } from '@/store/settingsStore';

// Define sound types
type SoundType = 'ui-click' | 'engine-start' | 'nitro' | 'crash' | 'coin' | 'drift';

// Sound registry (placeholder URLs - should be replaced with actual assets)
const SOUNDS: Record<SoundType, string> = {
  'ui-click': '/audio/ui-click.mp3',
  'engine-start': '/audio/engine-start.mp3',
  'nitro': '/audio/nitro.mp3',
  'crash': '/audio/crash.mp3',
  'coin': '/audio/coin.mp3',
  'drift': '/audio/drift.mp3',
};

// Internal cache for Howl instances
const cache: Partial<Record<SoundType, Howl>> = {};

export function useAudio() {
  const soundOn = useSettingsStore((s) => s.soundOn);

  const playSound = useCallback((type: SoundType, options: { volume?: number; loop?: boolean } = {}) => {
    if (!soundOn) return;

    if (!cache[type]) {
      cache[type] = new Howl({
        src: [SOUNDS[type]],
        volume: options.volume ?? 0.5,
        loop: options.loop ?? false,
      });
    }

    const sound = cache[type]!;
    if (options.volume !== undefined) sound.volume(options.volume);
    
    if (options.loop && sound.playing()) return; // Already looping
    
    sound.play();
  }, [soundOn]);

  const stopSound = useCallback((type: SoundType) => {
    cache[type]?.stop();
  }, []);

  return { playSound, stopSound };
}
