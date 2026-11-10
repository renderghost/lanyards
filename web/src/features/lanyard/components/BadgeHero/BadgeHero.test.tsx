import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ADA } from '@/test/people';
import { renderWithProviders } from '@/test/render';

import { BadgeHero } from './BadgeHero';

const hero = {
  did: ADA.did,
  handle: 'alice.test',
  displayName: 'Ada Example',
  honorific: 'Dr' as const,
};

describe('BadgeHero', () => {
  it('is the page’s level-one heading on a lanyard', () => {
    renderWithProviders(<BadgeHero hero={hero as never} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Dr Ada Example' })
    ).toBeInTheDocument();
  });

  it('is a level-two heading when shown inside another page', () => {
    renderWithProviders(<BadgeHero hero={hero as never} headingLevel={2} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'Dr Ada Example' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });
});
