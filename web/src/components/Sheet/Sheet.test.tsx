import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Sheet } from './Sheet';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet
      open={open}
      onOpenChange={setOpen}
      title="Style"
      trigger={<button type="button">Open style</button>}
    >
      <button type="button">Blue</button>
    </Sheet>
  );
}

/** Opened from elsewhere on the page, as a toolbar button would. */
function Untriggered({ handBack }: { handBack?: boolean }) {
  const [open, setOpen] = useState(false);
  const elsewhere = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open style
      </button>
      <button type="button" ref={elsewhere}>
        Elsewhere
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Style"
        returnFocus={handBack ? () => elsewhere.current?.focus() : undefined}
      >
        <button type="button">Blue</button>
      </Sheet>
    </>
  );
}

async function openSheet() {
  renderWithProviders(<Harness />);
  await userEvent.click(screen.getByRole('button', { name: 'Open style' }));
  return screen.findByRole('dialog', { name: 'Style' });
}

describe('Sheet', () => {
  it('opens as a dialog with a visible title, moving focus inside', async () => {
    const dialog = await openSheet();
    expect(
      within(dialog).getByRole('heading', { name: 'Style' })
    ).toBeVisible();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape, returning focus to its trigger', async () => {
    await openSheet();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Open style' })).toHaveFocus();
  });

  it('closes from its Close button', async () => {
    const dialog = await openSheet();
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Open style' })).toHaveFocus();
  });

  it('returns focus to what opened it when it has no trigger', async () => {
    renderWithProviders(<Untriggered />);
    await userEvent.click(screen.getByRole('button', { name: 'Open style' }));
    await screen.findByRole('dialog', { name: 'Style' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Open style' })).toHaveFocus();
  });

  it('hands focus back through returnFocus when given one', async () => {
    renderWithProviders(<Untriggered handBack />);
    await userEvent.click(screen.getByRole('button', { name: 'Open style' }));
    await screen.findByRole('dialog', { name: 'Style' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByRole('button', { name: 'Elsewhere' })).toHaveFocus();
  });

  it('has no axe violations', async () => {
    const dialog = await openSheet();
    await expectNoAxeViolations(dialog);
  });
});
