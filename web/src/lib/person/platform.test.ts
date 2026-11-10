import { describe, expect, it } from 'vitest';

import { detectPlatform } from './platform';

describe('detectPlatform', () => {
  it.each([
    ['https://github.com/ada', 'github'],
    ['https://gitlab.com/ada', 'gitlab'],
    ['https://codeberg.org/ada', 'codeberg'],
    ['https://tangled.org/ada.test', 'tangled'],
    ['https://tangled.sh/@ada.test', 'tangled'],
    ['https://orcid.org/0000-0002-1825-0097', 'orcid'],
    ['https://www.linkedin.com/in/ada', 'linkedin'],
    ['https://youtu.be/abc', 'youtube'],
    ['https://m.youtube.com/@ada', 'youtube'],
    ['https://bsky.app/profile/ada.test', 'bluesky'],
    ['https://sifa.id/p/ada.test', 'sifa'],
    ['https://x.com/ada', 'x'],
    ['https://twitter.com/ada', 'x'],
    ['https://www.instagram.com/ada', 'instagram'],
    ['https://scholar.google.com/citations?user=x', 'googleScholar'],
    ['https://ada.substack.com', 'substack'],
    ['https://semble.so/profile/ada.test', 'semble'],
  ])('recognises %s as %s', (url, platform) => {
    expect(detectPlatform(url)).toBe(platform);
  });

  it('uses the Sifa platform when the host says nothing', () => {
    expect(detectPlatform('https://mastodon.example/@ada', 'fediverse')).toBe(
      'fediverse'
    );
  });

  it('falls back to website', () => {
    expect(detectPlatform('https://ada.example/')).toBe('website');
    expect(detectPlatform('https://ada.example/', 'other')).toBe('website');
    expect(detectPlatform('not a url')).toBe('website');
  });
});
