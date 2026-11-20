import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { useProfile } from '@/lib/atproto/useProfile';
import { renderInRouter } from '@/test/router';

import { CustomiserToolbar } from './CustomiserToolbar';
import type { CustomiserToolbarProps } from './CustomiserToolbar.types';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/atproto/useProfile', () => ({ useProfile: vi.fn() }));

async function renderToolbar(props: Partial<CustomiserToolbarProps> = {}) {
  const handlers = {
    onOpenStyle: vi.fn(),
    onReset: vi.fn(),
    onOpenSupport: vi.fn(),
  };
  const view = renderInRouter(
    <CustomiserToolbar dirty={false} changes={0} {...handlers} {...props} />
  );
  await screen.findByRole('toolbar', { name: 'Customiser' });
  return { ...handlers, ...view };
}

const toolbar = () => screen.getByRole('toolbar', { name: 'Customiser' });

/** The toolbar's controls, in order: its buttons and the account link. */
const controls = () => [
  ...toolbar().querySelectorAll<HTMLElement>('button, a[href]'),
];

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

describe('CustomiserToolbar', () => {
  it('is a toolbar named Customiser, with Style, Reset, Support, Show QR and the account', async () => {
    await renderToolbar();
    expect(
      controls().map(
        (control) => control.getAttribute('aria-label') ?? control.textContent
      )
    ).toEqual(['Style', 'Reset', 'Support', 'Show QR', 'Your account']);
    expect(
      within(toolbar()).getByRole('link', { name: 'Your account' })
    ).toHaveAttribute('href', '/settings');
  });

  it('hands over its Style button, for the sheet to return focus to', async () => {
    const styleButtonRef = createRef<HTMLButtonElement>();
    await renderToolbar({ styleButtonRef });
    expect(styleButtonRef.current).toBe(
      within(toolbar()).getByRole('button', { name: 'Style' })
    );
  });

  it('opens support, handing over its button to return focus to (#134)', async () => {
    const supportButtonRef = createRef<HTMLButtonElement>();
    const { onOpenSupport } = await renderToolbar({ supportButtonRef });
    const support = within(toolbar()).getByRole('button', { name: 'Support' });
    expect(supportButtonRef.current).toBe(support);
    await userEvent.click(support);
    expect(onOpenSupport).toHaveBeenCalledOnce();
  });

  it('opens the style sheet', async () => {
    const { onOpenStyle } = await renderToolbar();
    await userEvent.click(
      within(toolbar()).getByRole('button', { name: 'Style' })
    );
    expect(onOpenStyle).toHaveBeenCalledOnce();
  });

  it('resets only when there are changes, asking first for several', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const clean = await renderToolbar();
    const unavailable = within(toolbar()).getByRole('button', {
      name: 'Reset',
    });
    expect(unavailable).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(unavailable);
    expect(clean.onReset).not.toHaveBeenCalled();
    clean.unmount();

    const { onReset } = await renderToolbar({ dirty: true, changes: 3 });
    const reset = within(toolbar()).getByRole('button', { name: 'Reset' });
    await userEvent.click(reset);
    expect(confirm).toHaveBeenCalledWith('Discard your unsaved changes?');
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('moves between its controls with the arrow keys', async () => {
    await renderToolbar();
    const [style, reset, support, qr, account] = controls();
    style?.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(reset).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(support).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(qr).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(account).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(style).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(account).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(style).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(account).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = await renderToolbar({ dirty: true, changes: 1 });
    await expectNoAxeViolations(container);
  });
});
