/** GlassToast — glass-styled shared UI component. */
import React from 'react';

export const GlassToast: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="glass">{children}</div>;
};
