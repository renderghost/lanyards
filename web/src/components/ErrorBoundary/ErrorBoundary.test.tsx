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
});
