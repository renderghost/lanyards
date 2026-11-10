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
    await expectNoAxeViolations(container);
  });

  it('renders nothing while online', () => {
    vi.mocked(useOnlineStatus).mockReturnValue(true);
    const { container } = renderWithProviders(<OfflineBanner />);
    expect(container).toBeEmptyDOMElement();
  });
});
