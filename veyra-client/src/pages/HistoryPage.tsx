/** History archive browser page — Year/Month tree navigation and locked snapshots. */
import React, { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { useHistoryTree, MonthCard } from '@/features/history';
import { Archive, Calendar, Lock, CheckCircle2, Award } from 'lucide-react';
import { cn } from '@/lib/cn';

export const HistoryPage: React.FC = () => {
  const { tree, years, isLoading } = useHistoryTree();
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  const activeYearData = tree.find((t) => t.year === selectedYear) || tree[0];
  const months = activeYearData?.months ?? [];
  const totalCompletedInYear = activeYearData?.totalCompleted ?? 0;

  return (
    <AppShell>
      <PageHeader
        title="Permanent History & Archive"
        subtitle="Browse your immutable monthly snapshots, past reflections, and longitudinal growth."
      />

      {/* Top Archive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="glass p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-purple-300">
              Archived Months
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {months.length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Archive size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-emerald-300">
              Annual Habits Logged
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {totalCompletedInYear.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="glass p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
          <div>
            <div className="text-fluid-xs font-semibold uppercase tracking-wider text-amber-300">
              Snapshots Locked
            </div>
            <div className="text-fluid-2xl font-black text-white mt-0.5">
              {months.filter((m) => m.isLocked).length}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock size={24} />
          </div>
        </div>
      </div>

      {/* Year Selection Tabs */}
      {years.length > 1 && (
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={cn(
                'px-4 py-2 rounded-xl text-fluid-xs font-bold transition-all border',
                selectedYear === y
                  ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 shadow-sm'
                  : 'text-zinc-400 border-transparent hover:text-white hover:bg-white/5'
              )}
            >
              {y} Archive
            </button>
          ))}
        </div>
      )}

      {/* Monthly Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass p-5 rounded-2xl border border-white/5 h-64 animate-pulse" />
          ))}
        </div>
      ) : months.length === 0 ? (
        <div className="glass p-12 rounded-3xl border border-white/5 text-center">
          <Archive size={48} className="mx-auto text-zinc-600 mb-3" />
          <h3 className="text-fluid-lg font-bold text-white mb-1">No archives yet</h3>
          <p className="text-fluid-xs text-zinc-400">
            At the end of each month, your progress locks into a permanent snapshot.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month) => (
            <MonthCard key={`${month.year}-${month.month}`} month={month} />
          ))}
        </div>
      )}
    </AppShell>
  );
};
