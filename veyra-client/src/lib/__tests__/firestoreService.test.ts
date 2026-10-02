/** Unit tests for direct Firestore client service. */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { firestoreService } from '../firestoreService';

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collection, id) => ({ collection, id })),
  collection: vi.fn((_db, name) => ({ name })),
  setDoc: vi.fn(async () => Promise.resolve()),
  getDoc: vi.fn(async () => ({
    exists: () => true,
    data: () => ({
      uid: 'user-123',
      name: 'Test Adventurer',
      username: 'test_adv',
      level: 4,
    }),
  })),
  getDocs: vi.fn(async () => ({
    docs: [
      {
        id: 'doc-1',
        data: () => ({
          title: 'Daily Meditation',
          completed: true,
        }),
      },
    ],
  })),
  query: vi.fn((coll) => coll),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  updateDoc: vi.fn(async () => Promise.resolve()),
  deleteDoc: vi.fn(async () => Promise.resolve()),
  addDoc: vi.fn(async () => ({ id: 'new-doc-id' })),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  onSnapshot: vi.fn((_q, cb) => {
    cb({
      docs: [
        {
          id: 'occ-1',
          data: () => ({ taskId: 't1', date: '2026-10-02', completed: true }),
        },
      ],
    });
    return vi.fn(); // unsubscribe
  }),
}));

vi.mock('@/config/firebase', () => ({
  db: {},
}));

describe('Firestore Client Service', () => {
  it('upserts user profile without throwing', async () => {
    await expect(
      firestoreService.upsertUserProfile({
        uid: 'user-123',
        name: 'Test Adventurer',
        username: 'test_adv',
      })
    ).resolves.not.toThrow();
  });

  it('fetches user profile successfully', async () => {
    const profile = await firestoreService.getUserProfile('user-123');
    expect(profile).toBeDefined();
    expect(profile?.name).toBe('Test Adventurer');
    expect(profile?.level).toBe(4);
  });

  it('creates task and returns document id', async () => {
    const id = await firestoreService.createTask('user-123', {
      title: 'Workout',
      category: 'DAILY',
      cadence: 'DAILY',
    });
    expect(id).toBe('new-doc-id');
  });

  it('records task occurrence without throwing', async () => {
    await expect(
      firestoreService.recordOccurrence('user-123', 'task-1', '2026-10-02', true)
    ).resolves.not.toThrow();
  });

  it('fetches daily occurrences list', async () => {
    const items = await firestoreService.getDailyOccurrences('user-123', '2026-10-02');
    expect(items.length).toBe(1);
    expect(items[0].id).toBe('doc-1');
  });

  it('saves weekly plan and monthly goal', async () => {
    const planId = await firestoreService.saveWeeklyPlan('user-123', {
      weekStartDate: '2026-09-28',
      title: 'Sprint 1',
      targetCount: 15,
      completedCount: 12,
    });
    expect(planId).toBe('new-doc-id');

    const goalId = await firestoreService.saveMonthlyGoal('user-123', {
      yearMonth: '2026-10',
      title: 'October Consistency',
      targetCount: 30,
      completedCount: 10,
    });
    expect(goalId).toBe('new-doc-id');
  });

  it('subscribes to daily occurrences snapshot', () => {
    const callback = vi.fn();
    const unsub = firestoreService.onDailyOccurrencesSnapshot('user-123', '2026-10-02', callback);
    expect(callback).toHaveBeenCalledWith([
      { id: 'occ-1', taskId: 't1', date: '2026-10-02', completed: true },
    ]);
    expect(typeof unsub).toBe('function');
  });

  it('calculates XP progression and updates gamification', async () => {
    const updated = await firestoreService.addXp('user-123', 50);
    expect(updated).toBeDefined();
    expect(updated?.totalXp).toBe(50);
  });
});

