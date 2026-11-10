import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderInRouter } from '@/test/router';

import { BskyPostsBlock } from './BskyPostsBlock';

describe('BskyPostsBlock', () => {
  it('shows the post text, its date and a link to Bluesky', async () => {
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
    expect(
      screen.getByRole('link', { name: 'View on Bluesky (opens in a new tab)' })
    ).toHaveAttribute('href', 'https://bsky.app/profile/x/post/1');
    await expectNoAxeViolations(container);
  });
});
