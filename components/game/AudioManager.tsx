// ============================================================
// SHAIKH RACE — AudioManager Component
// ============================================================

'use client';

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';

export default function AudioManager() {
  const musicOn = useSettingsStore((s) => s.musicOn);
  const soundOn = useSettingsStore((s) => s.soundOn);
  const phase = useGameStore((s) => s.phase);
  const playerSpeed = useGameStore((s) => s.player.speed);

  // Background Music
  const bgmRef = useRef<Howl | null>(null);
  // Engine Sound (Persistent loop)
  const engineRef = useRef<Howl | null>(null);

  // Initial setup for Background Music
  useEffect(() => {
    bgmRef.current = new Howl({
      src: ['/audio/bgm-race.mp3'],
      loop: true,
      volume: 0.3,
      html5: true, // Use HTML5 Audio for large files
    });

    engineRef.current = new Howl({
      src: ['/audio/engine-loop.mp3'],
      loop: true,
      volume: 0,
    });

    return () => {
      bgmRef.current?.unload();
      engineRef.current?.unload();
    };
  }, []);

  // Handle BGM playback based on settings and game phase
  useEffect(() => {
    if (!bgmRef.current) return;

    if (musicOn && (phase === 'playing' || phase === 'paused' || phase === 'menu')) {
      if (!bgmRef.current.playing()) bgmRef.current.play();
    } else {
      bgmRef.current.pause();
    }
  }, [musicOn, phase]);

  // Handle Engine sound playback and pitch based on speed
  useEffect(() => {
    if (!engineRef.current) return;

    if (soundOn && phase === 'playing') {
      if (!engineRef.current.playing()) engineRef.current.play();
      
      // Dynamic pitch based on speed (simple linear mapping)
      // speed 0-300 -> rate 0.8-2.0
      const rate = 0.8 + (playerSpeed / 300) * 1.2;
      engineRef.current.rate(Math.min(2.0, rate));
      
      // Dynamic volume
      const volume = 0.2 + (playerSpeed / 300) * 0.4;
      engineRef.current.volume(Math.min(0.6, volume));
    } else {
      engineRef.current.stop();
    }
  }, [soundOn, phase, playerSpeed]);

  return null;
}
