import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { FEEDBACK_SCOPE, GRANULAR_SCOPE } from '@/lib/atproto/oauthConfig';
import { startSignIn } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { BEA } from '@/test/people';
import { signedInSession, signedOutSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { BOARD_OWNER_DID } from '../../feedback.constants';
import { FeedbackDialog } from './FeedbackDialog';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/lib/atproto/session', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/atproto/session')>()),
  startSignIn: vi.fn(() => Promise.resolve()),
}));
const sent = {
  uri: `at://${BEA.did}/app.userinput.discussion/3mpost`,
  url: `https://userinput.app/d/${BEA.did}/3mpost`,
};
vi.mock('../../useSendFeedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../useSendFeedback')>()),
  useSendFeedback: () => ({
    isPending: false,
    mutate: (_draft: unknown, callbacks: { onSuccess(s: unknown): void }) =>
      callbacks.onSuccess(sent),
  }),
}));

const PDS = 'https://pds.lanyards.test';
const serveBoard = (exists = true) => {
  mockDidDocument(BOARD_OWNER_DID, PDS);
  mockListRecords(
    PDS,
    BOARD_OWNER_DID,
    'app.userinput.space',
    exists
      ? [
          {
            uri: `at://${BOARD_OWNER_DID}/app.userinput.space/3mboard`,
            cid: `bafyrei${'c'.repeat(52)}`,
            value: {
              $type: 'app.userinput.space',
              name: 'Lanyards feedback',
              tags: [{ value: 'bug', label: 'Bug' }],
              createdAt: '2026-11-20T09:00:00.000Z',
            },
          },
        ]
      : []
  );
};

const dialog = () =>
  renderWithClient(
    <FeedbackDialog
      open
      onOpenChange={vi.fn()}
      returnFocus={vi.fn()}
      page="/@alice.test"
    />
  );

beforeEach(() => {
  serveBoard();
});

describe('FeedbackDialog (#134)', () => {
  it('gives signed-out visitors the other ways to reach us', async () => {
    vi.mocked(useSession).mockReturnValue(signedOutSession());
    const { baseElement } = dialog();
    expect(
      await screen.findByRole('link', { name: /lanyards\.app on Bluesky/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Title/ })).toBeNull();
    await expectNoAxeViolations(baseElement);
  });

  it('says feedback isn’t open yet when there’s no board', async () => {
    serveBoard(false);
    vi.mocked(useSession).mockReturnValue(
      signedInSession(BEA.did, `${GRANULAR_SCOPE} ${FEEDBACK_SCOPE}`)
    );
    dialog();
    expect(
      await screen.findByText('Feedback isn’t open yet.')
    ).toBeInTheDocument();
    expect(screen.getByText('renderghost.101')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Title/ })).toBeNull();
  });

  it('asks for permission first, coming back to this page with feedback open', async () => {
    vi.mocked(useSession).mockReturnValue(
      signedInSession(BEA.did, GRANULAR_SCOPE)
    );
    dialog();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Give permission' })
    );
    expect(startSignIn).toHaveBeenCalledWith(BEA.did, '/@alice.test#feedback', {
      extraScope: FEEDBACK_SCOPE,
    });
    expect(screen.queryByRole('textbox', { name: /Title/ })).toBeNull();
  });

  it('shows the form, then thanks them with a link to their post', async () => {
    vi.mocked(useSession).mockReturnValue(
      signedInSession(BEA.did, `${GRANULAR_SCOPE} ${FEEDBACK_SCOPE}`)
    );
    const { baseElement } = dialog();
    await userEvent.click(await screen.findByRole('radio', { name: 'Bug' }));
    await userEvent.type(
      screen.getByRole('textbox', { name: /Title/ }),
      'The badge overlaps'
    );
    await expectNoAxeViolations(baseElement);
    await userEvent.click(
      screen.getByRole('button', { name: 'Send feedback' })
    );
    expect(
      await screen.findByRole('heading', { name: 'Thank you' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /View it on UserInput/ })
    ).toHaveAttribute('href', sent.url);
    await userEvent.click(screen.getByRole('button', { name: 'Send more' }));
    expect(screen.getByRole('textbox', { name: /Title/ })).toHaveValue('');
  });
});
