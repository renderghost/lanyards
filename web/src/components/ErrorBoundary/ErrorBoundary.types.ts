import type { ReactNode } from 'react';

export type ErrorBoundaryProps = {
  /**
   * Shown instead of the children after they throw; nothing by default. A
   * function gets `reset`, which renders the children again.
   */
  fallback?: ReactNode | ((reset: () => void) => ReactNode);
  onError?(error: unknown): void;
  children: ReactNode;
};

export type ErrorBoundaryState = { failed: boolean };
