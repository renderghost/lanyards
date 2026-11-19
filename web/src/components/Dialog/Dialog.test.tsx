import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { TextField } from '@/components/TextField/TextField';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Dialog } from './Dialog';

function Harness({
  onOpenChange = vi.fn(),
  returnFocus = vi.fn(),
}: {
  onOpenChange?: (open: boolean) => void;
  returnFocus?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [address, setAddress] = useState('');
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        setOpen(next);
      }}
      title="Add a podcast or video"
      returnFocus={returnFocus}
    >
      <TextField
        label="Web address"
        name="url"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
    </Dialog>
  );
}

describe('Dialog', () => {
  it('is named by its title', () => {
    renderWithProviders(<Harness />);
    expect(
      screen.getByRole('dialog', { name: 'Add a podcast or video' })
    ).toBeInTheDocument();
  });

  it('focuses its first field when it opens', async () => {
    renderWithProviders(<Harness />);
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Web address' })).toHaveFocus()
    );
  });

  it('skips fields that can’t be used', async () => {
    renderWithProviders(
      <Dialog open onOpenChange={vi.fn()} title="Edit Episode one">
        <input type="radio" aria-label="Audio" disabled />
        <TextField label="Title" name="title" value="" onChange={vi.fn()} />
      </Dialog>
    );
    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus()
    );
  });

  it('Escape closes it and returnFocus runs', async () => {
    const onOpenChange = vi.fn();
    const returnFocus = vi.fn();
    renderWithProviders(
      <Harness onOpenChange={onOpenChange} returnFocus={returnFocus} />
    );
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    await waitFor(() => expect(returnFocus).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('a click outside doesn’t close it', () => {
    const onOpenChange = vi.fn();
    renderWithProviders(<Harness onOpenChange={onOpenChange} />);
    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    renderWithProviders(<Harness />);
    await expectNoAxeViolations(document.body);
  });
});
