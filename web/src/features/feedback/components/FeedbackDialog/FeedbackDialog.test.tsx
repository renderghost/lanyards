import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useHasUnsavedChanges } from '@/hooks/useUnsavedChangesGuard';
import {
  InvalidRecordError,
  ScopeRefusedError,
  WriteFailedError,
} from '@/lib/atproto/writes';
import { server } from '@/test/msw';

import { useSession } from '@/features/auth/session/useSession';
import { FEEDBACK_SCOPE, GRANULAR_SCOPE } from '@/lib/atproto/oauthConfig';
import { startSignIn } from '@/lib/atproto/session';
import { expectNoAxeViolations } from '@/test/axe';
import { mockDidDocument, mockGetRecord } from '@/test/handlers';
import { BEA } from '@/test/people';
import { signedInSession, signedOutSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { BOARD_OWNER_DID, BOARD_RKEY } from '../../feedback.constants';
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
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@/hooks/useUnsavedChangesGuard', () => ({
  useHasUnsavedChanges: vi.fn(() => false),
}));
const sent = {
  uri: `at://${BEA.did}/app.userinput.discussion/3mpost`,
  url: `https://userinput.app/d/${BEA.did}/3mpost`,
};
type Callbacks = {
  onSuccess(sent: unknown): void;
  onError(error: unknown): void;
};
/** The send: answered at once, unless a test holds it to answer later. */
const send = vi.hoisted(() => ({
  hold: false,
  callbacks: null as Callbacks | null,
}));
vi.mock('../../useSendFeedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../useSendFeedback')>()),
  useSendFeedback: () => ({
    isPending: false,
    mutate: (_draft: unknown, callbacks: Callbacks) => {
      send.callbacks = callbacks;
      if (!send.hold) callbacks.onSuccess(sent);
    },
  }),
}));

const PDS = 'https://pds.lanyards.test';
const serveBoard = (exists = true) => {
  mockDidDocument(BOARD_OWNER_DID, PDS);
  mockGetRecord(
    PDS,
    BOARD_OWNER_DID,
    'app.userinput.space',
    BOARD_RKEY,
    exists
      ? {
          uri: `at://${BOARD_OWNER_DID}/app.userinput.space/${BOARD_RKEY}`,
          cid: `bafyrei${'c'.repeat(52)}`,
          value: {
            $type: 'app.userinput.space',
            name: 'Lanyards feedback',
            tags: [{ value: 'bug', label: 'Bug' }],
            createdAt: '2026-11-20T09:00:00.000Z',
          },
        }
      : null
  );
};

const at = (open: boolean) => (
  <FeedbackDialog
    open={open}
    onOpenChange={vi.fn()}
    returnFocus={vi.fn()}
    page="/@alice.test"
  />
);
const dialog = () => renderWithClient(at(true));

const canSend = () =>
  vi
    .mocked(useSession)
    .mockReturnValue(
      signedInSession(BEA.did, `${GRANULAR_SCOPE} ${FEEDBACK_SCOPE}`)
    );
const title = () => screen.getByRole('textbox', { name: /Title/ });

/** Writes a bug report and presses Send. */
async function writeAndSend() {
  await userEvent.click(await screen.findByRole('radio', { name: 'Bug' }));
  await userEvent.type(title(), 'The badge overlaps');
  await userEvent.click(screen.getByRole('button', { name: 'Send feedback' }));
}

