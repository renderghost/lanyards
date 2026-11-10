import { describe, expect, it } from 'vitest';

import type { BlueskyProfile } from '@/lib/sources/bluesky/bluesky.types';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import type { OrcidWork } from '@/lib/sources/orcid/orcid.types';
import { SourceError } from '@/lib/sources/result';
import type { SifaProfile } from '@/lib/sources/sifa/sifa.types';
import { ADA } from '@/test/people';

import { composeBlocks } from './blocks';
import { type LanyardConfig, resolveConfig } from './config';
import type { SourceSnapshot } from './personView.types';

const sifaKey = (collection: string, rkey: string) =>
  `at://${ADA.did}/id.sifa.profile.${collection}/${rkey}`;

const bluesky: BlueskyProfile = {
  did: ADA.did,
  handle: 'alice.test',
  links: [
    {
      key: `at://${ADA.did}/app.bsky.actor.link/1`,
      url: 'https://ada.example/',
      title: 'Website',
      iconUrl: 'https://cdn.bsky.app/icon-site',
    },
    {
      key: `at://${ADA.did}/app.bsky.actor.link/2`,
      url: 'https://github.com/ada-example',
      iconUrl: 'https://cdn.bsky.app/icon-github',
    },
  ],
  labels: [],
};

const sifa: SifaProfile = {
  langs: ['en'],
  location: 'Edinburgh',
  openTo: ['mentoringOthers'],
  positions: [],
  education: [],
  skills: [{ key: sifaKey('skill', 's1'), name: 'TypeScript' }],
  externalAccounts: [
    {
      key: sifaKey('externalAccount', 'a1'),
      url: 'https://www.ada.example',
      platform: 'website',
      label: 'Personal site',
    },
    {
      key: sifaKey('externalAccount', 'a2'),
      url: 'https://github.com/ada-example/',
      platform: 'github',
      label: 'GitHub',
    },
    {
      key: sifaKey('externalAccount', 'a3'),
      url: 'https://orcid.org/0000-0002-1825-0097',
      platform: 'orcid',
      label: 'ORCID',
    },
    {
      key: sifaKey('externalAccount', 'a4'),
      url: 'https://mastodon.example/@ada',
      platform: 'fediverse',
      label: 'Mastodon',
    },
    {
      key: sifaKey('externalAccount', 'a5'),
      url: 'javascript:alert(1)',
      platform: 'other',
      label: 'Sneaky',
    },
  ],
  publications: [
    {
      key: sifaKey('publication', 'p1'),
      title: 'Sifa title',
      doi: '10.1234/EXAMPLE.2023',
      url: 'https://journal.example/a',
      date: '2023-05',
      venue: 'Journal of Examples',
    },
    {
      key: sifaKey('publication', 'p2'),
      title: 'Only on Sifa',
      date: '2024-01',
    },
  ],
  talks: [
    { key: sifaKey('presentationDelivery', 'd1'), title: 'Talk one' },
    { key: sifaKey('presentationDelivery', 'd2'), title: 'Talk two' },
    { key: sifaKey('presentationDelivery', 'd3'), title: 'Talk three' },
    { key: sifaKey('presentationDelivery', 'd4'), title: 'Talk four' },
  ],
};

const lanyards: LanyardRecords = {
  config: null,
  webLinks: [
    {
      key: `at://${ADA.did}/app.lanyards.link.web/1`,
      url: 'https://ada.example',
      title: "Ada's site",
    },
    {
      key: `at://${ADA.did}/app.lanyards.link.web/2`,
      url: 'https://ada.example/cv',
      title: 'CV',
    },
  ],
  media: [],
};

const works: OrcidWork[] = [
  {
    key: 'orcid:0000-0002-1825-0097/1',
    title: 'ORCID title',
    doi: '10.1234/example.2023',
    year: '2023',
  },
  { key: 'orcid:0000-0002-1825-0097/2', title: 'Only on ORCID', year: '2021' },
];

const ready = <T>(value: T) => ({ status: 'ready' as const, value });
const failed = (source: 'sifa' | 'orcid' | 'bluesky') => ({
  status: 'error' as const,
  error: new SourceError(source, 'server'),
});

const allSources: SourceSnapshot = {
  bluesky: ready(bluesky),
  sifa: ready(sifa),
  lanyards: ready(lanyards),
  orcidWorks: ready(works),
};

const showOnly = (
  types: LanyardConfig['blocks'][number]['type'][],
  extra: Partial<LanyardConfig> = {}
): LanyardConfig => ({
  ...resolveConfig(null),
  blocks: types.map((type) => ({ type, visible: true })),
  ...extra,
});

const compose = (
  config: LanyardConfig,
  sources: SourceSnapshot = allSources,
  mode: 'owner' | 'visitor' = 'visitor',
  orcidVerified = false
) => composeBlocks({ config, sources, mode, orcidVerified });

