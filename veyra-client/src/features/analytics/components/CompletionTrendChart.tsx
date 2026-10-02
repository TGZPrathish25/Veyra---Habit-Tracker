/** AreaChart component showing habit completion percentage trends over time. */
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DailyTrendPoint } from '../types';

interface CompletionTrendChartProps {
  data: DailyTrendPoint[];
}

export const CompletionTrendChart: React.FC<CompletionTrendChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">No trend data available</div>;
  }

  // Format short date for X-axis (e.g., "10/01")
  const formattedData = data.map((d) => ({
    ...d,
    shortDate: d.date.split('-').slice(1).join('/'),
  }));

  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="shortDate"
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(255, 255, 255, 0.3)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as DailyTrendPoint;
                return (
                  <div className="glass-heavy p-3 rounded-xl border border-white/20 shadow-xl text-fluid-xs">
                    <div className="font-bold text-white mb-1">
                      {item.date} ({item.dayOfWeek})
                    </div>
                    <div className="text-blue-400 font-semibold">
                      {item.completionRate}% Completion
                    </div>
                    <div className="text-zinc-400 text-[11px]">
                      {item.completed} of {item.total} habits finished
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="completionRate"
            stroke="#A78BFA"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#trendGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
