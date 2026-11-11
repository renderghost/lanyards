import { Component } from 'react';

import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from './ErrorBoundary.types';

/** Contains a rendering failure so the rest of the page keeps working. */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  override state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: unknown): void {
    this.props.onError?.(error);
  }

  /** Renders the children again, after whatever broke them may be fixed. */
  reset = (): void => {
    this.setState({ failed: false });
  };

  override render() {
    const { fallback, children } = this.props;
    if (!this.state.failed) return children;
    return typeof fallback === 'function'
      ? fallback(this.reset)
      : (fallback ?? null);
  }
}
