import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('links each repository on Tangled', () => {
    renderWithProviders(
      <CodeBlock
        items={[
          {
            key: 'k',
            name: 'lanyard-tools',
            description: 'Tools for conference lanyards',
            url: 'https://tangled.org/alice.test/lanyard-tools',
          },
        ]}
      />
    );
    expect(
      screen.getByRole('link', { name: 'lanyard-tools (opens in a new tab)' })
    ).toHaveAttribute('href', 'https://tangled.org/alice.test/lanyard-tools');
    expect(
      screen.getByText('Tools for conference lanyards')
    ).toBeInTheDocument();
  });
});
