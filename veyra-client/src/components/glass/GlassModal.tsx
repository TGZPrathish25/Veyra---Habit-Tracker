/** GlassModal — full-screen on mobile, centered overlay on desktop. */
import React from 'react';
import { cn } from '@/lib/cn';

interface GlassModalProps {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
  className?: string;
}

export const GlassModal: React.FC<GlassModalProps> = ({ children, open, onClose, className }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50" />
      <div
        className={cn('glass-heavy relative z-10 w-full md:max-w-lg md:mx-auto p-6 max-h-[90vh] overflow-y-auto rounded-t-[var(--glass-radius-lg)] md:rounded-[var(--glass-radius-lg)]', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};
