import { describe, expect, it, vi } from 'vitest';

import { normaliseUrl } from '@/lib/normalise';
import type {
  BlueskyProfile,
  BskyPost,
} from '@/lib/sources/bluesky/bluesky.types';
import type { LanyardRecords } from '@/lib/sources/lanyards/lanyards.types';
import type { OrcidWork } from '@/lib/sources/orcid/orcid.types';
import { SourceError } from '@/lib/sources/result';
import type { SifaProfile } from '@/lib/sources/sifa/sifa.types';
import { ADA } from '@/test/people';

import {
  composeBlocks,
  composeEditorBlocks,
  hiddenItems,
  hiddenMatcher,
  orphanedHiddenKeys,
} from './blocks';
import { type LanyardConfig, resolveConfig } from './config';
import type { LinkItem, SourceSnapshot } from './personView.types';

// Counted, to keep hiddenItems' cost in step with the list's length.
vi.mock('@/lib/normalise', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/normalise')>();
  return { ...actual, normaliseUrl: vi.fn(actual.normaliseUrl) };
});

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
  showHonorifics: true,
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

const lanyards: LanyardRecords = { media: [] };

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
  it('only shows link icons from Bluesky’s image CDN', () => {
    const [links] = compose(showOnly(['links']), {
      ...allSources,
      bluesky: ready({
        ...bluesky,
        links: [
          {
            key: `at://${ADA.did}/app.bsky.actor.link/1`,
            url: 'https://ada.example/',
            iconUrl: 'https://tracker.example/icon.png',
          },
        ],
      }),
    });
    const site = links?.status === 'ready' ? links.items[0] : undefined;
    expect(site).toMatchObject({ url: 'https://ada.example/' });
    expect(site).not.toHaveProperty('iconUrl');
  });

  it('merges Bluesky and Sifa, de-duplicates by URL and prefers Bluesky’s titles', () => {
    const [links] = compose(showOnly(['links']));
    expect(links).toEqual({
      type: 'links',
      status: 'ready',
      failedSources: [],
      items: [
        {
          key: 'https://ada.example/',
          url: 'https://ada.example/',
          title: 'Website',
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
      lanyards: ready(lanyards),
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
    expect(links?.status === 'ready' && links.items).toHaveLength(2);
  });
});

describe('hiddenItems', () => {
  it('finds each hidden item with its block, so the owner can show it again', () => {
    const config = showOnly(['talks'], {
      hidden: [
        sifaKey('presentationDelivery', 'd2'),
        'https://github.com/ada-example',
        'at://did:plc:fixturealiceaaaaaaaaaaaa/app.lanyards.link.web/gone',
      ],
    });
    expect(
      hiddenItems({ config, sources: allSources, orcidVerified: false })
    ).toEqual([
      {
        key: sifaKey('presentationDelivery', 'd2'),
        type: 'talks',
        item: expect.objectContaining({ title: 'Talk two' }),
      },
      {
        key: 'https://github.com/ada-example',
        type: 'links',
        item: expect.objectContaining({ title: 'GitHub' }),
      },
      {
        key: 'at://did:plc:fixturealiceaaaaaaaaaaaa/app.lanyards.link.web/gone',
        reason: 'gone',
      },
    ]);
  });

  it('knows the Details item, and waits on the profile for Code and Collections', () => {
    const code = `at://${ADA.did}/org.tangled.repo.manifest/self`;
    const collection = `at://${ADA.did}/network.cosmik.collection/3mcol`;
    const config = showOnly(['code', 'collections'], {
      hidden: ['details', code, collection],
    });
    // Without a handle, Tangled and Semble are never asked.
    const { tangled: _t, semble: _s, ...rest } = allSources;
    const loading: SourceSnapshot = { ...rest, bluesky: { status: 'loading' } };
    expect(
      hiddenItems({ config, sources: loading, orcidVerified: false })
    ).toEqual([
      // Sifa has it, so it's found even though Details is switched off.
      { key: 'details', type: 'details', item: expect.anything() },
      { key: code, type: 'code', reason: 'loading' },
      { key: collection, type: 'collections', reason: 'loading' },
    ]);
    const failed: SourceSnapshot = {
      ...rest,
      bluesky: { status: 'error', error: new SourceError('bluesky', 'server') },
      sifa: { status: 'error', error: new SourceError('sifa', 'server') },
    };
    expect(
      hiddenItems({ config, sources: failed, orcidVerified: false }).map(
        (entry) => ('reason' in entry ? entry.reason : null)
      )
    ).toEqual(['off', 'failed', 'failed']);
  });

  it('says why it can’t show a hidden item: block off, loading, failed or gone', () => {
    const code = `at://${ADA.did}/org.tangled.repo.manifest/self`;
    const blog = `at://${ADA.did}/site.standard.document/3mblog`;
    const post = `at://${ADA.did}/app.bsky.feed.post/3mpost`;
    const talk = sifaKey('presentationDelivery', 'deleted');
    const config = showOnly(['talks', 'blogPosts', 'bskyPosts'], {
      hidden: [code, blog, post, talk, 'mystery'],
    });
    const sources: SourceSnapshot = {
      ...allSources,
      standardSite: {
        status: 'error',
        error: new SourceError('standardSite', 'server'),
      },
      blueskyPosts: { status: 'loading' },
    };
    expect(hiddenItems({ config, sources, orcidVerified: false })).toEqual([
      { key: code, type: 'code', reason: 'off' },
      { key: blog, type: 'blogPosts', reason: 'failed' },
      { key: post, type: 'bskyPosts', reason: 'loading' },
      { key: talk, type: 'talks', reason: 'gone' },
      { key: 'mystery', reason: 'gone' },
    ]);
  });
});

const posts: BskyPost[] = ['p1', 'p2', 'p3'].map((rkey, index) => ({
  key: `at://${ADA.did}/app.bsky.feed.post/${rkey}`,
  url: `https://bsky.app/profile/alice.test/post/${rkey}`,
  text: `Post ${index + 1}`,
  createdAt: `2026-11-0${index + 1}T09:00:00.000Z`,
}));

const titles = (items: { key: string }[] | false | undefined) =>
  items ? items.map((item) => ('title' in item ? item.title : item.key)) : [];

describe('counts: feeds and Publications only (#118)', () => {
  it('shows every talk, whatever limit was stored', () => {
    const [talks] = compose({
      ...resolveConfig(null),
      blocks: [{ type: 'talks', visible: true, limit: 1 }],
    });
    expect(talks?.status === 'ready' && talks.items).toHaveLength(4);
  });

  it('shows every link, past the old cap of 20', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      key: `at://${ADA.did}/app.bsky.actor.link/${index}`,
      url: `https://ada.example/${index}`,
      title: `Link ${index}`,
    }));
    const [links] = compose(showOnly(['links']), {
      bluesky: ready({ ...bluesky, links: many }),
      sifa: ready(null),
    });
    expect(links?.status === 'ready' && links.items).toHaveLength(25);
  });

  it('counted blocks still stop at their count', () => {
    const [feed, publications] = compose(
      {
        ...resolveConfig(null),
        blocks: [
          { type: 'bskyPosts', visible: true, limit: 2 },
          { type: 'publications', visible: true, limit: 1 },
        ],
      },
      { ...allSources, blueskyPosts: ready(posts) }
    );
    expect(feed?.status === 'ready' && feed.items).toHaveLength(2);
    expect(publications?.status === 'ready' && publications.items).toHaveLength(
      1
    );
  });
});

