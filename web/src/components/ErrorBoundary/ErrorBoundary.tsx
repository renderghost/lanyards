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

  override componentDidMount(): void {
    if (!this.state.failed) this.props.onRendered?.();
  }

  override componentDidCatch(error: unknown): void {
    this.props.onError?.(error);
  }

  override render() {
    return this.state.failed
      ? (this.props.fallback ?? null)
      : this.props.children;
  }
}
