import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';

import view from './fixtures/getProfileView.json';
import records from './fixtures/records.json';
import { fetchSifaProfile } from './sifa';

const VIEW_URL = 'https://sifa.id/xrpc/id.sifa.getProfileView';
const uri = (collection: string, rkey: string) =>
  `at://${ADA.did}/id.sifa.profile.${collection}/${rkey}`;

const serveView = (response: () => Response) =>
  server.use(http.get(VIEW_URL, response));

const serveRecords = () => {
  mockDidDocument(ADA.did, ADA.pds);
  for (const [collection, list] of Object.entries(records)) {
    mockListRecords(ADA.pds, ADA.did, collection, list);
  }
};

describe('fetchSifaProfile from the Sifa view', () => {
  beforeEach(() => {
    serveView(() => HttpResponse.json(view));
  });

  it('asks the Sifa AppView for the person by DID', async () => {
    let actor: string | null = null;
    serveView(() => HttpResponse.json(view));
    server.use(
      http.get(VIEW_URL, ({ request }) => {
        actor = new URL(request.url).searchParams.get('actor');
        return HttpResponse.json(view);
      })
    );
    await fetchSifaProfile(ADA.did);
    expect(actor).toBe(ADA.did);
  });

  it('maps the profile basics', async () => {
    const result = await fetchSifaProfile(ADA.did);
    if (!result.ok || !result.value) throw new Error('no profile');
    const { positions, talks, externalAccounts, ...basics } = result.value;
    expect(basics).toMatchObject({
      handle: 'alice.test',
      displayName: 'Ada Example',
      pronouns: 'she/her',
      headline: 'Research Engineer building open research tools',
      location: 'Edinburgh, Scotland, United Kingdom',
      langs: ['en', 'fr'],
      openTo: ['speakingEngagements', 'mentoringOthers'],
    });
    expect(positions[0]).toEqual({
      key: uri('position', '3mpos1'),
      title: 'Research Engineer',
      company: 'Example Lab',
      startedAt: '2024-03',
      isPrimary: true,
    });
    expect(positions[2]).toMatchObject({
      endedAt: '2024-02',
      isPrimary: false,
    });
    expect(externalAccounts.map((account) => account.platform)).toEqual([
      'orcid',
      'website',
      'github',
      'fediverse',
    ]);
    expect(talks.length).toBeGreaterThan(0);
  });

  it('merges delivered talks with standalone deliveries, newest first', async () => {
    const result = await fetchSifaProfile(ADA.did);
    expect(result.ok && result.value?.talks).toEqual([
      {
        key: uri('presentationDelivery', '3mdel3'),
        title: 'Panel on open science',
        eventName: 'Open Science Week',
        date: '2025-09-01',
        role: 'panelist',
        url: 'https://openscience.example/panel',
      },
      {
        key: uri('presentationDelivery', '3mdel2'),
        title: 'Building on ATProto',
        eventName: 'Protocol Summit',
        date: '2025-06-12',
        role: 'keynote',
      },
      {
        key: uri('presentationDelivery', '3mdel1'),
        title: 'Building on ATProto',
        eventName: 'Example Conf 2024',
        date: '2024-03-07',
        role: 'presenter',
        url: 'https://conf.example/2024/talks/atproto',
      },
    ]);
  });

  it('leaves out blog posts that Sifa merges into publications', async () => {
    const result = await fetchSifaProfile(ADA.did);
    expect(result.ok && result.value?.publications).toEqual([
      {
        key: uri('publication', '3mpub1'),
        title: 'A study of open protocols',
        doi: '10.1234/EXAMPLE.2023',
        url: 'https://journal.example/open-protocols',
        date: '2023-05',
        venue: 'Journal of Examples',
      },
    ]);
  });

  it('keeps items that carry nulls and drops only items that fail their schema', async () => {
    serveView(() =>
      HttpResponse.json({
        ...view,
        positions: [
          { ...view.positions[0], onBehalfOf: null },
          { rkey: '3mbroken', title: 42 },
          view.positions[1],
        ],
      })
    );
    const result = await fetchSifaProfile(ADA.did);
    expect(result.ok && result.value?.positions.map((p) => p.title)).toEqual([
      'Research Engineer',
      'Visiting Fellow',
    ]);
  });
});

