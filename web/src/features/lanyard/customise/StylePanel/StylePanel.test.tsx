import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { resolveConfig } from '@/lib/person/config';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { StylePanel } from './StylePanel';

const CONFIG = resolveConfig(null);

const section = (name: string) => screen.getByRole('button', { name });

describe('StylePanel', () => {
  it('stacks Accent colour (open) and Badge as disclosures', () => {
    renderWithProviders(
      <StylePanel config={CONFIG} disabled={false} onChange={vi.fn()} />
    );
    expect(section('Accent colour')).toHaveAttribute('aria-expanded', 'true');
    expect(section('Badge')).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByText('Blocks, links and items are edited on your lanyard.')
    ).toBeInTheDocument();
  });

  it('changes the accent', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StylePanel config={CONFIG} disabled={false} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Teal' }));
    const patch = onChange.mock.calls[0]?.[0];
    expect(patch(CONFIG)).toEqual({ ...CONFIG, accent: 'teal' });
  });

  it('turns the current job on the badge off and on', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StylePanel config={CONFIG} disabled={false} onChange={onChange} />
    );
    await userEvent.click(section('Badge'));
    const job = screen.getByRole('checkbox', { name: 'Show current job' });
    expect(job).toBeChecked();
    await userEvent.click(job);
    const patch = onChange.mock.calls[0]?.[0];
    expect(patch(CONFIG)).toEqual({ ...CONFIG, showJob: false });
  });

  it('can be disabled', async () => {
    renderWithProviders(
      <StylePanel config={CONFIG} disabled onChange={vi.fn()} />
    );
    expect(screen.getByRole('radio', { name: 'Teal' })).toBeDisabled();
    await userEvent.click(section('Badge'));
    expect(
      screen.getByRole('checkbox', { name: 'Show current job' })
    ).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <StylePanel config={CONFIG} disabled={false} onChange={vi.fn()} />
    );
    await expectNoAxeViolations(container);
  });
});
