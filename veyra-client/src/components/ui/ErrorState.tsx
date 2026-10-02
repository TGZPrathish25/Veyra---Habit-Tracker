/** ErrorState — shared UI primitive component. */
import React from 'react';

export const ErrorState: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-errorstate">{children}</div>;
};
