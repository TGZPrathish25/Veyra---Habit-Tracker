/** Button — shared UI primitive component. */
import React from 'react';

export const Button: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-button">{children}</div>;
};
