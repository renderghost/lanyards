import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { BlogPostsBlock } from './BlogPostsBlock';

describe('BlogPostsBlock', () => {
  it('links each post with its publication and date', async () => {
    const { container } = renderWithProviders(
      <BlogPostsBlock
        items={[
          {
            key: 'k',
            title: 'First post',
            url: 'https://ada.leaflet.pub/first-post',
            publicationName: "Ada's notes",
            publishedAt: '2026-10-01T09:00:00.000Z',
          },
        ]}
      />
    );
    expect(
      screen.getByRole('link', { name: 'First post (opens in a new tab)' })
    ).toHaveAttribute('href', 'https://ada.leaflet.pub/first-post');
    expect(screen.getByText("Ada's notes · 1 Oct 2026")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('a card with its thumbnail, opening the article', () => {
    renderWithProviders(
      <BlogPostsBlock
        items={[
          {
            key: 'at://x/site.standard.document/1',
            title: 'Designing for the open web',
            url: 'https://ada.example/open-web',
            publishedAt: '2026-11-04T09:00:00.000Z',
            thumbnail:
              'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:x/bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy@jpeg',
          },
        ]}
      />
    );
    const image = document.querySelector('img');
    expect(image).toHaveAttribute(
      'src',
      'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:x/bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy@jpeg'
    );
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('a card without a cover shows the document icon', () => {
    renderWithProviders(
      <BlogPostsBlock
        items={[
          {
            key: 'at://x/site.standard.document/2',
            title: 'No cover',
            url: 'https://ada.example/no-cover',
            publishedAt: '2026-11-04T09:00:00.000Z',
          },
        ]}
      />
    );
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('[data-thumbnail] svg')).not.toBeNull();
  });
});
