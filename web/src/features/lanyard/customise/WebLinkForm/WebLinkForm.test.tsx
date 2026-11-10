import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError, track } from '@/lib/analytics/analytics';
import { validateRecord } from '@/lib/lexicons/validate';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { captureWrites, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { WebLinkForm } from './WebLinkForm';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const SCHEME = 'Enter a web address starting with https:// or http://';
const address = () => screen.getByRole('textbox', { name: 'Web address' });
const title = () => screen.getByRole('textbox', { name: 'Title' });
const add = () => screen.getByRole('button', { name: 'Add link' });

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
});

describe('WebLinkForm', () => {
  it('asks for a required web address and an optional title', () => {
    renderWithClient(<WebLinkForm />);
    expect(address()).toHaveAttribute('type', 'url');
    expect(address()).toHaveAttribute('aria-required', 'true');
    expect(title()).not.toBeRequired();
  });

  it('checks the web address when you leave the field', async () => {
    renderWithClient(<WebLinkForm />);
    await userEvent.type(address(), 'ftp://x');
    await userEvent.tab();
    expect(address()).toHaveAttribute('aria-invalid', 'true');
    expect(address()).toHaveAccessibleDescription(SCHEME);
  });

  it('leaves checking to the submit when you leave the field for Add link', async () => {
    // Showing the error on that blur would move Add link before the click
    // lands, so the click (and the submit) would be lost.
    renderWithClient(<WebLinkForm />);
    await userEvent.type(address(), 'ftp://x');
    fireEvent.blur(address(), { relatedTarget: add() });
    expect(address()).not.toHaveAttribute('aria-invalid');
  });

  it('keeps what you typed and moves to the first problem on submit', async () => {
    const writes = captureWrites();
    renderWithClient(<WebLinkForm />);
    await userEvent.type(address(), 'ftp://x');
    await userEvent.type(title(), 'x'.repeat(101));
    await userEvent.click(add());
    expect(address()).toHaveFocus();
    expect(address()).toHaveValue('ftp://x');
    expect(title()).toHaveAccessibleDescription(
      'Keep the title to 100 characters or fewer'
    );
    expect(writes.created).toEqual([]);
  });

  it('adds the link, clears the form and confirms', async () => {
    const writes = captureWrites({ delayMs: 50 });
    renderWithClient(<WebLinkForm />);
    await userEvent.type(address(), 'https://ada.example/cv');
    await userEvent.type(title(), 'CV');
    add().focus();
    await userEvent.keyboard('{Enter}');
    expect(add()).toHaveAttribute('aria-disabled', 'true');
    expect(add()).toHaveFocus();
    await waitFor(() => expect(writes.created).toHaveLength(1));
    const write = writes.created[0] as {
      collection: string;
      record: Record<string, unknown>;
    };
    expect(write.collection).toBe('app.lanyards.link.web');
    expect(write.record).toMatchObject({
      url: 'https://ada.example/cv',
      title: 'CV',
    });
    expect(validateRecord('app.lanyards.link.web', write.record).ok).toBe(true);
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Link added')
    );
    expect(address()).toHaveValue('');
    expect(title()).toHaveValue('');
    expect(track).toHaveBeenCalledWith('kept_record_saved', {
      kind: 'webLink',
    });
  });

  it('keeps the form when the server fails', async () => {
    captureWrites({ fail: ['createRecord'] });
    renderWithClient(<WebLinkForm />);
    await userEvent.type(address(), 'https://ada.example/cv');
    await userEvent.click(add());
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        'Failed to save. Please try again.'
      )
    );
    expect(address()).toHaveValue('https://ada.example/cv');
    expect(add()).toBeEnabled();
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      source: 'web-link',
    });
  });

  it('has no axe violations, including with errors', async () => {
    const { container } = renderWithClient(<WebLinkForm />);
    await expectNoAxeViolations(container);
    await userEvent.click(add());
    await expectNoAxeViolations(container);
  });
});
