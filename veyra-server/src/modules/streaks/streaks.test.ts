/** Streaks unit tests. */
import { describe, it, expect } from 'vitest';
import { streaksService } from './streaks.service.js';

describe('Streaks Module', () => {
  const testUserId = 'usr_test_streaks';

  it('records initial daily check-in as day 1', async () => {
    const res = await streaksService.recordDailyActivity(testUserId, '2026-10-01');
    expect(res.streak.current).toBe(1);
    expect(res.streak.longest).toBe(1);
    expect(res.streak.lastActiveDate).toBe('2026-10-01');
  });

  it('increments streak on consecutive day', async () => {
    const res = await streaksService.recordDailyActivity(testUserId, '2026-10-02');
    expect(res.streak.current).toBe(2);
    expect(res.streak.longest).toBe(2);
    expect(res.increased).toBe(true);
  });

  it('resets streak to 1 if a day was skipped', async () => {
    // Skip to 2026-10-05 (missed Oct 3 and Oct 4)
    const res = await streaksService.recordDailyActivity(testUserId, '2026-10-05');
    expect(res.streak.current).toBe(1);
    expect(res.streak.longest).toBe(2); // Retains personal best!
    expect(res.reset).toBe(true);
  });
});
