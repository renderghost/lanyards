import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderInRouter } from '@/test/router';

import { BskyPostsBlock } from './BskyPostsBlock';

describe('BskyPostsBlock', () => {
  it('a card: plain text, and the date links to the post', async () => {
    const { container } = renderInRouter(
      <BskyPostsBlock
        items={[
          {
            key: 'at://x/app.bsky.feed.post/1',
            url: 'https://bsky.app/profile/x/post/1',
            text: 'Hello <b>world</b>',
            createdAt: '2026-11-09T10:00:00.000Z',
          },
        ]}
      />
    );
    expect(await screen.findByText('Hello <b>world</b>')).toBeInTheDocument();
    expect(container.querySelector('b')).toBeNull();
    expect(screen.getByText('9 Nov 2026')).toHaveAttribute(
      'datetime',
      '2026-11-09T10:00:00.000Z'
    );
    // The date is the card's one link, named for what it opens.
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(
      screen.getByRole('link', { name: /^Post on Bluesky, 9 Nov 2026/ })
    ).toHaveAttribute('href', 'https://bsky.app/profile/x/post/1');
    await expectNoAxeViolations(container);
  });
});
