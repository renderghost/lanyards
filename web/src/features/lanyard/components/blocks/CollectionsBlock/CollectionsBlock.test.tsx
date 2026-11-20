import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { CollectionsBlock } from './CollectionsBlock';

describe('CollectionsBlock', () => {
  it('shows each collection, without its links or images', async () => {
    const { container } = renderWithProviders(
      <CollectionsBlock
        items={[
          {
            key: 'k',
            name: 'Protocol reading',
            description: 'Papers about ATProto',
            url: 'https://semble.so/profile/alice.test/collections/3m',
            links: [
              {
                key: 'c1',
                title: 'The protocol spec',
                url: 'https://protocol.example/spec',
                siteName: 'Protocol Example',
              },
            ],
          },
        ]}
      />
    );
    expect(
      screen.getByRole('link', {
        name: 'Protocol reading (opens in a new tab)',
      })
    ).toHaveAttribute(
      'href',
      'https://semble.so/profile/alice.test/collections/3m'
    );
    // The collection is the thing to open: its links aren't listed.
    expect(screen.queryByText('The protocol spec')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    await expectNoAxeViolations(container);
  });

  it('clamps a very long description to three lines', () => {
    renderWithProviders(
      <CollectionsBlock
        items={[
          {
            key: 'k',
            name: 'Reading',
            description: 'z'.repeat(5000),
            url: 'https://semble.so/profile/alice.test/collections/3m',
            links: [],
          },
        ]}
      />
    );
    expect(screen.getByText('z'.repeat(5000))).toHaveClass('line-clamp-3');
  });

  it('is a card opening the collection, without listing its links', () => {
    renderWithProviders(
      <CollectionsBlock
        items={[
          {
            key: 'c',
            name: 'Reading',
            url: 'https://semble.so/collection/c',
            links: [
              { key: 'l', title: 'An article', url: 'https://x.example/a' },
            ],
          },
        ]}
      />
    );
    expect(document.querySelectorAll('[data-card]')).toHaveLength(1);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.queryByText('An article')).toBeNull();
  });
});
