/** ProgressBar — shared UI primitive component. */
import React from 'react';

export const ProgressBar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-progressbar">{children}</div>;
};
