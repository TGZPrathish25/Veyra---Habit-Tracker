/** Unit tests for sound engine and Web Audio API synthesizer. */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  isSoundEnabled,
  setSoundEnabled,
  playHabitChime,
  playLevelUpFanfare,
  playStreakWhoosh,
  triggerHaptic,
} from '../sound';

describe('Sound Engine & Synthesizer', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    globalThis.localStorage = {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
      clear: () => {
        Object.keys(store).forEach((k) => delete store[k]);
      },
      key: (i: number) => Object.keys(store)[i] ?? null,
      length: Object.keys(store).length,
    } as Storage;
  });

  it('enables sound by default and respects toggle', () => {
    expect(isSoundEnabled()).toBe(true);

    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);

    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('safely invokes playHabitChime without crashing', () => {
    expect(() => playHabitChime()).not.toThrow();
  });

  it('safely invokes playLevelUpFanfare without crashing', () => {
    expect(() => playLevelUpFanfare()).not.toThrow();
  });

  it('safely invokes playStreakWhoosh without crashing', () => {
    expect(() => playStreakWhoosh()).not.toThrow();
  });

  it('safely invokes triggerHaptic with fallback', () => {
    expect(() => triggerHaptic(20)).not.toThrow();
  });
});
