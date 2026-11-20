import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { resolveConfig } from '@/lib/person/config';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { StyleSheet } from './StyleSheet';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Style
      </button>
      <StyleSheet
        open={open}
        onOpenChange={setOpen}
        config={resolveConfig(null)}
        disabled={false}
        onChange={vi.fn()}
      />
    </>
  );
}

describe('StyleSheet', () => {
  it('opens as a dialog named Style with the style controls', async () => {
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('button', { name: 'Style' }));
    const sheet = await screen.findByRole('dialog', { name: 'Style' });
    expect(
      within(sheet).getByRole('radio', { name: 'Mint' })
    ).toBeInTheDocument();
    expect(
      within(sheet).getByRole('button', { name: 'Badge' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(sheet);
  });

  it('closes, returning focus to the button that opened it', async () => {
    renderWithProviders(<Harness />);
    const opener = screen.getByRole('button', { name: 'Style' });
    await userEvent.click(opener);
    const sheet = await screen.findByRole('dialog', { name: 'Style' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(opener).toHaveFocus();
  });
});
