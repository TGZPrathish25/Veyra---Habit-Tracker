/** Gamification & achievements unit tests. */
import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  calculateLevelFromXp,
  getLevelProgress,
  gamificationService,
} from './gamification.service.js';

describe('Gamification Module', () => {
  const testUserId = 'usr_test_gamification';

  it('calculates RPG level progression curves properly', () => {
    expect(calculateLevelFromXp(0)).toBe(1);
    expect(calculateLevelFromXp(199)).toBe(1);
    expect(calculateLevelFromXp(200)).toBe(2);
    expect(calculateLevelFromXp(600)).toBe(3);
    expect(calculateLevelFromXp(1200)).toBe(4);

    const progress = getLevelProgress(100);
    expect(progress.level).toBe(1);
    expect(progress.progressPercentage).toBe(50); // 100 / 200 = 50%
  });

  it('adds XP and triggers level up when crossing threshold', async () => {
    const res1 = await gamificationService.addXp(testUserId, 150, 1);
    expect(res1.totalXp).toBe(150);
    expect(res1.level).toBe(1);
    expect(res1.leveledUp).toBe(false);

    const res2 = await gamificationService.addXp(testUserId, 100, 1); // 250 XP
    expect(res2.totalXp).toBe(250);
    expect(res2.level).toBe(2);
    expect(res2.leveledUp).toBe(true);
  });

  it('evaluates and unlocks achievements based on criteria', async () => {
    const unlocked = await gamificationService.evaluateAchievements(testUserId, {
      tasksCompleted: 1,
      currentStreak: 3,
    });

    expect(unlocked.length).toBeGreaterThan(0);
    const keys = unlocked.map((u) => u.key);
    expect(keys).toContain('first_step');
    expect(keys).toContain('streak_3');

    // Should not unlock duplicate if evaluated again
    const secondPass = await gamificationService.evaluateAchievements(testUserId, {
      tasksCompleted: 1,
      currentStreak: 3,
    });
    expect(secondPass.length).toBe(0);
  });
});
