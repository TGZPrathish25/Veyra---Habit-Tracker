/** BackgroundOrbs — animated gradient orbs for glass backgrounds.
 *  Uses blue hues in dark mode, warm amber/gold in light mode. */
import React from 'react';

export const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Top-right orb: warm amber (light) / blue (dark) */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-float bg-amber-300/20 dark:bg-primary-400/20" />

      {/* Bottom-left orb: golden (light) / cyan (dark) */}
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl animate-float bg-yellow-300/15 dark:bg-accent-400/15" style={{ animationDelay: "2s" }} />

      {/* Center orb: soft warm (light) / blue (dark) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl animate-float bg-orange-200/10 dark:bg-primary-300/10" style={{ animationDelay: "4s" }} />
    </div>
  );
};
