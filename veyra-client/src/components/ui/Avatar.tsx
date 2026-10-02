/** Avatar — shared UI primitive component. */
import React from 'react';

export const Avatar: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div data-testid="ui-avatar">{children}</div>;
};
