/** Global leaderboard — unit tests. */
import { describe, it, expect } from 'vitest';
import { leaderboardService } from './leaderboard.service.js';
import { persistentStore } from '../../db/persistentStore.js';

describe('leaderboard module', () => {
  it('returns sorted global leaderboard by XP', async () => {
    // Ensure test user exists in persistent store
    await persistentStore.saveUser({
      id: 'usr_test_board_1',
      firebaseUid: 'uid_board_1',
      email: 'board1@veyra.app',
      name: 'Leader One',
      username: 'leader_one',
      avatarUrl: null,
      timezone: 'UTC',
      xp: 2500,
      level: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await persistentStore.saveUser({
      id: 'usr_test_board_2',
      firebaseUid: 'uid_board_2',
      email: 'board2@veyra.app',
      name: 'Leader Two',
      username: 'leader_two',
      avatarUrl: null,
      timezone: 'UTC',
      xp: 5000,
      level: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const entries = await leaderboardService.getLeaderboard('xp');
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(2);

    const first = entries[0];
    const second = entries[1];
    expect(first.rank).toBe(1);
    expect(second.rank).toBe(2);
    expect(first.totalXp).toBeGreaterThanOrEqual(second.totalXp);
  });

  it('returns sorted global leaderboard by Streak', async () => {
    const entries = await leaderboardService.getLeaderboard('streak');
    expect(Array.isArray(entries)).toBe(true);
    expect(entries[0].rank).toBe(1);
  });
});
