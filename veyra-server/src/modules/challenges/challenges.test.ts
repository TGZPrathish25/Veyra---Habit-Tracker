/** Challenges module unit tests — creation, participation, and progress completion. */
import { describe, it, expect } from 'vitest';
import { challengesService } from './challenges.service.js';

describe('Challenges Module', () => {
  const userId = 'demo-user-id';
  const userName = 'Demo Adventurer';

  it('lists seeded challenges with participant metadata', async () => {
    const list = await challengesService.listChallenges(userId);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0]).toHaveProperty('title');
    expect(list[0]).toHaveProperty('targetValue');
    expect(list[0]).toHaveProperty('participantCount');
  });

  it('filters challenges by "my" joined status', async () => {
    const myChallenges = await challengesService.listChallenges(userId, 'my');
    expect(Array.isArray(myChallenges)).toBe(true);
    for (const c of myChallenges) {
      expect(c.isJoined).toBe(true);
    }
  });

  it('fetches a challenge by ID along with its participant leaderboard', async () => {
    const { challenge, participants } = await challengesService.getChallenge('chal-1', userId);
    expect(challenge.id).toBe('chal-1');
    expect(challenge.title).toBe('30-Day Morning Consistency');
    expect(Array.isArray(participants)).toBe(true);
    expect(participants.length).toBeGreaterThan(0);
    // Leaderboard should be ordered by progress descending
    if (participants.length > 1) {
      expect(participants[0].progress).toBeGreaterThanOrEqual(participants[1].progress);
    }
  });

  it('creates a new challenge and automatically enrolls the creator', async () => {
    const newChallenge = await challengesService.createChallenge(userId, userName, {
      title: '14-Day Hydration Sprint',
      description: 'Drink 2.5L water every day for two weeks',
      type: 'daily_streak',
      targetValue: 14,
      rewardXp: 200,
      startDate: '2026-10-05',
      endDate: '2026-10-19',
      isPublic: true,
    });

    expect(newChallenge.id).toBeDefined();
    expect(newChallenge.creatorId).toBe(userId);
    expect(newChallenge.isJoined).toBe(true);
    expect(newChallenge.targetValue).toBe(14);
  });

  it('rejects challenge creation when start date is after end date', async () => {
    await expect(
      challengesService.createChallenge(userId, userName, {
        title: 'Invalid Date Challenge',
        type: 'task_count',
        targetValue: 10,
        startDate: '2026-11-01',
        endDate: '2026-10-01',
      })
    ).rejects.toThrow('Challenge start date cannot be after end date');
  });

  it('allows user to join an existing challenge', async () => {
    // chal-2 is Maya Chen's 100 Habits Sprint
    const participant = await challengesService.joinChallenge('chal-2', userId, userName);
    expect(participant.challengeId).toBe('chal-2');
    expect(participant.userId).toBe(userId);
    expect(participant.progress).toBeGreaterThanOrEqual(0);
  });

  it('updates participant progress and awards bonus XP on milestone completion', async () => {
    // chal-3 target is 7 days, demo user has progress 5
    const result = await challengesService.updateProgress('chal-3', userId, {
      progress: 7, // hits target!
    });

    expect(result.participant.progress).toBe(7);
    expect(result.participant.completed).toBe(true);
    expect(result.xpAwarded).toBe(200); // 200 XP reward for chal-3
  });

  it('allows user to leave a challenge', async () => {
    const result = await challengesService.leaveChallenge('chal-3', userId);
    expect(result.success).toBe(true);
  });
});
