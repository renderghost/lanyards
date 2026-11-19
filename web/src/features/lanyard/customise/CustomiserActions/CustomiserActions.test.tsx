import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderInRouter } from '@/test/router';

import { CustomiserActions } from './CustomiserActions';
import type { CustomiserActionsProps } from './CustomiserActions.types';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));

function renderActions(props: Partial<CustomiserActionsProps> = {}) {
  const handlers = {
    onViewAsChange: vi.fn(),
    onSave: vi.fn(),
    onReset: vi.fn(),
  };
  const view = renderInRouter(
    <CustomiserActions
      viewAs="edit"
      dirty={false}
      changes={0}
      saving={false}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers, ...view };
}

const button = (name: string) => screen.getByRole('button', { name });

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue({
    status: 'signedIn',
    session: { did: ALICE.did } as never,
    signOut: vi.fn(),
    refresh: vi.fn(),
  });
  vi.mocked(useProfile).mockReturnValue({ data: ALICE } as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CustomiserActions', () => {
  it('toggles between editing and the public view', async () => {
    const { onViewAsChange } = renderActions();
    expect(
      await screen.findByRole('group', { name: 'Preview mode' })
    ).toBeInTheDocument();
    expect(button('Edit')).toHaveAttribute('aria-pressed', 'true');
    expect(button('View as public')).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button('View as public'));
    expect(onViewAsChange).toHaveBeenCalledWith('public');
  });

  it('says when everything is saved, with nothing to save or reset', async () => {
    const { onSave, onReset } = renderActions();
    expect(await screen.findByRole('status')).toHaveTextContent(
      'All changes saved'
    );
    expect(button('Save')).toHaveAttribute('aria-disabled', 'true');
    expect(button('Reset')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button('Save'));
    await userEvent.click(button('Reset'));
    expect(onSave).not.toHaveBeenCalled();
    expect(onReset).not.toHaveBeenCalled();
  });

  it('says when there are unsaved changes, and saves them', async () => {
    const { onSave } = renderActions({ dirty: true, changes: 1 });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Unsaved changes'
    );
    expect(button('Save')).not.toHaveAttribute('aria-disabled');
    await userEvent.click(button('Save'));
    expect(onSave).toHaveBeenCalledOnce();
  });

  it('marks Save busy while saving', async () => {
    renderActions({ dirty: true, changes: 1, saving: true });
    expect(await screen.findByRole('button', { name: 'Save' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('status')).toHaveTextContent('Saving…');
  });

  it('resets one change without asking', async () => {
    const confirm = vi.spyOn(window, 'confirm');
    const { onReset } = renderActions({ dirty: true, changes: 1 });
    await userEvent.click(await screen.findByRole('button', { name: 'Reset' }));
    expect(confirm).not.toHaveBeenCalled();
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('asks before resetting more than one change', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { onReset } = renderActions({ dirty: true, changes: 2 });
    const reset = await screen.findByRole('button', { name: 'Reset' });
    await userEvent.click(reset);
    expect(confirm).toHaveBeenCalledWith('Discard your unsaved changes?');
    expect(onReset).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    await userEvent.click(reset);
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('keeps Show QR and the account link', async () => {
    renderActions();
    expect(
      await screen.findByRole('link', { name: 'Your account' })
    ).toHaveAttribute('href', '/settings');
    expect(button('Show QR')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderActions({ dirty: true, changes: 1 });
    await screen.findByRole('link', { name: 'Your account' });
    await expectNoAxeViolations(container);
  });
});
