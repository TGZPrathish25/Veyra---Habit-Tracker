/** BackgroundOrbs — animated gradient orbs for glass backgrounds. */
import React from 'react';

export const BackgroundOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
    </div>
  );
};
