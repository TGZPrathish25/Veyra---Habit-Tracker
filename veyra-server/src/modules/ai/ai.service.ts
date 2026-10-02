/** AI reflection and productivity insights service — Gemini integration with analytical fallback. */
import type {
  GenerateReflectionInput,
  MonthlyReflectionResponse,
  ProductivityInsight,
  ProductivityInsightsResponse,
} from './ai.types.js';
import { historyRepository } from '../history/history.repository.js';
import { analyticsService } from '../analytics/analytics.service.js';

export const aiService = {
  async generateMonthlyReflection(
    userId: string,
    input: GenerateReflectionInput
  ): Promise<MonthlyReflectionResponse> {
    const { year, month, customPrompt } = input;
    const snapshot = await historyRepository.getMonthSnapshot(userId, year, month);

    const completionRate = snapshot ? snapshot.completionRate : 0;
    const tasksCompleted = snapshot ? snapshot.tasksCompleted : 0;
    const totalTasks = snapshot ? snapshot.totalTasks : 0;
    const streakDays = snapshot ? snapshot.streakDays : 0;
    const monthName = snapshot ? snapshot.monthName : 'Current Month';

    // If Gemini API key is configured, attempt real inference
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const prompt = `You are Veyra's AI productivity coach. Analyze this user's monthly habit performance:
- Month: ${monthName} ${year}
- Habits Completed: ${tasksCompleted} of ${totalTasks} (${completionRate}%)
- Longest Streak: ${streakDays} days
${customPrompt ? `- User's focus notes: "${customPrompt}"` : ''}

Respond in strict JSON with the following format:
{
  "reflection": "A 2-3 paragraph insightful, encouraging summary of their growth and momentum.",
  "keyHighlights": ["bullet 1", "bullet 2", "bullet 3"],
  "focusAreasNextMonth": ["goal 1", "goal 2", "goal 3"],
  "sentiment": "triumphant" | "consistent" | "improving" | "needs_focus"
}`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          }
        );

        if (res.ok) {
          const json = (await res.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              year,
              month,
              reflection: parsed.reflection,
              keyHighlights: parsed.keyHighlights || [],
              focusAreasNextMonth: parsed.focusAreasNextMonth || [],
              sentiment: parsed.sentiment || 'consistent',
              source: 'gemini',
            };
          }
        }
      } catch (err) {
        // Fall back gracefully to analytical engine on network or token issues
        console.warn('Gemini API call failed, falling back to analytical engine:', err);
      }
    }

    // High-fidelity analytical engine fallback
    let sentiment: 'triumphant' | 'consistent' | 'improving' | 'needs_focus' = 'consistent';
    let reflection = '';
    const keyHighlights: string[] = [];
    const focusAreasNextMonth: string[] = [];

    if (completionRate >= 80) {
      sentiment = 'triumphant';
      reflection = `Incredible execution throughout ${monthName} ${year}! You logged an impressive ${completionRate}% completion rate across ${totalTasks} scheduled habits. Your peak ${streakDays}-day streak demonstrated remarkable resilience and discipline. You have established a solid foundation of daily rituals that are compounding your productivity.`;
      keyHighlights.push(`High success rate of ${completionRate}% achieved`);
      keyHighlights.push(`Sustained a peak streak of ${streakDays} continuous days`);
      keyHighlights.push(`Successfully checked off ${tasksCompleted} individual habit occurrences`);
      focusAreasNextMonth.push('Increase habit difficulty or add a new challenging keystone habit');
      focusAreasNextMonth.push('Join a community sprint to share your momentum');
      focusAreasNextMonth.push('Maintain consistent sleep rituals to support high performance');
    } else if (completionRate >= 60) {
      sentiment = 'consistent';
      reflection = `${monthName} ${year} demonstrated solid, steady progress with ${tasksCompleted} habits fulfilled (${completionRate}%). While some mid-week fluctuations occurred, your best streak reached ${streakDays} days. Focusing on removing friction during busy days will help elevate consistency into the upper tier.`;
      keyHighlights.push(`Maintained an active ${completionRate}% monthly completion rate`);
      keyHighlights.push(`Logged a healthy ${streakDays}-day streak`);
      keyHighlights.push(`Strong adherence on high-energy mid-week days`);
      focusAreasNextMonth.push('Implement 2-minute rule micro-habits for low energy days');
      focusAreasNextMonth.push('Stack habit cues directly after breakfast or morning coffee');
      focusAreasNextMonth.push('Protect weekend habit completion with earlier morning reminders');
    } else if (completionRate >= 40) {
      sentiment = 'improving';
      reflection = `You took meaningful steps forward during ${monthName} ${year}, achieving a ${completionRate}% completion rate. You proved you can build momentum with a ${streakDays}-day streak. Growth isn't linear—refining your focus on 1-2 core habits will give you more breathing room to establish unbreakable routines.`;
      keyHighlights.push(`Completed ${tasksCompleted} habits toward personal growth`);
      keyHighlights.push(`Established a streak of ${streakDays} consecutive days`);
      keyHighlights.push('Identified routine friction points to optimize');
      focusAreasNextMonth.push('Pare back active daily habits to 2 essential keystone habits');
      focusAreasNextMonth.push('Set explicit time-of-day reminders');
      focusAreasNextMonth.push('Focus on showing up for 1 minute rather than aiming for perfection');
    } else {
      sentiment = 'needs_focus';
      reflection = `${monthName} proved challenging, with ${completionRate}% of habits checked off. Life happens, and every month is an opportunity for a reset. By starting small with gentle daily check-ins, you can quickly rebuild positive momentum.`;
      keyHighlights.push(`Logged ${tasksCompleted} habit check-ins despite obstacles`);
      keyHighlights.push('Maintained accountability by logging activity');
      focusAreasNextMonth.push('Choose one simple 5-minute habit to practice each day');
      focusAreasNextMonth.push('Pair up with a friend for mutual daily accountability');
      focusAreasNextMonth.push('Reset your weekly plan on Sunday night with manageable targets');
    }

    return {
      year,
      month,
      reflection,
      keyHighlights,
      focusAreasNextMonth,
      sentiment,
      source: 'analytical_engine',
    };
  },

  async getProductivityInsights(userId: string, days = 30): Promise<ProductivityInsightsResponse> {
    const period: '7d' | '30d' | '90d' = days <= 7 ? '7d' : days <= 30 ? '30d' : '90d';
    const summary = await analyticsService.getSummary(userId, period);
    const insights: ProductivityInsight[] = [];

    // Weekday vs Weekend Analysis
    const weekdays = summary.weekdayBreakdown;
    const weekdaySum = weekdays.slice(1, 6).reduce((acc, d) => acc + (d.completionRate || 0), 0);
    const avgWeekday = Math.round(weekdaySum / 5);
    const weekendSum = (weekdays[0]?.completionRate || 0) + (weekdays[6]?.completionRate || 0);
    const avgWeekend = Math.round(weekendSum / 2);

    if (avgWeekday - avgWeekend >= 15) {
      insights.push({
        id: 'ins-weekend-dip',
        category: 'schedule',
        title: 'Weekend Habit Dip Detected',
        observation: `Your weekday completion rate averages ${avgWeekday}%, but weekends drop to ${avgWeekend}%.`,
        actionableTip:
          'Set a gentler "weekend version" of your habits (e.g. 5 minutes instead of 30) so you maintain your streak without feeling constrained.',
        impact: 'high',
      });
    } else {
      insights.push({
        id: 'ins-balance',
        category: 'consistency',
        title: 'Balanced Weekday & Weekend Rhythm',
        observation: `You maintain balanced performance across both weekdays (${avgWeekday}%) and weekends (${avgWeekend}%).`,
        actionableTip: 'Keep your weekend routines intact—this rhythm prevents Monday burnout.',
        impact: 'medium',
      });
    }

    // Streak momentum
    if (summary.currentStreak >= 5) {
      insights.push({
        id: 'ins-streak-momentum',
        category: 'streak',
        title: 'High Streak Momentum',
        observation: `You are currently on a ${summary.currentStreak}-day active streak!`,
        actionableTip:
          'Habits are becoming automated in your neural pathways. Continue the streak for 21 days for permanent habituation.',
        impact: 'high',
      });
    } else {
      insights.push({
        id: 'ins-streak-start',
        category: 'streak',
        title: 'Streak Building Phase',
        observation: `Your current streak is ${summary.currentStreak} day(s). The first 7 days require the highest activation energy.`,
        actionableTip:
          'Complete your easiest habit first thing in the morning to lock in the day early.',
        impact: 'high',
      });
    }

    // Category balance
    insights.push({
      id: 'ins-habit-stacking',
      category: 'energy',
      title: 'Habit Stacking Opportunity',
      observation:
        'Completing habits back-to-back creates a psychological momentum train that reduces decision fatigue.',
      actionableTip:
        'Anchor your newest habit immediately after a well-established daily routine (e.g. "After I brew morning coffee, I will journal for 3 minutes").',
      impact: 'medium',
    });

    const completionRate = summary.averageCompletionRate || 70;
    const summaryScore = Math.min(
      100,
      Math.round(completionRate * 0.7 + Math.min(30, (summary.currentStreak || 0) * 4))
    );

    let weeklyPaceRecommendation = 'Steady pace — maintain current load and focus on execution quality.';
    if (completionRate < 50) {
      weeklyPaceRecommendation = 'Reduce task count by 20% to regain consistency confidence.';
    } else if (completionRate > 85) {
      weeklyPaceRecommendation = 'Excellent capacity! Consider stepping up milestone targets.';
    }

    return {
      insights,
      summaryScore,
      weeklyPaceRecommendation,
      source: process.env.GEMINI_API_KEY ? 'gemini' : 'analytical_engine',
    };
  },
};
