import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { HomePage } from './HomePage';

const WIKI = 'https://github.com/renderghost/lanyards/wiki/';

/** Stands in for the sign-in form, which the landing route provides. */
const signIn = (
  <label>
    Your handle
    <input id="sign-in-handle" />
  </label>
);

const home = () => renderWithProviders(<HomePage signIn={signIn} />);

describe('HomePage (#145)', () => {
  it('welcomes visitors, with sign-in where Get started was', async () => {
    const { container } = home();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Welcome to Lanyards' })
    ).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    // On the lime badge, the blue logo in light and dark alike.
    expect(screen.getByRole('img', { name: 'Lanyards' })).toHaveAttribute(
      'src',
      '/logo-light.svg'
    );
    expect(
      screen.getByText(/collects your complete scholarly presence/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Your handle' })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute(
      'href',
      WIKI
    );
    await expectNoAxeViolations(container);
  });

  it('keeps the old homepage’s sections, in order', () => {
    home();
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    ).toEqual([
      // Sign-in, under the old "Get started" call to action.
      'Get started',
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

  it('says only what the new app does', () => {
    home();
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

  it('shows a sample lanyard, live in a phone frame, and links to it', () => {
    home();
    const frame = screen.getByTitle('Sample lanyard');
    expect(frame.tagName).toBe('IFRAME');
    expect(frame).toHaveAttribute('src', '/@renderg.host');
    expect(frame).toHaveAttribute('loading', 'lazy');
    expect(
      screen.getByRole('link', { name: /View sample profile/ })
    ).toHaveAttribute('href', '/@renderg.host');
  });

  it('takes “Create your lanyard” to the sign-in form', async () => {
    home();
    await userEvent.click(
      screen.getByRole('button', { name: 'Create your lanyard' })
    );
    expect(screen.getByRole('textbox', { name: 'Your handle' })).toHaveFocus();
    expect(
      screen.getByRole('link', { name: /Follow on Bluesky/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/lanyards.app');
  });

  it('ends with the old footer’s links', () => {
    home();
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
