/** AI Productivity Insights Card widget — displays habit stacking and rhythm observations. */
import React from 'react';
import { useProductivityInsights } from '../hooks/useAi';
import {
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface AiProductivityInsightsCardProps {
  days?: number;
}

export const AiProductivityInsightsCard: React.FC<AiProductivityInsightsCardProps> = ({ days = 30 }) => {
  const { insights, summaryScore, weeklyPaceRecommendation, isLoading } =
    useProductivityInsights(days);

  if (isLoading) {
    return <div className="glass p-5 rounded-2xl border border-white/5 h-48 animate-pulse" />;
  }

  return (
    <div className="glass p-5 md:p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
            <Brain size={18} />
          </div>
          <div>
            <h3 className="text-fluid-base font-bold text-white flex items-center gap-2">
              <span>Productivity Intelligence</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30">
                AI Coach
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">Habit patterns over the last {days} days</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase font-bold text-purple-300">Habit Velocity</div>
          <div className="text-fluid-xl font-black text-white">{summaryScore}/100</div>
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="mb-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-start gap-2.5 text-fluid-xs text-zinc-200">
        <Lightbulb size={16} className="text-amber-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Recommended Strategy: </span>
          <span>{weeklyPaceRecommendation}</span>
        </div>
      </div>

      {/* Insights List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-fluid-xs font-bold text-white">{ins.title}</span>
                <span
                  className={cn(
                    'text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border',
                    ins.impact === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                      : 'bg-white/5 text-zinc-400 border-white/10'
                  )}
                >
                  {ins.impact} impact
                </span>
              </div>
              <p className="text-[12px] text-zinc-300 mb-2 leading-relaxed">{ins.observation}</p>
            </div>
            <div className="text-[11px] text-purple-300 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20 italic">
              💡 {ins.actionableTip}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
