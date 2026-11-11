import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from './ErrorBoundary';

function Broken(): never {
  throw new Error('render failed');
}

describe('ErrorBoundary', () => {
  it('replaces a failed subtree with the fallback and reports it', () => {
    const onError = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(
      <>
        <p>Still here</p>
        <ErrorBoundary fallback={<p>Fallback</p>} onError={onError}>
          <Broken />
        </ErrorBoundary>
      </>
    );
    expect(screen.getByText('Still here')).toBeInTheDocument();
    expect(screen.getByText('Fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    vi.mocked(console.error).mockRestore();
  });

  it('says when its children have rendered, and not when they fail', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const onRendered = vi.fn();
    const { unmount } = render(
      <ErrorBoundary onRendered={onRendered}>
        <p>Fine</p>
      </ErrorBoundary>
    );
    expect(onRendered).toHaveBeenCalledTimes(1);
    unmount();

    onRendered.mockClear();
    render(
      <ErrorBoundary onRendered={onRendered}>
        <Broken />
      </ErrorBoundary>
    );
    expect(onRendered).not.toHaveBeenCalled();
    vi.mocked(console.error).mockRestore();
  });
});
