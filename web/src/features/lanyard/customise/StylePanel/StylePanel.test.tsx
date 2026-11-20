import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { coverFor } from '@/design/covers';
import { track } from '@/lib/analytics/analytics';
import { resolveConfig } from '@/lib/person/config';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { StylePanel } from './StylePanel';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const CONFIG = resolveConfig(null);
const DID = 'did:plc:fixturealiceaaaaaaaaaaaa';
const OWNER = { did: DID, initials: 'AE' };

const section = (name: string) => screen.getByRole('button', { name });

describe('StylePanel', () => {
  it('stacks Accent colour (open) and Badge as disclosures', () => {
    renderWithProviders(
      <StylePanel
        {...OWNER}
        config={CONFIG}
        disabled={false}
        onChange={vi.fn()}
      />
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
      <StylePanel
        {...OWNER}
        config={CONFIG}
        disabled={false}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Mint' }));
    const patch = onChange.mock.calls[0]?.[0];
    expect(patch(CONFIG)).toEqual({ ...CONFIG, accent: 'mint' });
  });

  it.each([
    ['Show current role', 'showRole'],
    ['Show location', 'showLocation'],
    ['Show what you’re open to', 'showOpenTo'],
  ] as const)('turns “%s” on the badge off', async (name, setting) => {
    const onChange = vi.fn();
    renderWithProviders(
      <StylePanel
        {...OWNER}
        config={CONFIG}
        disabled={false}
        onChange={onChange}
      />
    );
    await userEvent.click(section('Badge'));
    const box = screen.getByRole('checkbox', { name });
    expect(box).toBeChecked();
    await userEvent.click(box);
    const patch = onChange.mock.calls[0]?.[0];
    expect(patch(CONFIG)).toEqual({ ...CONFIG, [setting]: false });
    expect(track).toHaveBeenCalledWith('badge_setting_changed', {
      setting,
      on: false,
    });
  });

  it('chooses a cover, showing the derived one until then', async () => {
    const onChange = vi.fn();
    renderWithProviders(
      <StylePanel
        {...OWNER}
        config={CONFIG}
        disabled={false}
        onChange={onChange}
      />
    );
    await userEvent.click(section('Cover'));
    const names = {
      dots: 'Dots',
      stripes: 'Stripes',
      pixels: 'Pixels',
      orb: 'Orb',
      symbols: 'Symbols',
      hazard: 'Hazard',
      arrows: 'Arrows',
      monogram: 'Monogram',
    } as const;
    expect(
      screen.getByRole('radio', { name: names[coverFor(DID)] })
    ).toBeChecked();
    const other = coverFor(DID) === 'orb' ? 'Pixels' : 'Orb';
    await userEvent.click(screen.getByRole('radio', { name: other }));
    const patch = onChange.mock.calls[0]?.[0];
    expect(patch(CONFIG).cover).toBe(other.toLowerCase());
    expect(track).toHaveBeenCalledWith('cover_changed', {
      cover: other.toLowerCase(),
    });
  });

  it('can be disabled', async () => {
    renderWithProviders(
      <StylePanel {...OWNER} config={CONFIG} disabled onChange={vi.fn()} />
    );
    expect(screen.getByRole('radio', { name: 'Mint' })).toBeDisabled();
    await userEvent.click(section('Badge'));
    expect(
      screen.getByRole('checkbox', { name: 'Show current role' })
    ).toBeDisabled();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <StylePanel
        {...OWNER}
        config={CONFIG}
        disabled={false}
        onChange={vi.fn()}
      />
    );
    await expectNoAxeViolations(container);
  });
});