describe('composeBlocks: links', () => {
  it('merges every source, de-duplicates by URL and prefers the owner’s titles', () => {
    const [links] = compose(showOnly(['links']));
    expect(links).toEqual({
      type: 'links',
      status: 'ready',
      failedSources: [],
      items: [
        {
          key: 'https://ada.example/',
          url: 'https://ada.example/',
          title: "Ada's site",
          platform: 'website',
          iconUrl: 'https://cdn.bsky.app/icon-site',
        },
        {
          key: 'https://github.com/ada-example',
          url: 'https://github.com/ada-example',
          title: 'GitHub',
          platform: 'github',
          iconUrl: 'https://cdn.bsky.app/icon-github',
        },
        {
          key: 'https://ada.example/cv',
          url: 'https://ada.example/cv',
          title: 'CV',
          platform: 'website',
        },
        {
          key: 'https://orcid.org/0000-0002-1825-0097',
          url: 'https://orcid.org/0000-0002-1825-0097',
          title: 'ORCID',
          platform: 'orcid',
        },
        {
          key: 'https://mastodon.example/@ada',
          url: 'https://mastodon.example/@ada',
          title: 'Mastodon',
          platform: 'fediverse',
        },
      ],
    });
  });

  it('falls back to the host when no source gives a title', () => {
    const [links] = compose(showOnly(['links']), {
      bluesky: ready({
        ...bluesky,
        links: [{ key: 'k', url: 'https://plain.example/page' }],
      }),
      sifa: ready(null),
      lanyards: ready({ ...lanyards, webLinks: [] }),
    });
    expect(links?.status === 'ready' && links.items).toEqual([
      expect.objectContaining({ title: 'plain.example' }),
    ]);
  });
});

describe('composeBlocks: publications', () => {
  it('merges ORCID and Sifa by DOI, preferring ORCID’s title', () => {
    const [publications] = compose(showOnly(['publications']));
    expect(publications?.status === 'ready' && publications.items).toEqual([
      {
        key: sifaKey('publication', 'p2'),
        title: 'Only on Sifa',
        year: '2024',
        orcidVerified: false,
      },
      {
        key: 'orcid:0000-0002-1825-0097/1',
        title: 'ORCID title',
        doi: '10.1234/example.2023',
        year: '2023',
        url: 'https://journal.example/a',
        venue: 'Journal of Examples',
        orcidVerified: false,
      },
      {
        key: 'orcid:0000-0002-1825-0097/2',
        title: 'Only on ORCID',
        year: '2021',
        orcidVerified: false,
      },
    ]);
  });

  it('marks ORCID-backed items when the ORCID iD is verified', () => {
    const [publications] = compose(
      showOnly(['publications'], {
        blocks: [{ type: 'publications', visible: true, limit: 5 }],
      }),
      allSources,
      'visitor',
      true
    );
    const verified =
      publications?.status === 'ready'
        ? publications.items.map((item) =>
            'orcidVerified' in item ? item.orcidVerified : null
          )
        : [];
    expect(verified).toEqual([false, true, true]);
  });
});

describe('composeBlocks: owner choices', () => {
  it('removes hidden items before applying the limit', () => {
    const [talks] = compose(
      showOnly(['talks'], { hidden: [sifaKey('presentationDelivery', 'd1')] })
    );
    expect(
      talks?.status === 'ready' &&
        talks.items.map((item) => ('title' in item ? item.title : ''))
    ).toEqual(['Talk two', 'Talk three', 'Talk four']);
  });

  it('hides a link by its URL', () => {
    const [links] = compose(
      showOnly(['links'], { hidden: ['https://ada.example'] })
    );
    expect(
      links?.status === 'ready' && links.items.map((item) => item.key)
    ).not.toContain('https://ada.example/');
  });

  it('follows the configured order and leaves out invisible blocks', () => {
    const config: LanyardConfig = {
      ...resolveConfig(null),
      blocks: [
        { type: 'skills', visible: true },
        { type: 'links', visible: false },
        { type: 'talks', visible: true },
      ],
    };
    expect(compose(config).map((block) => block.type)).toEqual([
      'skills',
      'talks',
    ]);
  });
});

describe('composeBlocks: loading and failures', () => {
  it('keeps loading blocks for everyone', () => {
    expect(
      compose(showOnly(['talks']), { sifa: { status: 'loading' } })
    ).toEqual([{ type: 'talks', status: 'loading' }]);
  });

  it('hides empty blocks from everyone, including the owner', () => {
    const empty = { ...sifa, skills: [] };
    expect(compose(showOnly(['skills']), { sifa: ready(empty) })).toEqual([]);
    expect(
      compose(showOnly(['skills']), { sifa: ready(empty) }, 'owner')
    ).toEqual([]);
  });

  it('hides a failed block from visitors but tells the owner', () => {
    expect(compose(showOnly(['talks']), { sifa: failed('sifa') })).toEqual([]);
    expect(
      compose(showOnly(['talks']), { sifa: failed('sifa') }, 'owner')
    ).toEqual([{ type: 'talks', status: 'error', sources: ['sifa'] }]);
  });

  it('shows what loaded when only some of a block’s sources failed', () => {
    const [links] = compose(
      showOnly(['links']),
      { ...allSources, sifa: failed('sifa') },
      'owner'
    );
    expect(links?.status === 'ready' && links.failedSources).toEqual(['sifa']);
    expect(links?.status === 'ready' && links.items).toHaveLength(3);
  });
});
