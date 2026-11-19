import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { ALICE } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

import { CustomiserToolbar } from './CustomiserToolbar';
import type { CustomiserToolbarProps } from './CustomiserToolbar.types';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

function renderToolbar(props: Partial<CustomiserToolbarProps> = {}) {
  const handlers = { onOpenStyle: vi.fn(), onReset: vi.fn() };
  const view = renderWithProviders(
    <CustomiserToolbar dirty={false} changes={0} {...handlers} {...props} />
  );
  return { ...handlers, ...view };
}

const toolbar = () => screen.getByRole('toolbar', { name: 'Customiser' });

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue({
    status: 'signedIn',
    session: { did: ALICE.did } as never,
    signOut: vi.fn(),
    refresh: vi.fn(),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('CustomiserToolbar', () => {
  it('is a toolbar named Customiser, with Style, Reset and Show QR', () => {
    renderToolbar();
    const bar = toolbar();
    expect(
      within(bar)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Style', 'Reset', 'Show QR']);
  });

  it('hands over its Style button, for the sheet to return focus to', () => {
    const styleButtonRef = createRef<HTMLButtonElement>();
    renderToolbar({ styleButtonRef });
    expect(styleButtonRef.current).toBe(
      within(toolbar()).getByRole('button', { name: 'Style' })
    );
  });

  it('opens the style sheet', async () => {
    const { onOpenStyle } = renderToolbar();
    await userEvent.click(
      within(toolbar()).getByRole('button', { name: 'Style' })
    );
    expect(onOpenStyle).toHaveBeenCalledOnce();
  });

  it('resets only when there are changes, asking first for several', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { onReset, rerender } = renderToolbar();
    const reset = within(toolbar()).getByRole('button', { name: 'Reset' });
    expect(reset).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(reset);
    expect(onReset).not.toHaveBeenCalled();
    rerender(
      <CustomiserToolbar
        dirty
        changes={3}
        onOpenStyle={vi.fn()}
        onReset={onReset}
      />
    );
    await userEvent.click(reset);
    expect(confirm).toHaveBeenCalledWith('Discard your unsaved changes?');
    expect(onReset).toHaveBeenCalledOnce();
  });

  it('moves between its buttons with the arrow keys', async () => {
    renderToolbar();
    const [style, reset, qr] = within(toolbar()).getAllByRole('button');
    style?.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(reset).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(qr).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(style).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(qr).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(style).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(qr).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const { container } = renderToolbar({ dirty: true, changes: 1 });
    await expectNoAxeViolations(container);
  });
});
