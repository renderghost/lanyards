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
});
