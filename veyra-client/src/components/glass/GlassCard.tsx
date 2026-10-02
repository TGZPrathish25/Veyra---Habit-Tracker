/** GlassCard — glass surface card consuming tokens from tokens.css. */
import React from 'react';
import { cn } from '@/lib/cn';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return <div className={cn('glass p-4 md:p-6', className)}>{children}</div>;
};
