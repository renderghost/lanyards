import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('lets its fallback try the children again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    let crash = true;
    function Flaky() {
      if (crash) throw new Error('render failed');
      return <p>Recovered</p>;
    }
    render(
      <ErrorBoundary
        fallback={(reset) => (
          <button type="button" onClick={reset}>
            Try again
          </button>
        )}
      >
        <Flaky />
      </ErrorBoundary>
    );
    crash = false;
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('Recovered')).toBeInTheDocument();
    vi.mocked(console.error).mockRestore();
  });
});
