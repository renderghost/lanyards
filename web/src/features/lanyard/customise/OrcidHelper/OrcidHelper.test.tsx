import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, type JsonBodyType } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { track } from '@/lib/analytics/analytics';
import notVerified from '@/lib/sources/orcid/fixtures/researcher-urls.json';
import verified from '@/lib/sources/orcid/fixtures/researcher-urls-verified.json';
import { expectNoAxeViolations } from '@/test/axe';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';
import { renderWithClient } from '@/test/render';

import { OrcidHelper } from './OrcidHelper';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const ORCID_ID = '0000-0002-1825-0097';
const URLS = `https://pub.orcid.org/v3.0/${ORCID_ID}/researcher-urls`;

/** ORCID answers with each body in turn, then keeps the last. */
function orcidAnswers(...bodies: JsonBodyType[]) {
  let call = 0;
  server.use(
    http.get(URLS, () => {
      const body = bodies[Math.min(call, bodies.length - 1)] ?? null;
      call += 1;
      return HttpResponse.json(body);
    })
  );
}

const helper = (orcidId: string | null | undefined) => (
  <OrcidHelper did={ADA.did} handle="alice.test" orcidId={orcidId} />
);

beforeEach(() => {
  vi.mocked(track).mockClear();
});

describe('OrcidHelper', () => {
  it('points people without an ORCID iD to Sifa', () => {
    renderWithClient(helper(null));
    expect(
      screen.getByText(
        'Add your ORCID iD on Sifa to show verified publications.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open Sifa/ })).toHaveAttribute(
      'href',
      'https://sifa.id/p/alice.test?edit=true#other-profiles'
    );
  });

  it('explains how to verify an iD that does not link back yet', async () => {
    orcidAnswers(notVerified);
    renderWithClient(helper(ORCID_ID));
    expect(
      await screen.findByRole('heading', { name: 'Verify your ORCID iD' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Add this link to the Websites & social links section of your ORCID record:'
      )
    ).toBeInTheDocument();
    const link = screen.getByRole('textbox', { name: 'Link to add' });
    expect(link).toHaveValue(`https://lanyards.app/d/${ADA.did}`);
    expect(link).toHaveAttribute('readonly');
    const orcid = screen.getByRole('link', { name: /Open ORCID/ });
    expect(orcid).toHaveAttribute('href', 'https://orcid.org/my-orcid');
    expect(orcid).toHaveAttribute('target', '_blank');
  });

  it('copies the link to add', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText');
    orcidAnswers(notVerified);
    renderWithClient(helper(ORCID_ID));
    await user.click(await screen.findByRole('button', { name: 'Copy link' }));
    expect(writeText).toHaveBeenCalledWith(`https://lanyards.app/d/${ADA.did}`);
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Link copied')
    );
  });

  it('checks again and announces the verification', async () => {
    orcidAnswers(notVerified, verified);
    renderWithClient(helper(ORCID_ID));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Check again' })
    );
    const status = await screen.findByText(
      'Verified. Your publications now show the ORCID tick.'
    );
    expect(status.closest('[aria-live="polite"]')).not.toBeNull();
    expect(screen.getByText('Your ORCID iD is verified')).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith('orcid_checked', { verified: true });
  });

  it('checks again and says when ORCID has not updated yet', async () => {
    orcidAnswers(notVerified);
    renderWithClient(helper(ORCID_ID));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Check again' })
    );
    expect(
      await screen.findByText(
        'Not verified yet. ORCID can take a few minutes to update.'
      )
    ).toBeInTheDocument();
    expect(track).toHaveBeenCalledWith('orcid_checked', { verified: false });
  });

  it('says when the iD is verified', async () => {
    orcidAnswers(verified);
    renderWithClient(helper(ORCID_ID));
    expect(
      await screen.findByText('Your ORCID iD is verified')
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Check again' })).toBeNull();
  });

  it('shows nothing until Sifa says whether there is an iD', () => {
    const { container } = renderWithClient(helper(undefined));
    expect(container).toBeEmptyDOMElement();
  });

  it('has no axe violations', async () => {
    orcidAnswers(notVerified);
    const { container } = renderWithClient(helper(ORCID_ID));
    await screen.findByRole('button', { name: 'Check again' });
    await expectNoAxeViolations(container);
  });
});
