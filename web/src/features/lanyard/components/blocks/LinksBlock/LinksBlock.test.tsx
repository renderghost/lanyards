import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { LinksBlock } from './LinksBlock';

describe('LinksBlock', () => {
  it('lists links with their icons, opening each in a new tab', async () => {
    const { container } = renderWithProviders(
      <LinksBlock
        items={[
          {
            key: 'https://github.com/ada-example',
            url: 'https://github.com/ada-example',
            title: 'GitHub',
            platform: 'github',
          },
          {
            key: 'https://ada.example/',
            url: 'https://ada.example/',
            title: 'Website',
            platform: 'website',
            iconUrl: 'https://cdn.bsky.app/icon',
          },
        ]}
      />
    );
    const github = screen.getByRole('link', {
      name: 'GitHub (opens in a new tab)',
    });
    expect(github).toHaveAttribute('rel', 'noopener noreferrer');
    expect(github.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('img')).toHaveAttribute('alt', '');
    await expectNoAxeViolations(container);
  });
});
