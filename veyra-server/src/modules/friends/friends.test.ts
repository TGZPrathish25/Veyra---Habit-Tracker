/** Friends module unit tests — requests, bilateral friendships, and 4-tier privacy enforcement. */
import { describe, it, expect, beforeAll } from 'vitest';
import { friendsService } from './friends.service.js';
import { friendsRepository } from './friends.repository.js';
import { tasksRepository } from '../tasks/tasks.repository.js';

describe('Friends Module', () => {
  const userId = 'usr_test_social_main';
  const friend1 = 'usr_test_friend_1'; // Alex Rivera (detailed)
  const friend2 = 'usr_test_friend_2'; // Maya Chen (counts)

  beforeAll(async () => {
    friendsRepository.seedTestUser({
      id: userId,
      name: 'Main Adventurer',
      username: 'main_adv',
      avatarUrl: null,
      level: 5,
      totalXp: 1200,
      currentStreak: 12,
    });

    friendsRepository.seedTestUser({
      id: friend1,
      name: 'Alex Rivera',
      username: 'arivera',
      avatarUrl: null,
      level: 4,
      totalXp: 950,
      currentStreak: 8,
    });

    friendsRepository.seedTestUser({
      id: friend2,
      name: 'Maya Chen',
      username: 'mchen',
      avatarUrl: null,
      level: 6,
      totalXp: 1800,
      currentStreak: 15,
    });

    friendsRepository.seedTestFriendship(userId, friend1, 'detailed');
    friendsRepository.seedTestFriendship(friend1, userId, 'detailed');
    friendsRepository.seedTestFriendship(userId, friend2, 'counts');
    friendsRepository.seedTestFriendship(friend2, userId, 'counts');

    // Create a task for friend1 so task details can be verified in getFriendProgress
    await tasksRepository.createTask(friend1, {
      title: 'Deep Focus Morning Work',
      description: '90 minutes uninterrupted coding',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });
  });

  it('lists current friends for the authenticated user', async () => {
    const friends = await friendsService.listFriends(userId);
    expect(Array.isArray(friends)).toBe(true);
    expect(friends.length).toBeGreaterThanOrEqual(1);
    expect(friends[0]).toHaveProperty('friend');
    expect(friends[0].friend).toHaveProperty('username');
  });

  it('rejects sending friend requests to oneself', async () => {
    await expect(
      friendsService.sendFriendRequest(userId, { targetUserId: userId })
    ).rejects.toThrow('Cannot send a friend request to yourself');
  });

  it('rejects sending friend request when already friends', async () => {
    await expect(
      friendsService.sendFriendRequest(userId, { targetUserId: friend1 })
    ).rejects.toThrow('already friends');
  });

  it('enforces Level 2 (counts) privacy filtering: masks task titles', async () => {
    const progress = await friendsService.getFriendProgress(userId, friend2);
    expect(progress.privacyLevel).toBe('counts');
    expect(progress.completionPercentage).toBeDefined();
    expect(progress.completedTasks).toBeDefined();
    expect(progress.totalTasks).toBeDefined();
    // Task titles should be masked (undefined)
    expect(progress.tasks).toBeUndefined();
  });

  it('enforces Level 3 (detailed) privacy filtering: shows titles & status but masks descriptions', async () => {
    const progress = await friendsService.getFriendProgress(userId, friend1);
    expect(progress.privacyLevel).toBe('detailed');
    expect(progress.tasks).toBeDefined();
    expect(progress.tasks!.length).toBeGreaterThan(0);
    expect(progress.tasks![0]).toHaveProperty('title');
    expect(progress.tasks![0]).toHaveProperty('completed');
    // Task descriptions should be masked (not present on item)
    expect((progress.tasks![0] as Record<string, unknown>).description).toBeUndefined();
  });

  it('allows updating friendship privacy level', async () => {
    const updated = await friendsService.setPrivacyLevel(userId, friend1, 'full');
    expect(updated.privacyLevel).toBe('full');

    // Reset back to detailed
    await friendsService.setPrivacyLevel(userId, friend1, 'detailed');
  });

  it('lists incoming and outgoing friend requests', async () => {
    const requests = await friendsService.listRequests(userId);
    expect(requests).toHaveProperty('incoming');
    expect(requests).toHaveProperty('outgoing');
    expect(Array.isArray(requests.incoming)).toBe(true);
  });

  it('returns activity feed for social updates', async () => {
    const feed = await friendsService.getActivityFeed(userId);
    expect(Array.isArray(feed)).toBe(true);
  });

  it('discovers all users with friendship status and add button state', async () => {
    const discovered = await friendsService.discoverUsers(userId);
    expect(Array.isArray(discovered)).toBe(true);
    expect(discovered.length).toBeGreaterThan(0);

    // Current user should not be in the list
    expect(discovered.some((u) => u.id === userId)).toBe(false);

    // friend1 should have status 'friends'
    const f1 = discovered.find((u) => u.id === friend1);
    expect(f1).toBeDefined();
    expect(f1?.friendshipStatus).toBe('friends');
  });
});