describe('orphanedHiddenKeys', () => {
  it('lists only hidden entries that are gone', () => {
    const deleted = sifaKey('presentationDelivery', 'deleted');
    const blog = `at://${ADA.did}/site.standard.document/3mblog`;
    const code = `at://${ADA.did}/org.tangled.repo.manifest/self`;
    const config = showOnly(['talks', 'blogPosts'], {
      hidden: [deleted, blog, code, sifaKey('presentationDelivery', 'd1')],
    });
    const sources: SourceSnapshot = {
      ...allSources,
      standardSite: {
        status: 'error',
        error: new SourceError('standardSite', 'server'),
      },
    };
    // The blog post's source failed and Code is switched off: not gone.
    expect(
      orphanedHiddenKeys({ config, sources, orcidVerified: false })
    ).toEqual([deleted]);
  });
});

describe('a hidden legacy podcast that has moved (#132)', () => {
  const moved = {
    key: `at://${ADA.did}/app.lanyards.media.item/3mpod`,
    kind: 'audio' as const,
    url: 'https://pod.example/1',
  };
  const config = showOnly(['media'], {
    hidden: [`at://${ADA.did}/app.lanyards.link.media.audio/3mpod`],
  });
  const sources: SourceSnapshot = {
    ...allSources,
    lanyards: ready({ media: [moved] }),
  };

  it('stays hidden under its old key', () => {
    expect(compose(config, sources)).toEqual([]);
  });

  it('isn’t offered to Clear as gone', () => {
    expect(
      orphanedHiddenKeys({ config, sources, orcidVerified: false })
    ).toEqual([]);
  });
});

