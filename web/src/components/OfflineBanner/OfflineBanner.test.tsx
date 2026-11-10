import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { OfflineBanner } from './OfflineBanner';

vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: vi.fn() }));

describe('OfflineBanner', () => {
  it('announces when the connection drops', async () => {
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(screen.getByRole('status')).toHaveTextContent(
      "You're offline. Some things won't work until you reconnect."
    );
    expect(screen.getByRole('status').className).toContain(
      'env(safe-area-inset-bottom)'
    );
    await expectNoAxeViolations(container);
  });

  it('keeps an empty live region while online, so changes are announced', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(true);
    const { rerender } = renderWithProviders(<OfflineBanner />);
    const region = screen.getByRole('status');
    expect(region).toBeEmptyDOMElement();
    vi.mocked(useOnlineStatus).mockReturnValue(false);
    rerender(<OfflineBanner />);
    expect(screen.getByRole('status')).toBe(region);
    expect(region).toHaveTextContent("You're offline");
  });
});
