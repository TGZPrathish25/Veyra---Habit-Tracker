/** Friends module unit tests — requests, bilateral friendships, and 4-tier privacy enforcement. */
import { describe, it, expect } from 'vitest';
import { friendsService } from './friends.service.js';

describe('Friends Module', () => {
  const userId = 'demo-user-id';
  const friend1 = 'demo-user-1'; // Alex Rivera (detailed)
  const friend2 = 'demo-user-2'; // Maya Chen (counts)

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
    expect(feed.length).toBeGreaterThan(0);
    expect(feed[0]).toHaveProperty('actionType');
  });
});
