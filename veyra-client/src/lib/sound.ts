/**
 * Web Audio API synthesizer for habit rewards, level up fanfare, and streak milestones.
 * Zero external audio files required — ultra fast, lightweight, and offline capable.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('veyra_sound_enabled');
  return stored !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('veyra_sound_enabled', enabled ? 'true' : 'false');
}

/** Trigger mobile haptic feedback if supported by browser/device. */
export function triggerHaptic(pattern: number | number[] = 20): void {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Play an uplifting dual-tone chime when checking off a habit (+10 XP).
 */
export function playHabitChime(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic(25);

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First Tone: C6 (1046.5 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(1046.5, now);
  gain1.gain.setValueAtTime(0.15, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  // Second Harmonizing Tone: E6 (1318.5 Hz) slightly delayed
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(1318.5, now + 0.08);
  gain2.gain.setValueAtTime(0.12, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.36);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.46);
}

/**
 * Play a victorious ascending 4-note arpeggio upon leveling up.
 */
export function playLevelUpFanfare(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic([40, 60, 40, 100]);

  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const start = ctx.currentTime;

  notes.forEach((freq, index) => {
    const noteTime = start + index * 0.12;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = index === notes.length - 1 ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    const duration = index === notes.length - 1 ? 0.7 : 0.25;
    gain.gain.setValueAtTime(0.2, noteTime);
    gain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + duration);
  });
}

/**
 * Play a fire whoosh / sizzle effect when a streak milestone is reached.
 */
export function playStreakWhoosh(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic([30, 40, 50]);

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.31);
}

/**
 * Play a gentle, elegant dual-tone chime when a notification pops up.
 */
export function playNotificationChime(): void {
  if (!isSoundEnabled()) return;
  triggerHaptic([30, 50, 40]);

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.setValueAtTime(880, now + 0.1); // A5
  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.41);
}