describe('composeEditorBlocks', () => {
  it('keeps hidden blocks and flags hidden items in place', () => {
    const hiddenLink = 'https://github.com/ada-example';
    const config: LanyardConfig = {
      ...resolveConfig(null),
      blocks: [
        { type: 'talks', visible: false },
        { type: 'links', visible: true },
      ],
      hidden: [hiddenLink],
    };
    const [talks, links] = composeEditorBlocks({
      config,
      sources: allSources,
      orcidVerified: false,
    });
    expect(talks).toMatchObject({ type: 'talks', visible: false });
    expect(links).toMatchObject({
      type: 'links',
      visible: true,
      status: 'ready',
    });
    const flagged = links?.items.map(({ item, hidden }) => [item.key, hidden]);
    const all = compose(showOnly(['links'], { hidden: [] }))[0];
    // Same items in the same order as with nothing hidden, GitHub flagged.
    expect(flagged?.map(([key]) => key)).toEqual(
      all?.status === 'ready' && all.items.map((item) => item.key)
    );
    expect(flagged?.filter(([, hidden]) => hidden).map(([key]) => key)).toEqual(
      [hiddenLink]
    );
  });

  it('cuts counted blocks to their count among shown items, keeping hidden ones in place', () => {
    const [feed] = composeEditorBlocks({
      config: {
        ...resolveConfig(null),
        blocks: [{ type: 'bskyPosts', visible: true, limit: 1 }],
        hidden: [posts[0]!.key],
      },
      sources: { ...allSources, blueskyPosts: ready(posts) },
      orcidVerified: false,
    });
    expect(feed).toMatchObject({ limit: 1 });
    expect(
      feed?.items.map(({ item, hidden }) => [
        'text' in item ? item.text : item.key,
        hidden,
      ])
    ).toEqual([
      ['Post 1', true],
      ['Post 2', false],
    ]);
  });

  it('says when a block is loading, empty or failed', () => {
    const blocks = composeEditorBlocks({
      config: showOnly(['talks', 'blogPosts', 'bskyPosts']),
      sources: {
        ...allSources,
        standardSite: {
          status: 'error',
          error: new SourceError('standardSite', 'server'),
        },
        blueskyPosts: { status: 'loading' },
      },
      orcidVerified: false,
    });
    expect(blocks.map((block) => [block.type, block.status])).toEqual([
      ['talks', 'ready'],
      ['blogPosts', 'error'],
      ['bskyPosts', 'loading'],
    ]);
    expect(blocks[1]?.failedSources).toEqual(['standardSite']);
    expect(titles(blocks[0]?.items.map(({ item }) => item))).toHaveLength(4);
  });
});

describe('hiddenMatcher', () => {
  it('knows a hidden key, and a link hidden by any form of its URL', () => {
    const isHidden = hiddenMatcher([
      'https://ada.example',
      sifaKey('presentationDelivery', 'd1'),
    ]);
    expect(isHidden('https://ada.example/')).toBe(true);
    expect(isHidden(sifaKey('presentationDelivery', 'd1'))).toBe(true);
    expect(isHidden(sifaKey('presentationDelivery', 'd2'))).toBe(false);
  });
});

describe('hiddenItems at scale', () => {
  it('normalises each candidate and each hidden key about once', () => {
    const hidden = Array.from(
      { length: 200 },
      (_, index) => `https://gone.example/${index}`
    );
    vi.mocked(normaliseUrl).mockClear();
    const found = hiddenItems({
      config: showOnly(['links', 'talks', 'publications'], { hidden }),
      sources: allSources,
      orcidVerified: false,
    });
    expect(found).toHaveLength(200);
    // Was one call per hidden key per candidate: thousands.
    expect(vi.mocked(normaliseUrl).mock.calls.length).toBeLessThan(1000);
  });
});

describe('links come only from Bluesky and Sifa', () => {
  // Old app.lanyards.link.web records may still be in a repository.
  const withOldLinks = ready({
    webLinks: [
      {
        key: `at://${ADA.did}/app.lanyards.link.web/2`,
        url: 'https://ada.example/cv',
        title: 'CV',
      },
    ],
    media: [],
  } as never);

  it('shows none of Lanyards’ own web links', () => {
    const [links] = compose(showOnly(['links']), { lanyards: withOldLinks });
    const items = (links?.status === 'ready' ? links.items : []) as LinkItem[];
    expect(items.map((item) => item.url)).not.toContain(
      'https://ada.example/cv'
    );
    expect(items.some((item) => 'ownKey' in item)).toBe(false);
  });

  it('a hidden key only an own link supplied becomes an orphan', () => {
    const config = showOnly(['links'], { hidden: ['https://ada.example/cv'] });
    expect(
      orphanedHiddenKeys({
        config,
        sources: { ...allSources, lanyards: withOldLinks },
        orcidVerified: false,
      })
    ).toEqual(['https://ada.example/cv']);
  });
});
