import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { Accordion } from './Accordion';

const ITEMS = [
  { id: 'accent', title: 'Accent colour', content: <p>The accents</p> },
  { id: 'badge', title: 'Badge', content: <p>The badge settings</p> },
];

const toggle = (title: string) =>
  within(screen.getByRole('heading', { name: title })).getByRole('button', {
    name: title,
  });

describe('Accordion', () => {
  it('titles each section with a level-3 heading holding a disclosure button', () => {
    renderWithProviders(<Accordion items={ITEMS} />);
    expect(
      screen.getByRole('heading', { level: 3, name: 'Accent colour' })
    ).toBeInTheDocument();
    expect(toggle('Accent colour')).toHaveAttribute('aria-expanded', 'false');
    expect(toggle('Badge')).toHaveAttribute('aria-expanded', 'false');
  });

  it('uses the heading level asked for', () => {
    renderWithProviders(<Accordion items={ITEMS} headingLevel={2} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Badge' })
    ).toBeInTheDocument();
  });

  it('starts the defaultOpen sections expanded, linked by aria-controls', () => {
    renderWithProviders(<Accordion items={ITEMS} defaultOpen={['accent']} />);
    const button = toggle('Accent colour');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(
      button.getAttribute('aria-controls') ?? ''
    );
    expect(panel).toHaveTextContent('The accents');
    expect(screen.queryByText('The badge settings')).toBeNull();
  });

  it('opens and closes a section with Enter, keeping others open', async () => {
    renderWithProviders(<Accordion items={ITEMS} defaultOpen={['accent']} />);
    toggle('Badge').focus();
    await userEvent.keyboard('{Enter}');
    expect(toggle('Badge')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('The badge settings')).toBeVisible();
    expect(toggle('Accent colour')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Enter}');
    expect(toggle('Badge')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('The badge settings')).toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <Accordion items={ITEMS} defaultOpen={['accent']} />
    );
    await expectNoAxeViolations(container);
  });
});
