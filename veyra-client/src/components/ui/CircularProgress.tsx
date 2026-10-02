/** CircularProgress — shared UI primitive component. */
import React from 'react';

export const CircularProgress: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-circularprogress">{children}</div>;
};
