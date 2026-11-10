import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { captureError } from '@/lib/analytics/analytics';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { AppError } from './AppError';

vi.mock('@/lib/analytics/analytics', () => ({
  track: vi.fn(),
  captureError: vi.fn(),
}));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AppError', () => {
  it('reports the error and offers a reload', async () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });
    const error = new Error('boom');
    const { container } = renderWithProviders(<AppError error={error} />);
    expect(
      screen.getByRole('heading', { name: 'Something went wrong' })
    ).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledWith(error, { source: 'route' });
    expect(document.title).toBe('Something went wrong · Lanyards');
    await userEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(reload).toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });
});
