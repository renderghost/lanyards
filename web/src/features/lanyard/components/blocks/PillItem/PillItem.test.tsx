import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { type ItemActions, ItemActionsContext } from '../itemActions';
import { PillItem } from './PillItem';

const actions = (hidden: string[]): ItemActions => ({
  isHidden: (key) => hidden.includes(key),
  renderToggle: (_key, title) => (
    <button type="button">{`Hide ${title}`}</button>
  ),
});

const GITHUB = {
  itemKey: 'https://github.com/ada',
  title: 'GitHub',
  label: 'GitHub',
  href: 'https://github.com/ada',
};

describe('PillItem', () => {
  it('public: the whole pill is one link', async () => {
    const { container } = renderWithProviders(
      <ul>
        <li>
          <PillItem {...GITHUB} icon={<svg aria-hidden="true" />} />
        </li>
      </ul>
    );
    const link = screen.getByRole('link', { name: /GitHub/ });
    expect(link.parentElement?.tagName).toBe('LI');
    expect(link).toHaveClass('rounded-full', 'min-h-11');
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.queryByRole('button')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('editor: the toggle sits inside the pill, beside the link, never in it', () => {
    renderWithProviders(
      <ItemActionsContext value={actions([])}>
        <PillItem {...GITHUB} />
      </ItemActionsContext>
    );
    const link = screen.getByRole('link', { name: /GitHub/ });
    const toggle = screen.getByRole('button', { name: 'Hide GitHub' });
    expect(link.contains(toggle)).toBe(false);
    expect(link.parentElement).toBe(toggle.parentElement);
    expect(link.parentElement).toHaveClass('rounded-full');
  });

  it('hidden: dashed, with "(hidden)" for screen readers', () => {
    renderWithProviders(
      <ItemActionsContext value={actions([GITHUB.itemKey])}>
        <PillItem {...GITHUB} />
      </ItemActionsContext>
    );
    const pill = screen.getByRole('link', { name: /GitHub/ }).parentElement;
    expect(pill).toHaveAttribute('data-hidden', 'true');
    expect(pill).toHaveClass('border-dashed');
    expect(screen.getByText('(hidden)')).toHaveClass('sr-only');
  });

  it('no href: a plain label', () => {
    renderWithProviders(
      <PillItem itemKey="mentoring" title="Mentoring" label="Mentoring" />
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(
      screen.getByText('Mentoring').closest('.rounded-full')
    ).not.toBeNull();
  });

  it('a long label truncates inside its pill', () => {
    renderWithProviders(
      <PillItem itemKey="k" title="Long" label={'x'.repeat(120)} />
    );
    const label = screen.getByText('x'.repeat(120));
    expect(label).toHaveClass('truncate');
    expect(label.closest('.rounded-full')).toHaveClass('max-w-full');
  });
});
