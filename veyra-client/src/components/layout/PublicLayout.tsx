/** PublicLayout — layout for unauthenticated pages (landing, login, etc.). */
import React from 'react';
import { BackgroundOrbs } from '@/components/glass/BackgroundOrbs';

interface PublicLayoutProps { children: React.ReactNode; }

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)' }}>
      <BackgroundOrbs />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};
