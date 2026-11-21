import userEvent from '@testing-library/user-event';
import { fireEvent, screen } from '@testing-library/react';
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

  it('hangs in a laminate sleeve from a lanyard printed with the handle (#173)', () => {
    const { container } = renderWithProviders(<BadgeHero hero={hero} />);
    const badge = screen.getByRole('region', { name: 'Dr Ada Example' });
    expect(badge.closest('[data-sleeve]')).not.toBeNull();
    const straps = container.querySelectorAll('textPath');
    expect(straps).toHaveLength(2);
    for (const strap of straps) {
      expect(strap.textContent).toContain('@alice.test');
    }
  });

  it('never sways: it holds buttons, which must stay put (#173)', () => {
    const { container } = renderWithProviders(<BadgeHero hero={hero} />);
    const badge = screen.getByRole('region', { name: 'Dr Ada Example' });
    for (let x = 100; x <= 600; x += 50) {
      fireEvent.pointerMove(badge, { pointerType: 'mouse', clientX: x });
    }
    for (const element of container.querySelectorAll<HTMLElement>('*')) {
      expect(element.style.transform).toBe('');
    }
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

  it('links other current roles to the Roles block, when it is shown (#130)', () => {
    const role = { title: 'Research Engineer', others: 2 };
    const { rerender } = renderWithProviders(
      <BadgeHero hero={{ ...hero, role }} rolesHref="#roles" />
    );
    expect(screen.getByRole('link', { name: '+2 more roles' })).toHaveAttribute(
      'href',
      '#roles'
    );
    rerender(
      <BadgeHero
        hero={{ ...hero, role: { ...role, others: 0 } }}
        rolesHref="#roles"
      />
    );
    expect(screen.queryByRole('link', { name: /more role/ })).toBeNull();
  });

  it('moves focus to the Roles block’s heading from the link', async () => {
    renderWithProviders(
      <>
        <BadgeHero
          hero={{ ...hero, role: { title: 'Research Engineer', others: 1 } }}
          rolesHref="#roles"
        />
        <section id="roles" aria-labelledby="roles-heading">
          <h2 id="roles-heading" tabIndex={-1}>
            Roles
          </h2>
        </section>
      </>
    );
    await userEvent.click(screen.getByRole('link', { name: '+1 more role' }));
    expect(screen.getByRole('heading', { name: 'Roles' })).toHaveFocus();
  });
});
