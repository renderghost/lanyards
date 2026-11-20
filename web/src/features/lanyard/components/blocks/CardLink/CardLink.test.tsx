import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { ItemActionsContext } from '../itemActions';
import { CardLink } from './CardLink';

const ACTIONS = { isHidden: () => false, renderToggle: () => null };

describe('CardLink', () => {
  it('is a plain link: nothing covers the card, so its text stays selectable', () => {
    renderWithProviders(
      <CardLink href="https://ada.example/post">A post</CardLink>
    );
    expect(screen.getByRole('link', { name: /A post/ })).not.toHaveClass(
      'after:absolute'
    );
  });

  it('editor: a plain link, so a stray click doesn’t leave the page', () => {
    renderWithProviders(
      <ItemActionsContext value={ACTIONS}>
        <CardLink href="https://ada.example/post">A post</CardLink>
      </ItemActionsContext>
    );
    expect(screen.getByRole('link', { name: /A post/ })).not.toHaveClass(
      'after:absolute'
    );
  });

  it('can be named for what it opens, keeping its visible text', () => {
    renderWithProviders(
      <CardLink
        href="https://bsky.app/profile/x/post/1"
        label="Post on Bluesky, 9 Nov 2026"
      >
        9 Nov 2026
      </CardLink>
    );
    expect(
      screen.getByRole('link', { name: /^Post on Bluesky, 9 Nov 2026/ })
    ).toHaveTextContent('9 Nov 2026');
  });
});
