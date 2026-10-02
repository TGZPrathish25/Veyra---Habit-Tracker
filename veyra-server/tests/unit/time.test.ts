/** Unit test — time utilities. */
import { describe, it, expect } from 'vitest';
import { getMonthBoundaries } from '../../src/lib/time.js';

describe('time utilities', () => {
  it('should compute month boundaries', () => {
    const { start, end } = getMonthBoundaries(2026, 1);
    expect(start.getMonth()).toBe(0);
    expect(end.getDate()).toBe(31);
  });
});
