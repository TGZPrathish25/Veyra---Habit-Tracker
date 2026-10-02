/** AI reflection and productivity insights client types. */

export interface MonthlyReflectionResponse {
  year: number;
  month: number;
  reflection: string;
  keyHighlights: string[];
  focusAreasNextMonth: string[];
  sentiment: 'triumphant' | 'consistent' | 'improving' | 'needs_focus';
  source: 'gemini' | 'analytical_engine';
}

export interface ProductivityInsight {
  id: string;
  category: 'schedule' | 'consistency' | 'energy' | 'streak';
  title: string;
  observation: string;
  actionableTip: string;
  impact: 'high' | 'medium' | 'low';
}

export interface ProductivityInsightsResponse {
  insights: ProductivityInsight[];
  summaryScore: number;
  weeklyPaceRecommendation: string;
  source: 'gemini' | 'analytical_engine';
}
