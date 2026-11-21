import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
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
    onSave: vi.fn(),
    onReset: vi.fn(),
    onOpenStyle: vi.fn(),
  };
  const view = renderInRouter(
    <CustomiserActions
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
  // View is its own page now, in the header (#150).
  it('has no Edit / View as public toggle', async () => {
    renderActions();
    await screen.findByRole('button', { name: 'Save' });
    expect(screen.queryByRole('group', { name: 'Preview mode' })).toBeNull();
  });

  it('opens the style sheet from Style, on phones (#150)', async () => {
    const styleButtonRef = createRef<HTMLButtonElement>();
    const { onOpenStyle } = renderActions({ styleButtonRef });
    const style = await screen.findByRole('button', { name: 'Style' });
    expect(styleButtonRef.current).toBe(style);
    await userEvent.click(style);
    expect(onOpenStyle).toHaveBeenCalledOnce();
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

  // The header adds Share and Account after these (#150).
  it('leaves Share and Account to the header', async () => {
    renderActions();
    await screen.findByRole('button', { name: 'Save' });
    expect(screen.queryByRole('link', { name: 'Share' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Your account' })).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = renderActions({ dirty: true, changes: 1 });
    await screen.findByRole('button', { name: 'Save' });
    await expectNoAxeViolations(container);
  });
});
