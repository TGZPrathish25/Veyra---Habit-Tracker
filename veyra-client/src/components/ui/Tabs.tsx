/** Tabs — shared UI primitive component. */
import React from 'react';

export const Tabs: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-tabs">{children}</div>;
};
