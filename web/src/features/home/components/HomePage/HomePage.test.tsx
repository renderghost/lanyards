import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { renderInRouter } from '@/test/router';

import { HomePage } from './HomePage';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const WIKI = 'https://github.com/renderghost/lanyards/wiki/';

/** The homepage, once its router has loaded. */
async function home() {
  const view = renderInRouter(<HomePage />, '/');
  await screen.findByRole('heading', { level: 1 });
  return view;
}

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue({
    status: 'signedOut',
    signOut: vi.fn(),
    refresh: vi.fn(),
  });
});

describe('HomePage (#145)', () => {
  it('welcomes visitors', async () => {
    const { container } = await home();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Welcome to Lanyards' })
    ).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    // On the lime badge, the blue logo in light and dark alike.
    expect(
      within(screen.getByRole('main')).getByRole('img', { name: 'Lanyards' })
    ).toHaveAttribute('src', '/logo-light.svg');
    expect(
      screen.getByText(/collects your complete scholarly presence/)
    ).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  // Sign-in has its own page: the homepage makes its case and points there.
  it('leads with what Lanyards does, then a way in (#157)', async () => {
    await home();
    const start = screen.getByRole('region', {
      name: 'Everything you work on, in one link',
    });
    expect(
      within(start).getByText(/gathers your publications, talks/)
    ).toBeInTheDocument();
    expect(
      within(start).getByRole('link', { name: 'Sign in to get started' })
    ).toHaveAttribute('href', '/sign-in');
    expect(
      within(start).getByRole('link', { name: /Learn more/ })
    ).toHaveAttribute('href', WIKI);
  });

  it('has no sign-in form and no live sample lanyard (#157)', async () => {
    await home();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(screen.queryByTitle('Sample lanyard')).toBeNull();
  });

  it('puts its own header on the blue, over the hanging badge (#151)', async () => {
    const { container } = await home();
    const banners = screen.getAllByRole('banner');
    expect(banners).toHaveLength(1);
    const banner = banners[0] as HTMLElement;
    // The header comes first, outside main, so it's the page's banner.
    expect(screen.getByRole('main')).not.toContainElement(banner);
    expect(
      banner.compareDocumentPosition(screen.getByRole('main')) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      within(banner).getByRole('link', { name: 'Sign in' })
    ).toBeInTheDocument();
    // On the page's brand blue, laid over the badge's ground.
    expect(banner.closest('[data-accent="blue"]')).toBe(container.firstChild);
    expect(banner.className).toContain('absolute');
  });

  it('keeps the old homepage’s sections, in order', async () => {
    await home();
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    ).toEqual([
      // The call to action, where the sign-in widget was (#157).
      'Everything you work on, in one link',
      'The visibility paradox',
      'One link, everything visible',
      'Built for researchers',
      'Ready to simplify your research presence?',
    ]);
    const cards = (name: string) =>
      within(screen.getByRole('region', { name }))
        .getAllByRole('heading', { level: 3 })
        .map((h) => h.textContent);
    expect(cards('The visibility paradox')).toEqual([
      'Scattered presence',
      'Missing context',
      'Constant maintenance',
      'No single truth',
    ]);
    expect(cards('One link, everything visible')).toEqual([
      'Professional identity',
      'Research outputs',
      'Social presence',
      'Auto-ingestion',
      'Your control',
      'AT Protocol',
    ]);
    expect(cards('Built for researchers')).toEqual([
      'Less admin, more research',
      'Complete visibility',
      'Career continuity',
      'Open infrastructure',
    ]);
  });

  it('says only what the new app does', async () => {
    await home();
    expect(
      screen.getByText(
        'Connect ORCID, and your publications appear automatically.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Put your work in the order you want, and hide what’s not relevant.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/Google Scholar/)).toBeNull();
    expect(screen.queryByText(/Pin important work/)).toBeNull();
    // British English.
    expect(screen.getByText(/Decentralised, open, yours/)).toBeInTheDocument();
  });

  it('takes “Create your lanyard” to the sign-in page (#157)', async () => {
    await home();
    expect(
      screen.getByRole('link', { name: 'Create your lanyard' })
    ).toHaveAttribute('href', '/sign-in');
    expect(
      screen.getByRole('link', { name: /Follow on Bluesky/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/lanyards.app');
  });

  it('ends with the old footer’s links', async () => {
    await home();
    const footer = screen
      .getByText('Built on the AT Protocol')
      .closest('footer') as HTMLElement;
    expect(
      within(footer).getByRole('link', { name: /Documentation/ })
    ).toHaveAttribute('href', WIKI);
    expect(
      within(footer).getByRole('link', { name: /GitHub/ })
    ).toHaveAttribute('href', 'https://github.com/renderghost/lanyards');
    expect(
      within(footer).getByRole('link', { name: /Contact/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/renderg.host');
  });
});
