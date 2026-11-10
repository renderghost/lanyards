import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { CollectionsBlock } from './CollectionsBlock';

describe('CollectionsBlock', () => {
  it('shows each collection with its latest links and no images', async () => {
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
    expect(
      screen.getByRole('link', {
        name: 'The protocol spec (opens in a new tab)',
      })
    ).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