beforeEach(() => {
  serveBoard();
  send.hold = false;
  send.callbacks = null;
  vi.mocked(startSignIn).mockImplementation(() => Promise.resolve());
  vi.mocked(useHasUnsavedChanges).mockReturnValue(false);
  vi.mocked(notify.success).mockClear();
  URL.createObjectURL = vi.fn(() => 'blob:restored');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  sessionStorage.clear();
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

  it('keeps the draft when closed and opened again', async () => {
    canSend();
    const { rerender } = dialog();
    await userEvent.type(
      await screen.findByRole('textbox', { name: /Title/ }),
      'Half'
    );
    rerender(at(false));
    rerender(at(true));
    expect(await screen.findByRole('textbox', { name: /Title/ })).toHaveValue(
      'Half'
    );
  });

  it('finishes a send that was closed on, and thanks them when reopened', async () => {
    canSend();
    send.hold = true;
    const { rerender } = dialog();
    await writeAndSend();
    rerender(at(false));
    act(() => send.callbacks?.onSuccess(sent));
    expect(notify.success).toHaveBeenCalledWith('Feedback sent');
    rerender(at(true));
    expect(
      await screen.findByRole('heading', { name: 'Thank you' })
    ).toHaveFocus();
  });

  it('says in the dialog when sending fails, keeping everything', async () => {
    canSend();
    send.hold = true;
    dialog();
    await writeAndSend();
    act(() => send.callbacks?.onError(new WriteFailedError('down')));
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't send your feedback. Please try again."
    );
    expect(title()).toHaveValue('The badge overlaps');
  });

  it('explains a post the board won’t take, rather than “try again”', async () => {
    canSend();
    send.hold = true;
    dialog();
    await writeAndSend();
    act(() => send.callbacks?.onError(new InvalidRecordError('too long')));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Our board can’t take this feedback as it is.'
    );
  });

  it('takes them to the permission step when the server refuses', async () => {
    canSend();
    send.hold = true;
    dialog();
    await writeAndSend();
    act(() => send.callbacks?.onError(new ScopeRefusedError('refused')));
    expect(
      screen.getByRole('heading', {
        name: 'Lanyards needs your permission to post feedback',
      })
    ).toHaveFocus();
    expect(title()).toHaveValue('The badge overlaps');
  });

  it('keeps the draft through the permission sign-in', async () => {
    canSend();
    send.hold = true;
    const { unmount } = dialog();
    await writeAndSend();
    act(() => send.callbacks?.onError(new ScopeRefusedError('refused')));
    await userEvent.click(
      screen.getByRole('button', { name: 'Give permission' })
    );
    expect(startSignIn).toHaveBeenCalled();
    unmount();

    // Back from the sign-in: a new page, and the same draft.
    dialog();
    expect(await screen.findByRole('textbox', { name: /Title/ })).toHaveValue(
      'The badge overlaps'
    );
    expect(screen.getByRole('radio', { name: 'Bug' })).toBeChecked();
    expect(sessionStorage.length).toBe(0);
  });

  it('says when screenshots couldn’t be kept through the sign-in', async () => {
    canSend();
    sessionStorage.setItem(
      'lanyards:feedback-draft',
      JSON.stringify({
        type: 'bug',
        title: 'The badge overlaps',
        details: '',
        techDetails: false,
        screenshots: [],
        screenshotsDropped: true,
      })
    );
    dialog();
    expect(
      await screen.findByText(
        'Your screenshots were too big to keep while you gave permission. Please add them again.'
      )
    ).toBeInTheDocument();
  });

  it('stops waiting once they’re back on the page', async () => {
    vi.mocked(useSession).mockReturnValue(
      signedInSession(BEA.did, GRANULAR_SCOPE)
    );
    vi.mocked(startSignIn).mockImplementation(() => new Promise(() => {}));
    dialog();
    const give = await screen.findByRole('button', { name: 'Give permission' });
    await userEvent.click(give);
    expect(give).toHaveAttribute('aria-busy', 'true');
    // Back, from the authorisation page, out of the back-forward cache.
    act(() => {
      window.dispatchEvent(new Event('pageshow'));
    });
    expect(give).not.toHaveAttribute('aria-busy', 'true');
  });

  it('asks them to save their lanyard first, since permission leaves the page', async () => {
    vi.mocked(useSession).mockReturnValue(
      signedInSession(BEA.did, GRANULAR_SCOPE)
    );
    vi.mocked(useHasUnsavedChanges).mockReturnValue(true);
    dialog();
    expect(
      await screen.findByText(
        'Save or reset your lanyard changes first: giving permission leaves this page.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Give permission' })
    ).toBeDisabled();
  });

  it('tries the board again when reopened after it couldn’t be read', async () => {
    canSend();
    server.use(
      http.get(`${PDS}/xrpc/com.atproto.repo.getRecord`, () =>
        HttpResponse.json({ error: 'InternalServerError' }, { status: 500 })
      )
    );
    const { rerender } = dialog();
    // The read is retried once before it counts as failed.
    expect(
      await screen.findByText('Feedback isn’t open yet.', undefined, {
        timeout: 5000,
      })
    ).toBeInTheDocument();
    serveBoard();
    rerender(at(false));
    rerender(at(true));
    expect(
      await screen.findByRole('textbox', { name: /Title/ })
    ).toBeInTheDocument();
  });
});
