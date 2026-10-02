/** GlassButton — glass-styled button with touch-friendly sizing. */
import React from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const variantClass =
    variant === 'primary'
      ? 'glass-button-primary'
      : variant === 'secondary'
      ? 'border border-white/10 bg-white/5 hover:bg-white/10 text-white'
      : variant === 'ghost'
      ? 'glass-button-ghost'
      : 'glass-button-primary bg-rose-600 hover:bg-rose-500';

  const sizeClass =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-base' : 'px-4 py-2 text-sm';

  return (
    <button className={cn('glass-button', variantClass, sizeClass, className)} {...props}>
      {children}
    </button>
  );
};
