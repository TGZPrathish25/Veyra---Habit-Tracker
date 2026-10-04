/** Leaderboard repository — queries all registered users with opt-in status. */
import { prisma, tryPrisma } from '../../db/prisma.js';
import { persistentStore } from '../../db/persistentStore.js';
import type { LeaderboardEntryDTO, LeaderboardSortMetric } from './leaderboard.types.js';

export class LeaderboardRepository {
  async getGlobalLeaderboard(metric: LeaderboardSortMetric = 'xp', limit = 100): Promise<LeaderboardEntryDTO[]> {
    return tryPrisma(
      async () => {
        const users = await prisma.user.findMany({
          where: {
            OR: [
              { settings: null },
              { settings: { leaderboardOptIn: true } },
            ],
          },
          include: {
            gamification: true,
            streaks: { where: { type: 'daily' } },
            settings: true,
          },
          take: limit,
        });

        const entries: LeaderboardEntryDTO[] = users.map((u) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          avatarUrl: u.avatarUrl,
          level: u.gamification?.level ?? u.level ?? 1,
          totalXp: u.gamification?.totalXp ?? u.xp ?? 0,
          currentStreak: u.streaks[0]?.current ?? 0,
          longestStreak: u.streaks[0]?.longest ?? 0,
          rank: 0,
        }));

        // Merge persistentStore users if any exist only there
        const existingIds = new Set(entries.map((e) => e.id));
        const storedUsers = persistentStore.getAllUsers();
        for (const su of storedUsers) {
          if (!existingIds.has(su.id)) {
            const settings = await persistentStore.getSettings(su.id);
            if (settings?.leaderboardOptIn !== false) {
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
        }

        return this.sortAndRank(entries, metric);
      },
      async () => {
        const entries: LeaderboardEntryDTO[] = [];
        const storedUsers = persistentStore.getAllUsers();
        for (const su of storedUsers) {
          const settings = await persistentStore.getSettings(su.id);
          if (settings?.leaderboardOptIn !== false) {
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
