/** Leaderboard service — global rankings business logic. */
import { leaderboardRepository } from './leaderboard.repository.js';
import type { LeaderboardEntryDTO, LeaderboardSortMetric } from './leaderboard.types.js';

export class LeaderboardService {
  async getLeaderboard(metric: LeaderboardSortMetric = 'xp', limit = 100): Promise<LeaderboardEntryDTO[]> {
    return leaderboardRepository.getGlobalLeaderboard(metric, limit);
  }
}

export const leaderboardService = new LeaderboardService();
