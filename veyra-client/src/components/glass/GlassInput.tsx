/** GlassInput — glass-styled input with touch-friendly sizing. */
import React from 'react';
import { cn } from '@/lib/cn';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className, ...props }) => {
  return (
    <div>
      {label && <label className="block text-fluid-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>{label}</label>}
      <input className={cn('glass-input w-full', className)} {...props} />
    </div>
  );
};
