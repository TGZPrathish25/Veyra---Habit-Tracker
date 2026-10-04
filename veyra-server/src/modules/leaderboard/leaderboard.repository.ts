/** Leaderboard repository — queries all registered users with opt-in status and deduplication. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import { persistentStore } from '../../db/persistentStore.js';
import type { LeaderboardEntryDTO, LeaderboardSortMetric } from './leaderboard.types.js';

const BANNED_PATTERNS = [
  'mayachen', 'sam_t', 'samtaylor', 'alex_r', 'alexrivera',
  'jordan_lee', 'jordanlee', 'sarah_k', 'sarahkim',
  'elena_r', 'marcus_v', 'priya_s', 'demo'
];
const BANNED_IDS = [
  'usr_mayachen', 'usr_samtaylor', 'usr_alexrivera', 'usr_jordanlee', 'usr_sarahkim',
  'usr_elena_r', 'usr_marcus_v', 'usr_priya_sharma', 'usr_demo', 'demo', 'mock'
];
const BANNED_NAMES = [
  'sarah kim', 'jordan lee', 'alex rivera', 'sam taylor', 'maya chen',
  'elena rostova', 'marcus vance', 'priya sharma', 'demo user'
];

export class LeaderboardRepository {
  private isDummyUser(u: { id?: string; username?: string | null; email?: string | null; name?: string | null }): boolean {
    if (!u) return true;
    if (u.id && BANNED_IDS.includes(u.id)) return true;
    const uName = u.username?.toLowerCase().trim() || '';
    const name = u.name?.toLowerCase().trim() || '';
    if (BANNED_PATTERNS.some((p) => uName === p || (p === 'demo' && uName.includes('demo')))) return true;
    if (BANNED_NAMES.some((n) => name === n)) return true;
    if (u.email && u.email.toLowerCase().includes('demo@')) return true;
    return false;
  }

  async getGlobalLeaderboard(metric: LeaderboardSortMetric = 'xp', limit = 100): Promise<LeaderboardEntryDTO[]> {
    return tryPrisma(
      async () => {
        const users = await prisma.user.findMany({
          where: {
            AND: [
              {
                OR: [
                  { settings: null },
                  { settings: { leaderboardOptIn: true } },
                ],
              },
              {
                id: { notIn: BANNED_IDS },
              },
              {
                username: { notIn: BANNED_PATTERNS },
              },
            ],
          },
          include: {
            gamification: true,
            streaks: { where: { type: 'daily' } },
            settings: true,
          },
          take: limit,
        });

        const seenIds = new Set<string>();
        const seenUsernames = new Set<string>();
        const entries: LeaderboardEntryDTO[] = [];

        for (const u of users) {
          if (this.isDummyUser(u)) continue;

          const normUser = u.username?.toLowerCase().trim();
          if (seenIds.has(u.id) || (u.firebaseUid && seenIds.has(u.firebaseUid))) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          seenIds.add(u.id);
          if (u.firebaseUid) seenIds.add(u.firebaseUid);
          if (normUser) seenUsernames.add(normUser);

          entries.push({
            id: u.id,
            name: u.name,
            username: u.username,
            avatarUrl: u.avatarUrl,
            level: u.gamification?.level ?? u.level ?? 1,
            totalXp: u.gamification?.totalXp ?? u.xp ?? 0,
            currentStreak: u.streaks[0]?.current ?? 0,
            longestStreak: u.streaks[0]?.longest ?? 0,
            rank: 0,
          });
        }

        // Merge persistentStore users if any exist only there
        const storedUsers = persistentStore.getAllUsers();
        for (const su of storedUsers) {
          if (this.isDummyUser(su)) continue;

          const normUser = su.username?.toLowerCase().trim();
          if (seenIds.has(su.id) || (su.firebaseUid && seenIds.has(su.firebaseUid))) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          const settings = await persistentStore.getSettings(su.id);
          if (settings?.leaderboardOptIn !== false) {
            seenIds.add(su.id);
            if (su.firebaseUid) seenIds.add(su.firebaseUid);
            if (normUser) seenUsernames.add(normUser);

            const streak = await persistentStore.getStreak(su.id, 'daily');
            entries.push({
              id: su.id,
              name: su.name,
              username: su.username,
              avatarUrl: su.avatarUrl,
              level: su.level || 1,
              totalXp: su.xp || 0,
              currentStreak: streak?.current ?? 0,
              longestStreak: streak?.longest ?? 0,
              rank: 0,
            });
          }
        }

        return this.sortAndRank(entries, metric);
      },
      async () => {
        const seenIds = new Set<string>();
        const seenUsernames = new Set<string>();
        const entries: LeaderboardEntryDTO[] = [];

        const storedUsers = persistentStore.getAllUsers();
        for (const su of storedUsers) {
          if (this.isDummyUser(su)) continue;

          const normUser = su.username?.toLowerCase().trim();
          if (seenIds.has(su.id) || (su.firebaseUid && seenIds.has(su.firebaseUid))) continue;
          if (normUser && seenUsernames.has(normUser)) continue;

          const settings = await persistentStore.getSettings(su.id);
          if (settings?.leaderboardOptIn !== false) {
            seenIds.add(su.id);
            if (su.firebaseUid) seenIds.add(su.firebaseUid);
            if (normUser) seenUsernames.add(normUser);

            const streak = await persistentStore.getStreak(su.id, 'daily');
            entries.push({
              id: su.id,
              name: su.name,
              username: su.username,
              avatarUrl: su.avatarUrl,
              level: su.level || 1,
              totalXp: su.xp || 0,
              currentStreak: streak?.current ?? 0,
              longestStreak: streak?.longest ?? 0,
              rank: 0,
            });
          }
        }

        return this.sortAndRank(entries, metric);
      }
    );
  }

  private sortAndRank(entries: LeaderboardEntryDTO[], metric: LeaderboardSortMetric): LeaderboardEntryDTO[] {
    const sorted = [...entries].sort((a, b) => {
      if (metric === 'streak') {
        if (b.currentStreak !== a.currentStreak) {
          return b.currentStreak - a.currentStreak;
        }
        return b.totalXp - a.totalXp;
      }
      if (b.totalXp !== a.totalXp) {
        return b.totalXp - a.totalXp;
      }
      return b.currentStreak - a.currentStreak;
    });

    return sorted.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
    }));
  }
}

export const leaderboardRepository = new LeaderboardRepository();
