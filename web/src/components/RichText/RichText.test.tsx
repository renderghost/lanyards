import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import authorFeed from '@/lib/sources/bluesky/fixtures/getAuthorFeed.json';
import { BEA } from '@/test/people';
import { renderInRouter } from '@/test/router';

import { RichText } from './RichText';

const [linkPost, mentionPost] = authorFeed.feed.map((item) => item.post.record);

describe('RichText', () => {
  it('turns link facets into safe external links', async () => {
    renderInRouter(
      <RichText text={linkPost!.text} facets={linkPost!.facets as never} />
    );
    const link = await screen.findByRole('link', {
      name: 'ada.example/slides (opens in a new tab)',
    });
    expect(link).toHaveAttribute('href', 'https://ada.example/slides');
  });

  it('links mentions to the person’s lanyard by DID and keeps markup as text', async () => {
    const { container } = renderInRouter(
      <RichText
        text={mentionPost!.text}
        facets={mentionPost!.facets as never}
      />
    );
    const mention = await screen.findByRole('link', { name: '@bea.test' });
    expect(mention).toHaveAttribute('href', `/d/${BEA.did}`);
    expect(container.querySelector('b')).toBeNull();
    expect(container).toHaveTextContent('<b>today</b>');
  });

  it('never links a facet with an unsafe URI', async () => {
    renderInRouter(
      <RichText
        text="click me"
        facets={[
          {
            index: { byteStart: 0, byteEnd: 8 },
            features: [
              {
                $type: 'app.bsky.richtext.facet#link',
                uri: 'javascript:alert(1)',
              },
            ],
          },
        ]}
      />
    );
    expect(await screen.findByText('click me')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
