import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { MediaBlock } from './MediaBlock';

describe('MediaBlock', () => {
  it('labels the kind of media and platform', () => {
    renderWithProviders(
      <MediaBlock
        items={[
          {
            key: 'a',
            kind: 'audio',
            url: 'https://podcasts.example/episode-12',
            platform: 'apple-podcasts',
            title: 'Talking protocols',
            type: 'interview',
          },
          {
            key: 'v',
            kind: 'video',
            url: 'https://www.youtube.com/watch?v=x',
            platform: 'youtube',
          },
        ]}
      />
    );
    expect(screen.getByText('Interview · Apple Podcasts')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'youtube.com (opens in a new tab)' })
    ).toBeInTheDocument();
  });
});