describe('fetchSifaProfile when there is no Sifa profile', () => {
  it('returns null without reading the PDS', async () => {
    serveView(() =>
      HttpResponse.json({ error: 'ProfileNotFound' }, { status: 400 })
    );
    // No PDS handlers: any fallback request would fail the test.
    await expect(fetchSifaProfile(ADA.did)).resolves.toEqual({
      ok: true,
      value: null,
    });
  });
});

describe('fetchSifaProfile falling back to the PDS', () => {
  it.each([
    ['a server error', () => HttpResponse.json({}, { status: 500 })],
    ['rate limiting', () => HttpResponse.json({}, { status: 429 })],
    ['a network failure', () => HttpResponse.error()],
    ['an invalid body', () => HttpResponse.json({ positions: 'nope' })],
  ])('reads the records after %s', async (_label, response) => {
    serveView(response);
    serveRecords();
    const result = await fetchSifaProfile(ADA.did);
    if (!result.ok || !result.value) throw new Error('no fallback profile');
    expect(result.value.headline).toBe(
      'Research Engineer building open research tools'
    );
    expect(result.value.positions.map((p) => p.title)).toEqual([
      'Research Engineer',
      'Software Developer',
    ]);
  });

  it('maps every collection from the records', async () => {
    serveView(() => HttpResponse.json({}, { status: 503 }));
    serveRecords();
    const result = await fetchSifaProfile(ADA.did);
    if (!result.ok || !result.value) throw new Error('no fallback profile');
    expect(result.value).toMatchObject({
      displayName: 'Ada Example',
      pronouns: 'she/her',
      langs: ['en'],
      openTo: ['mentoringOthers'],
      location: 'Edinburgh, Scotland, United Kingdom',
      avatar: expect.stringContaining(
        `https://cdn.bsky.app/img/avatar_thumbnail/plain/${ADA.did}/bafkrei`
      ),
      education: [
        {
          key: uri('education', '3medu1'),
          institution: 'University of Example',
          degree: 'PhD',
          fieldOfStudy: 'Computer Science',
          startedAt: '2014',
          endedAt: '2018',
        },
      ],
      skills: [{ key: uri('skill', '3mskill1'), name: 'TypeScript' }],
      externalAccounts: [
        {
          key: uri('externalAccount', '3macc1'),
          url: 'https://orcid.org/0000-0002-1825-0097',
          platform: 'orcid',
          label: 'ORCID',
        },
        {
          key: uri('externalAccount', '3macc3'),
          url: 'https://github.com/ada-example',
          platform: 'github',
          label: 'GitHub',
        },
      ],
      talks: [
        {
          key: uri('presentationDelivery', '3mdel3'),
          title: 'Panel on open science',
          eventName: 'Open Science Week',
          date: '2025-09-01',
          role: 'panelist',
        },
        {
          key: uri('presentationDelivery', '3mdel1'),
          title: 'Building on ATProto',
          eventName: 'Example Conf 2024',
          date: '2024-03-07',
          role: 'presenter',
          url: 'https://conf.example/2024/talks/atproto',
        },
      ],
    });
  });

  it('fails when the fallback fails too', async () => {
    serveView(() => HttpResponse.json({}, { status: 500 }));
    mockDidDocument(ADA.did, ADA.pds);
    server.use(
      http.get(`${ADA.pds}/xrpc/com.atproto.repo.listRecords`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    const result = await fetchSifaProfile(ADA.did);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.source).toBe('sifa');
      expect(result.error.kind).toBe('server');
    }
  });
});
