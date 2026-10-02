/** Checkbox — shared UI primitive component. */
import React from 'react';

export const Checkbox: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-checkbox">{children}</div>;
};
