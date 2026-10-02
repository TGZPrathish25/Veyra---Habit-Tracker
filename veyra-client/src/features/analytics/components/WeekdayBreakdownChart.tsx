/** BarChart component showing habit completion percentage by day of week. */
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import type { WeekdayStat } from '../types';

interface WeekdayBreakdownChartProps {
  data: WeekdayStat[];
}

export const WeekdayBreakdownChart: React.FC<WeekdayBreakdownChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">No weekday data available</div>;
  }

  return (
    <div className="w-full h-64 md:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="rgba(255, 255, 255, 0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(255, 255, 255, 0.4)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as WeekdayStat;
                return (
                  <div className="glass-heavy p-3 rounded-xl border border-white/20 shadow-xl text-fluid-xs">
                    <div className="font-bold text-white mb-1">{item.day}</div>
                    <div className="text-purple-300 font-semibold">
                      {item.completionRate}% Average Rate
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="completionRate" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.completionRate >= 90
                    ? '#10B981' // Emerald
                    : entry.completionRate >= 80
                    ? '#8B5CF6' // Purple
                    : entry.completionRate >= 70
                    ? '#3B82F6' // Blue
                    : '#F59E0B' // Amber
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
