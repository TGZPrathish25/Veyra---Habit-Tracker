/** Challenges module unit tests — creation, participation, and progress completion. */
import { describe, it, expect, beforeAll } from 'vitest';
import { challengesService } from './challenges.service.js';

describe('Challenges Module', () => {
  const userId = 'usr_test_challenger';
  const userName = 'Test Challenger';
  let createdChallengeId: string;

  beforeAll(async () => {
    const c1 = await challengesService.createChallenge(userId, userName, {
      title: '30-Day Morning Consistency',
      description: 'Wake up early and complete habits',
      type: 'daily_streak',
      targetValue: 30,
      rewardXp: 300,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      isPublic: true,
    });
    createdChallengeId = c1.id;

    await challengesService.createChallenge('usr_other_creator', 'Other Creator', {
      title: '100 Habits Sprint',
      description: 'Complete 100 habits this month',
      type: 'task_count',
      targetValue: 100,
      rewardXp: 500,
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      isPublic: true,
    });
  });

  it('lists challenges with participant metadata', async () => {
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
    expect(myChallenges.length).toBeGreaterThanOrEqual(1);
    for (const c of myChallenges) {
      expect(c.isJoined).toBe(true);
    }
  });

  it('fetches a challenge by ID along with its participant leaderboard', async () => {
    const { challenge, participants } = await challengesService.getChallenge(createdChallengeId, userId);
    expect(challenge.id).toBe(createdChallengeId);
    expect(challenge.title).toBe('30-Day Morning Consistency');
    expect(Array.isArray(participants)).toBe(true);
    expect(participants.length).toBeGreaterThan(0);
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
    const challenges = await challengesService.listChallenges(userId, 'all');
    const target = challenges.find((c) => !c.isJoined);
    if (target) {
      const participant = await challengesService.joinChallenge(target.id, userId, userName);
      expect(participant.challengeId).toBe(target.id);
      expect(participant.userId).toBe(userId);
    }
  });

  it('updates participant progress and awards bonus XP on milestone completion', async () => {
    const sprint = await challengesService.createChallenge(userId, userName, {
      title: '7-Day Quick Sprint',
      type: 'daily_streak',
      targetValue: 7,
      rewardXp: 200,
      startDate: '2026-10-01',
      endDate: '2026-10-08',
      isPublic: true,
    });

    const result = await challengesService.updateProgress(sprint.id, userId, {
      progress: 7,
    });

    expect(result.participant.progress).toBe(7);
    expect(result.participant.completed).toBe(true);
    expect(result.xpAwarded).toBe(200);
  });

  it('allows user to leave a challenge', async () => {
    const sprint = await challengesService.createChallenge(userId, userName, {
      title: 'Leave Test Challenge',
      type: 'daily_streak',
      targetValue: 5,
      rewardXp: 100,
      startDate: '2026-10-01',
      endDate: '2026-10-06',
      isPublic: true,
    });

    const result = await challengesService.leaveChallenge(sprint.id, userId);
    expect(result.success).toBe(true);
  });
});
