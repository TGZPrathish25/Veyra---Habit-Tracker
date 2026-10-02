/** History service — manages year/month archive tree and locked snapshot views. */
import { historyRepository } from './history.repository.js';
import type { YearTreeDTO, MonthSnapshotDTO } from './history.types.js';

export class HistoryService {
  async getTree(userId: string): Promise<YearTreeDTO[]> {
    return historyRepository.getTree(userId);
  }

  async getMonthSnapshot(
    userId: string,
    year: number,
    month: number
  ): Promise<MonthSnapshotDTO> {
    const snapshot = await historyRepository.getMonthSnapshot(userId, year, month);
    if (!snapshot) {
      throw new Error(`Snapshot for ${year}-${month} not found`);
    }
    return snapshot;
  }
}

export const historyService = new HistoryService();
