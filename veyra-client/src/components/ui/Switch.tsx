/** Switch — shared UI primitive component. */
import React from 'react';

export const Switch: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-switch">{children}</div>;
};
