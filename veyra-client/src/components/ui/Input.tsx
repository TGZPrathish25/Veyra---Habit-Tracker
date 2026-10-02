/** Input — shared UI primitive component. */
import React from 'react';

export const Input: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-input">{children}</div>;
};
