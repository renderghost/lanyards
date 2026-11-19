import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { resolveConfig } from '@/lib/person/config';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { StyleSidebar } from './StyleSidebar';

describe('StyleSidebar', () => {
  it('is a complementary landmark named Style holding the style panel', async () => {
    const { container } = renderWithProviders(
      <StyleSidebar
        config={resolveConfig(null)}
        disabled={false}
        onChange={vi.fn()}
      />
    );
    const aside = screen.getByRole('complementary', { name: 'Style' });
    expect(
      within(aside).getByRole('heading', { level: 2, name: 'Style' })
    ).toBeInTheDocument();
    expect(
      within(aside).getByRole('button', { name: 'Accent colour' })
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
