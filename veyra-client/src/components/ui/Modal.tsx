/** Modal — shared UI primitive component. */
import React from 'react';

export const Modal: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-modal">{children}</div>;
};
