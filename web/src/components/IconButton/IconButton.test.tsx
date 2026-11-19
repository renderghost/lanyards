import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { hitHeight } from '@/test/hitArea';
import { cn } from '@/lib/utils';
import { renderWithProviders } from '@/test/render';

import { IconButton } from './IconButton';
import * as styles from './IconButton.styles';

const ICON = <svg data-testid="icon" />;

describe('IconButton', () => {
  it('is a button named by its label, with the icon hidden', () => {
    renderWithProviders(<IconButton label="Move up" icon={ICON} />);
    const button = screen.getByRole('button', { name: 'Move up' });
    expect(button).toHaveAttribute('type', 'button');
    expect(
      screen.getByTestId('icon').closest('[aria-hidden="true"]')
    ).not.toBeNull();
  });

  it('meets the 44px minimum touch target', () => {
    renderWithProviders(<IconButton label="Move up" icon={ICON} />);
    expect(screen.getByRole('button', { name: 'Move up' }).className).toContain(
      'size-11'
    );
  });

  it('shows its label as a tooltip on keyboard focus', async () => {
    renderWithProviders(<IconButton label="Move up" icon={ICON} />);
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Move up');
  });

  it('passes presses through', async () => {
    const onClick = vi.fn();
    renderWithProviders(
      <IconButton label="Move up" icon={ICON} onClick={onClick} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Move up' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('has a hit area at least 44px tall', () => {
    expect(
      hitHeight(cn(styles.base, styles.variants.outline))
    ).toBeGreaterThanOrEqual(44);
  });

  it('has no axe violations', async () => {
    const { container } = renderWithProviders(
      <IconButton label="Move up" icon={ICON} variant="outline" />
    );
    await expectNoAxeViolations(container);
  });
});
