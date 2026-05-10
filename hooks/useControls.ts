// ============================================================
// SHAIKH RACE — useControls hook
// Keyboard + touch input management.
// Returns stable InputState ref AND reactive booleans.
// ============================================================

import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { InputState } from '@/types/game';

const KEY_MAP: Record<string, keyof InputState> = {
  ArrowUp:    'forward',
  KeyW:       'forward',
  ArrowDown:  'backward',
  KeyS:       'backward',
  ArrowLeft:  'left',
  KeyA:       'left',
  ArrowRight: 'right',
  KeyD:       'right',
  ShiftLeft:  'nitro',
  ShiftRight: 'nitro',
  Space:      'brake',
};

export interface ControlsAPI {
  /** Ref updated every frame — safe to use inside useFrame without triggering re-renders */
  inputRef: React.MutableRefObject<InputState>;
  /** Call from touch event handlers */
  setTouchInput: (partial: Partial<InputState>) => void;
}

export function useControls(): ControlsAPI {
  const setInput    = useGameStore((s) => s.setInput);
  const pauseGame   = useGameStore((s) => s.pauseGame);
  const resumeGame  = useGameStore((s) => s.resumeGame);

  const inputRef = useRef<InputState>({
    forward:  false,
    backward: false,
    left:     false,
    right:    false,
    nitro:    false,
    brake:    false,
    steering: 0,
    acceleration: 0,
  });

  // ── Keyboard down ───────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        const phase = useGameStore.getState().phase;
        phase === 'playing' ? pauseGame() : resumeGame();
        return;
      }
      const key = KEY_MAP[e.code];
      if (!key) return;
      e.preventDefault();
      if (inputRef.current[key]) return; // avoid repeat events
      inputRef.current = { ...inputRef.current, [key]: true };
      
      // Update steering/acceleration
      const s = inputRef.current;
      s.steering = (s.right ? 1 : 0) - (s.left ? 1 : 0);
      s.acceleration = s.forward ? 1 : 0;

      setInput({ [key]: true, steering: s.steering, acceleration: s.acceleration });
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const key = KEY_MAP[e.code];
      if (!key) return;
      inputRef.current = { ...inputRef.current, [key]: false };

      // Update steering/acceleration
      const s = inputRef.current;
      s.steering = (s.right ? 1 : 0) - (s.left ? 1 : 0);
      s.acceleration = s.forward ? 1 : 0;

      setInput({ [key]: false, steering: s.steering, acceleration: s.acceleration });
    };

    window.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [setInput, pauseGame, resumeGame]);

  // ── Touch / joystick ────────────────────────────────────
  const setTouchInput = useCallback(
    (partial: Partial<InputState>) => {
      inputRef.current = { ...inputRef.current, ...partial };
      setInput(partial);
    },
    [setInput]
  );

  return { inputRef, setTouchInput };
}
