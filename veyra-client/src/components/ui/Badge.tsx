/** Badge — shared UI primitive component. */
import React from 'react';

export const Badge: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-badge">{children}</div>;
};
