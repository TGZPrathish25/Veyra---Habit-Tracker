/** LineChartCard — responsive chart wrapper using Recharts. */
import React from 'react';
import { GlassCard } from '@/components/glass/GlassCard';

interface LineChartCardProps {
  title?: string;
}

export const LineChartCard: React.FC<LineChartCardProps> = ({ title }) => {
  return (
    <GlassCard>
      {title && <h3 className="text-fluid-lg font-semibold mb-4">{title}</h3>}
      <div className="w-full h-48 sm:h-64 lg:h-72">
        {/* TODO: Implement chart with ResponsiveContainer */}
      </div>
    </GlassCard>
  );
};
