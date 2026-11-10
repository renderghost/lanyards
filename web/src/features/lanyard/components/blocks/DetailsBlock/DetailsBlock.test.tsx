import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { DetailsBlock } from './DetailsBlock';

describe('DetailsBlock', () => {
  it('names the location and languages', () => {
    renderWithProviders(
      <DetailsBlock
        items={[
          { key: 'details', location: 'Edinburgh', languages: ['en', 'fr'] },
        ]}
      />
    );
    expect(screen.getByText('Edinburgh')).toBeInTheDocument();
    expect(screen.getByText('English, French')).toBeInTheDocument();
  });
});
