/** EmptyState — shared UI primitive component. */
import React from 'react';

export const EmptyState: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-emptystate">{children}</div>;
};
