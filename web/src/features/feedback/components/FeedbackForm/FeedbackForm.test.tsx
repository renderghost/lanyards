import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { MissingPermissionError, WriteFailedError } from '@/lib/atproto/writes';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import type { FeedbackBoard } from '../../board';
import type { FeedbackDraft, SentFeedback } from '../../useSendFeedback';
import { FeedbackForm } from './FeedbackForm';

vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

type Callbacks = {
  onSuccess?: (sent: SentFeedback) => void;
  onError?: (error: unknown) => void;
};
const send = vi.hoisted(() => ({
  mutate: vi.fn<(draft: FeedbackDraft, callbacks: Callbacks) => void>(),
  isPending: false,
}));
vi.mock('../../useSendFeedback', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../useSendFeedback')>()),
  useSendFeedback: () => send,
}));

const board = (tags: string[]): FeedbackBoard => ({
  uri: 'at://did:plc:ua3d6biqepazbq6mw4ysotfo/app.userinput.space/3mboard',
  cid: `bafyrei${'c'.repeat(52)}`,
  name: 'Lanyards feedback',
  tags: tags.map((value) => ({
    value,
    label: value[0]!.toUpperCase() + value.slice(1),
  })),
  url: 'https://userinput.app/s/did:plc:ua3d6biqepazbq6mw4ysotfo/3mboard',
});

const onSent = vi.fn();
const onNeedsPermission = vi.fn();
const form = (tags = ['bug', 'idea', 'question']) =>
  renderWithProviders(
    <FeedbackForm
      board={board(tags)}
      page="/@alice.test"
      onSent={onSent}
      onNeedsPermission={onNeedsPermission}
    />
  );

const title = () => screen.getByRole('textbox', { name: /Title/ });
const sendButton = () => screen.getByRole('button', { name: 'Send feedback' });

beforeEach(() => {
  send.isPending = false;
  send.mutate.mockClear();
  vi.mocked(notify.success).mockClear();
  vi.mocked(notify.error).mockClear();
  onSent.mockClear();
  onNeedsPermission.mockClear();
});

describe('FeedbackForm (#134)', () => {
  it('asks what it’s about, then for a title, focusing the first gap', async () => {
    const { container } = form();
    await userEvent.click(sendButton());
    expect(screen.getByRole('radio', { name: 'Bug' })).toHaveFocus();
    const types = screen.getByRole('radiogroup', {
      name: 'What is this about?',
    });
    expect(types).toHaveAttribute('aria-invalid', 'true');
    expect(types).toHaveAccessibleDescription('Choose what this is about');
    expect(title()).toHaveAttribute('aria-invalid', 'true');
    expect(title()).toHaveAccessibleDescription(/Give it a title/);
    expect(send.mutate).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it('keeps the title to 300 characters', async () => {
    form();
    await userEvent.click(screen.getByRole('radio', { name: 'Idea' }));
    await userEvent.click(title());
    await userEvent.paste('é'.repeat(301));
    await userEvent.click(sendButton());
    expect(
      screen.getByText('Keep the title to 300 characters')
    ).toBeInTheDocument();
    expect(title()).toHaveFocus();
  });

  it('offers a list rather than radios for a board with many tags', () => {
    form(['bug', 'idea', 'question', 'praise', 'docs', 'design']);
    expect(screen.queryByRole('radio')).toBeNull();
    expect(
      screen.getByRole('combobox', { name: /What is this about/ })
    ).toBeInTheDocument();
  });

  it('shows the technical details in full before they’re sent', async () => {
    form();
    expect(screen.queryByText(/Page: \/@alice\.test/)).toBeNull();
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Include technical details' })
    );
    expect(screen.getByText(/Page: \/@alice\.test/)).toBeInTheDocument();
  });

  it('says the feedback is public, and where private things go', () => {
    form();
    expect(
      screen.getByText(/posted publicly from your account/)
    ).toBeInTheDocument();
    expect(screen.getByText(/message us on Signal/)).toBeInTheDocument();
  });

  async function fillIn() {
    await userEvent.click(screen.getByRole('radio', { name: 'Bug' }));
    await userEvent.type(title(), 'The badge overlaps');
    await userEvent.type(
      screen.getByRole('textbox', { name: /Details/ }),
      'At 320 px.'
    );
  }

  it('sends what was written', async () => {
    form();
    await fillIn();
    await userEvent.click(sendButton());
    expect(send.mutate).toHaveBeenCalledWith(
      {
        type: 'bug',
        title: 'The badge overlaps',
        details: 'At 320 px.',
        screenshots: [],
      },
      expect.anything()
    );
  });

  it('thanks them, and hands over the post, once it’s sent', async () => {
    form();
    await fillIn();
    await userEvent.click(sendButton());
    const sent = {
      uri: 'at://did:plc:b/app.userinput.discussion/3k',
      url: 'u',
    };
    send.mutate.mock.calls.at(-1)![1].onSuccess!(sent);
    expect(notify.success).toHaveBeenCalledWith('Feedback sent');
    expect(onSent).toHaveBeenCalledWith(sent);
  });

  it('keeps everything, and says so, when sending fails', async () => {
    form();
    await fillIn();
    await userEvent.click(sendButton());
    send.mutate.mock.calls.at(-1)![1].onError!(new WriteFailedError('down'));
    expect(notify.error).toHaveBeenCalledWith(
      "Couldn't send your feedback. Please try again."
    );
    expect(title()).toHaveValue('The badge overlaps');
    expect(screen.getByRole('radio', { name: 'Bug' })).toBeChecked();
  });

  it('asks for permission, keeping everything, when it’s missing', async () => {
    form();
    await fillIn();
    await userEvent.click(sendButton());
    send.mutate.mock.calls.at(-1)![1].onError!(new MissingPermissionError('x'));
    expect(onNeedsPermission).toHaveBeenCalled();
    expect(title()).toHaveValue('The badge overlaps');
  });

  it('is busy while sending, and never sends twice', async () => {
    send.isPending = true;
    form();
    expect(sendButton()).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(sendButton());
    expect(send.mutate).not.toHaveBeenCalled();
    expect(within(sendButton()).queryByText('Send feedback')).not.toBeNull();
  });
});
