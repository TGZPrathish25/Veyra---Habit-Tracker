/** Month snapshot card for archive history browsing. */
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Unlock, ArrowRight, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { MonthNode } from '../types';

interface MonthCardProps {
  month: MonthNode;
}

export const MonthCard: React.FC<MonthCardProps> = ({ month }) => {
  const { year, month: monthNum, monthName, isLocked, tasksCompleted, totalTasks, completionRate, xpEarned } =
    month;

  return (
    <div className="glass p-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between select-none group">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-fluid-xs font-semibold text-zinc-400">
            {monthName} {year}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1',
              isLocked
                ? 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            )}
          >
            {isLocked ? (
              <>
                <Lock size={10} />
                <span>Locked Archive</span>
              </>
            ) : (
              <>
                <Unlock size={10} />
                <span>Active Month</span>
              </>
            )}
          </span>
        </div>

        <h3 className="text-fluid-xl font-black text-white group-hover:text-purple-200 transition-colors mb-2">
          {monthName}
        </h3>

        {/* Progress Bar & Rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-fluid-xs mb-1.5">
            <span className="text-zinc-400">Completion Rate</span>
            <span className="font-bold text-purple-300">{completionRate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                completionRate >= 90
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              )}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-center text-fluid-xs mb-4">
          <div>
            <div className="text-[10px] uppercase font-semibold text-zinc-400">Habits</div>
            <div className="font-bold text-white mt-0.5">
              {tasksCompleted} <span className="text-zinc-500 font-normal">/ {totalTasks}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-yellow-400">XP Earned</div>
            <div className="font-bold text-white mt-0.5">+{xpEarned}</div>
          </div>
        </div>
      </div>

      <Link
        to={`/history/${year}/${monthNum}`}
        className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-purple-600/30 text-zinc-200 hover:text-white border border-white/10 hover:border-purple-400/40 text-fluid-xs font-semibold transition-all flex items-center justify-center gap-1.5"
      >
        <span>View Month Breakdown</span>
        <ArrowRight size={13} />
      </Link>
    </div>
  );
};
