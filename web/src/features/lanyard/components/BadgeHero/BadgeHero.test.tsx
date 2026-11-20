import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ADA } from '@/test/people';
import { renderWithProviders } from '@/test/render';

import { BadgeHero } from './BadgeHero';

const hero = {
  did: ADA.did,
  handle: 'alice.test' as const,
  displayName: 'Ada Example',
  honorificPrefix: 'Dr',
  cover: 'orb' as const,
  initials: 'AE',
  openTo: [],
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

  it('shows the prefix before the name and the suffix after a comma', () => {
    renderWithProviders(
      <BadgeHero
        hero={
          {
            ...hero,
            honorificPrefix: 'Prof',
            honorificSuffix: 'OBE',
          } as never
        }
        headingLevel={2}
      />
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'Prof Ada Example, OBE' })
    ).toBeInTheDocument();
  });

  it('wears a decorative cover and shows initials without an avatar (#129)', () => {
    const { container } = renderWithProviders(<BadgeHero hero={hero} />);
    const cover = container.querySelector('[data-cover] svg');
    expect(cover).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('AE')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('breaks a very long name anywhere rather than overflowing', () => {
    const long = 'Ada' + 'x'.repeat(57);
    renderWithProviders(<BadgeHero hero={{ ...hero, displayName: long }} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass(
      '[overflow-wrap:anywhere]'
    );
  });

  it('shows the departure board, and its actions in the accent field', () => {
    renderWithProviders(
      <BadgeHero
        hero={{ ...hero, location: 'Berlin' }}
        actions={<button type="button">Follow</button>}
      />
    );
    expect(screen.getByText('Based')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Follow' }).closest('[data-field]')
    ).not.toBeNull();
  });
});
