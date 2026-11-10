import { describe, expect, it } from 'vitest';

import { i18n } from '@/i18n/i18n';

import { itemTitle } from './itemTitle';

describe('itemTitle', () => {
  it.each([
    [
      'links',
      {
        key: 'k',
        url: 'https://a.example',
        title: 'Website',
        platform: 'website',
      },
      'Website',
    ],
    ['talks', { key: 'k', title: 'Keynote' }, 'Keynote'],
    [
      'blogPosts',
      { key: 'k', title: 'On protocols', url: 'https://b.example' },
      'On protocols',
    ],
    [
      'publications',
      { key: 'k', title: 'A study', orcidVerified: false },
      'A study',
    ],
    ['skills', { key: 'k', name: 'TypeScript' }, 'TypeScript'],
    [
      'education',
      { key: 'k', institution: 'University of Example' },
      'University of Example',
    ],
    [
      'code',
      { key: 'k', name: 'lanyards', url: 'https://c.example' },
      'lanyards',
    ],
    [
      'collections',
      { key: 'k', name: 'Reading list', url: 'https://d.example' },
      'Reading list',
    ],
    ['openTo', { key: 'k', value: 'mentoringOthers' }, 'Mentoring others'],
    [
      'details',
      { key: 'details', languages: ['en'] },
      'Location and languages',
    ],
  ] as const)('names a %s item', (type, item, expected) => {
    expect(itemTitle(type, item as never, i18n)).toBe(expected);
  });

  it('names a talk by its event too, as one talk can be given twice', () => {
    expect(
      itemTitle(
        'talks',
        { key: 'k', title: 'Keynote', eventName: 'Example Conf 2024' } as never,
        i18n
      )
    ).toBe('Keynote at Example Conf 2024');
  });

  it('names media by title, or else by host', () => {
    expect(
      itemTitle(
        'media',
        {
          key: 'k',
          url: 'https://pod.example/ep1',
          kind: 'audio',
          platform: 'other',
        } as never,
        i18n
      )
    ).toBe('pod.example');
  });

  it('names a post by its first 60 characters', () => {
    const text = `${'word '.repeat(20)}end`;
    expect(
      itemTitle(
        'bskyPosts',
        {
          key: 'k',
          url: 'https://bsky.app/x',
          text,
          createdAt: '2026-01-01T00:00:00Z',
        } as never,
        i18n
      )
    ).toBe(`${text.slice(0, 60).trimEnd()}…`);
  });
});
