import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { RecordToggle } from './RecordToggle';

function Harness() {
  const [hidden, setHidden] = useState(false);
  return (
    <RecordToggle
      title="Personal site"
      hidden={hidden}
      onToggle={() => setHidden((current) => !current)}
    />
  );
}

describe('RecordToggle', () => {
  it('names itself by what it will do', () => {
    const { rerender } = renderWithProviders(
      <RecordToggle title="Personal site" hidden={false} onToggle={vi.fn()} />
    );
    expect(
      screen.getByRole('button', { name: 'Hide Personal site' })
    ).toBeInTheDocument();
    rerender(<RecordToggle title="Old blog" hidden onToggle={vi.fn()} />);
    expect(
      screen.getByRole('button', { name: 'Show Old blog' })
    ).toBeInTheDocument();
  });

  it('keeps focus after hiding and showing', async () => {
    renderWithProviders(<Harness />);
    const toggle = screen.getByRole('button', { name: 'Hide Personal site' });
    toggle.focus();
    await userEvent.keyboard('{Enter}');
    const shown = screen.getByRole('button', { name: 'Show Personal site' });
    expect(shown).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(
      screen.getByRole('button', { name: 'Hide Personal site' })
    ).toHaveFocus();
  });

  it('does nothing while disabled', async () => {
    const onToggle = vi.fn();
    renderWithProviders(
      <RecordToggle
        title="Personal site"
        hidden={false}
        onToggle={onToggle}
        disabled
      />
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Hide Personal site' })
    );
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <RecordToggle title="Personal site" hidden onToggle={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
