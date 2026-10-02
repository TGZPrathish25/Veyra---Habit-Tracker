/** Analytics service — computes trend analytics and calendar heatmaps. */
import { analyticsRepository } from './analytics.repository.js';
import type { AnalyticsSummaryDTO, HeatmapDay } from './analytics.types.js';

export class AnalyticsService {
  async getSummary(
    userId: string,
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<AnalyticsSummaryDTO> {
    return analyticsRepository.getAnalytics(userId, period);
  }

  async getHeatmap(userId: string, days = 60): Promise<HeatmapDay[]> {
    return analyticsRepository.getHeatmap(userId, days);
  }
}

export const analyticsService = new AnalyticsService();
