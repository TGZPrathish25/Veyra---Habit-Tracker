/** PageHeader — responsive page title and optional action buttons. */
import React from 'react';

interface PageHeaderProps { title: string; subtitle?: string; actions?: React.ReactNode; }

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-fluid-3xl font-bold" style={{ color: 'var(--color-text)' }}>{title}</h1>
        {subtitle && <p className="text-fluid-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
