import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import type { FeedbackBoard } from '../../board';
import { FeedbackForm } from './FeedbackForm';
import { EMPTY_FEEDBACK } from './FeedbackForm.constants';
import type { FeedbackValues } from './FeedbackForm.types';

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

const onSend = vi.fn();

/** The form, with its values held where the dialog holds them. */
function Harness({
  tags,
  sending = false,
  failure = null,
}: {
  tags: string[];
  sending?: boolean;
  failure?: string | null;
}) {
  const [values, setValues] = useState<FeedbackValues>(EMPTY_FEEDBACK);
  return (
    <FeedbackForm
      board={board(tags)}
      page="/@alice.test"
      values={values}
      onChange={setValues}
      sending={sending}
      failure={failure}
      onSend={onSend}
    />
  );
}

const form = (
  tags = ['bug', 'idea', 'question'],
  options: { sending?: boolean; failure?: string | null } = {}
) => renderWithProviders(<Harness tags={tags} {...options} />);

const title = () => screen.getByRole('textbox', { name: /Title/ });
const sendButton = () => screen.getByRole('button', { name: 'Send feedback' });

beforeEach(() => {
  onSend.mockClear();
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
    expect(onSend).not.toHaveBeenCalled();
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

  it('counts the technical details within the details’ limit', async () => {
    form();
    await userEvent.click(screen.getByRole('radio', { name: 'Bug' }));
    await userEvent.type(title(), 'The badge overlaps');
    await userEvent.click(screen.getByRole('textbox', { name: /Details/ }));
    await userEvent.paste('x'.repeat(9990));
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Include technical details' })
    );
    await userEvent.click(sendButton());
    expect(
      screen.getByText(
        'Keep the details and technical details to 10,000 characters'
      )
    ).toBeInTheDocument();
    expect(onSend).not.toHaveBeenCalled();
  });

  it('hands over what was written, ready to send', async () => {
    form();
    await fillIn();
    await userEvent.click(sendButton());
    expect(onSend).toHaveBeenCalledWith({
      type: 'bug',
      title: 'The badge overlaps',
      details: 'At 320 px.',
      screenshots: [],
    });
  });

  it('says by the button why sending failed', () => {
    form(undefined, { failure: "Couldn't send your feedback." });
    expect(screen.getByRole('alert')).toHaveTextContent(
      "Couldn't send your feedback."
    );
  });

  it('is busy while sending, and never sends twice', async () => {
    form(undefined, { sending: true });
    expect(sendButton()).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(sendButton());
    expect(onSend).not.toHaveBeenCalled();
    expect(within(sendButton()).queryByText('Send feedback')).not.toBeNull();
  });
});
