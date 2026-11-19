import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { PublicationsBlock } from './PublicationsBlock';

describe('PublicationsBlock', () => {
  it('ticks verified ORCID works and links DOIs', async () => {
    const { container } = renderWithProviders(
      <PublicationsBlock
        items={[
          {
            key: 'orcid:1',
            title: 'Verified work',
            doi: '10.1234/abc',
            year: '2023',
            venue: 'Journal of Examples',
            orcidVerified: true,
          },
          { key: 'sifa:1', title: 'Unverified work', orcidVerified: false },
        ]}
      />
    );
    expect(
      screen.getByRole('link', { name: 'Verified work (opens in a new tab)' })
    ).toHaveAttribute('href', 'https://doi.org/10.1234/abc');
    expect(
      screen.getAllByRole('img', { name: 'Verified on ORCID' })
    ).toHaveLength(1);
    expect(screen.getByText('Journal of Examples · 2023')).toBeInTheDocument();
    expect(screen.getByText('Unverified work')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('is a card opening its DOI, with one link', () => {
    renderWithProviders(
      <PublicationsBlock
        items={[
          {
            key: 'p',
            title: 'A paper',
            doi: '10.1234/x',
            venue: 'Journal',
            year: '2024',
            orcidVerified: true,
          },
        ]}
      />
    );
    expect(document.querySelectorAll('[data-card]')).toHaveLength(1);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /A paper/ })).toHaveAttribute(
      'href',
      'https://doi.org/10.1234/x'
    );
  });
});
