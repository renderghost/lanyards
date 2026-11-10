import { describe, expect, it } from 'vitest';

import { EDIT_LINKS } from './editLinks';

const urls = (type: keyof typeof EDIT_LINKS) =>
  EDIT_LINKS[type]('alice.test').map((link) => ({
    label: link.label.message,
    url: link.url,
  }));

describe('EDIT_LINKS', () => {
  it.each([
    ['talks', 'presentations'],
    ['publications', 'publications'],
    ['skills', 'skills'],
    ['education', 'education'],
    ['openTo', 'career'],
  ] as const)('sends %s to its section on Sifa', (type, anchor) => {
    expect(urls(type)).toEqual([
      {
        label: 'Edit on Sifa',
        url: `https://sifa.id/p/alice.test?edit=true#${anchor}`,
      },
    ]);
  });

  it('sends Bluesky posts to the Bluesky profile', () => {
    expect(urls('bskyPosts')).toEqual([
      { label: 'Edit in Bluesky', url: 'https://bsky.app/profile/alice.test' },
    ]);
  });

  it('offers both for links, which come from Sifa and Bluesky', () => {
    expect(urls('links')).toEqual([
      {
        label: 'Edit on Sifa',
        url: 'https://sifa.id/p/alice.test?edit=true#other-profiles',
      },
      { label: 'Edit in Bluesky', url: 'https://bsky.app/profile/alice.test' },
    ]);
  });

  it('offers nothing for sources edited elsewhere or in Lanyards', () => {
    expect(urls('code')).toEqual([]);
    expect(urls('media')).toEqual([]);
  });

  it('encodes the handle', () => {
    expect(EDIT_LINKS.skills('a b')[0]?.url).toBe(
      'https://sifa.id/p/a%20b?edit=true#skills'
    );
  });
});
