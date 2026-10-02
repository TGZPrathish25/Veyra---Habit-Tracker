/** GlassPanel — larger glass surface for side panels. */
import React from 'react';
import { cn } from '@/lib/cn';

export const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return <div className={cn('glass p-4 md:p-6 lg:p-8', className)}>{children}</div>;
};
