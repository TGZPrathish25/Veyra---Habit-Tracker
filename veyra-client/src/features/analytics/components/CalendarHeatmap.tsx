/** Habit completion calendar heatmap grid. */
import React from 'react';
import { cn } from '@/lib/cn';
import type { HeatmapDay } from '../types';

interface CalendarHeatmapProps {
  data: HeatmapDay[];
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ data }) => {
  const getLevelColor = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-emerald-400 border-emerald-300/40 shadow-[0_0_8px_rgba(52,211,153,0.4)]';
      case 3:
        return 'bg-blue-500 border-blue-500/40 shadow-[0_0_6px_rgba(0,136,221,0.3)]';
      case 2:
        return 'bg-blue-900/80 border-blue-800/40';
      case 1:
        return 'bg-blue-950/60 border-blue-950/30';
      default:
        return 'bg-white/5 border-white/5';
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5 overflow-x-auto">
        {data.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              'w-4 h-4 md:w-5 md:h-5 rounded-md border transition-all duration-200 hover:scale-125 cursor-pointer',
              getLevelColor(day.level)
            )}
            title={`${day.date}: ${day.count} habits completed (Level ${day.level})`}
          />
        ))}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-end gap-2 mt-3 text-[11px] text-zinc-400">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span
            key={lvl}
            className={cn('w-3.5 h-3.5 rounded border', getLevelColor(lvl))}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
};
