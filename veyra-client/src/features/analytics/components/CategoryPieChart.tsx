/** Donut pie chart showing habit category distributions. */
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { CategoryStat } from '../types';

interface CategoryPieChartProps {
  data: CategoryStat[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-zinc-500">No category data</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-64 md:h-72">
      <div className="w-full sm:w-1/2 h-48 sm:h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CategoryStat;
                  return (
                    <div className="glass-heavy p-2.5 rounded-xl border border-white/20 shadow-xl text-fluid-xs">
                      <div className="font-bold text-white mb-0.5">{item.category}</div>
                      <div className="text-zinc-300">
                        {item.percentage}% ({item.count} habits)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={4}
              dataKey="percentage"
            >
              {data.map((entry, index) => (
                <Cell key={`slice-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend list */}
      <div className="w-full sm:w-1/2 space-y-2 pr-2">
        {data.map((cat, idx) => (
          <div key={idx} className="flex items-center justify-between text-fluid-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-zinc-300 font-medium truncate max-w-[140px]">
                {cat.category}
              </span>
            </div>
            <span className="font-bold text-white shrink-0">{cat.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
