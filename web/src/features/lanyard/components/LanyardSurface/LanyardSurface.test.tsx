import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { LanyardSurface } from './LanyardSurface';

const ground = () => screen.getByText('Ada').parentElement;

describe('LanyardSurface', () => {
  it('fills the page on a public lanyard, on the lanyard’s own ground', () => {
    renderWithProviders(
      <LanyardSurface variant="page">
        <p>Ada</p>
      </LanyardSurface>
    );
    expect(ground()).toHaveClass('bg-background', 'text-foreground', 'flex-1');
  });

  it('frames the lanyard as a card in a preview', () => {
    renderWithProviders(
      <LanyardSurface variant="card">
        <p>Ada</p>
      </LanyardSurface>
    );
    expect(ground()).toHaveClass('bg-background', 'text-foreground', 'border');
    expect(ground()).not.toHaveClass('flex-1');
  });
});
