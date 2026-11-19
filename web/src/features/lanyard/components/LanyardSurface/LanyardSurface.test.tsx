import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { LanyardSurface } from './LanyardSurface';

const ground = () => screen.getByText('Ada').parentElement;

describe('LanyardSurface', () => {
  it('is the lanyard’s own ground, marked as such', () => {
    renderWithProviders(
      <LanyardSurface>
        <p>Ada</p>
      </LanyardSurface>
    );
    expect(ground()).toHaveClass('bg-background', 'text-foreground', 'flex-1');
    expect(ground()).toHaveAttribute('data-lanyard-surface');
    expect(ground()).not.toHaveClass('border');
  });
});
