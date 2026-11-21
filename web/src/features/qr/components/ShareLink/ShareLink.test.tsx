import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { servePerson, signedInSession, signedOutSession } from '@/test/person';
import { renderInRouter } from '@/test/router';

import { ShareLink } from './ShareLink';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  servePerson();
});

describe('ShareLink (#150)', () => {
  it('goes to your own Share page', async () => {
    const { container } = renderInRouter(<ShareLink />);
    const link = await screen.findByRole('link', { name: 'Share' });
    await vi.waitFor(() =>
      expect(link).toHaveAttribute('href', `/${ADA.handle}/share`)
    );
    await expectNoAxeViolations(container);
  });

  it('is a link on the badge too', async () => {
    renderInRouter(<ShareLink tone="badge" />);
    expect(
      await screen.findByRole('link', { name: 'Share' })
    ).toBeInTheDocument();
  });

  it('shows nothing when signed out', () => {
    vi.mocked(useSession).mockReturnValue(signedOutSession());
    renderInRouter(<ShareLink />);
    expect(screen.queryByRole('link', { name: 'Share' })).toBeNull();
  });
});
