import { Client, simpleFetchHandler } from '@atcute/client';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { BSKY_APPVIEW_AUD } from '@/lib/atproto/endpoints';
import { server } from '@/test/msw';
import { ADA, BEA, CAL } from '@/test/people';

import {
  fetchKnownFollowers,
  fetchPosts,
  fetchProfile,
  fetchRelationship,
} from './bluesky';
import authorFeed from './fixtures/getAuthorFeed.json';
import knownFollowers from './fixtures/getKnownFollowers.json';
import profile from './fixtures/getProfile.json';
import relationships from './fixtures/getRelationships.json';

const APPVIEW = 'https://public.api.bsky.app/xrpc';
const VIEWER_PDS = 'https://pds.viewer.test';

const viewerAppview = () =>
  new Client({
    handler: simpleFetchHandler({ service: VIEWER_PDS }),
    proxy: BSKY_APPVIEW_AUD,
  });

describe('fetchProfile', () => {
  it('maps the public profile, keeping links in profile order', async () => {
    server.use(
      http.get(`${APPVIEW}/app.bsky.actor.getProfile`, ({ request }) =>
        new URL(request.url).searchParams.get('actor') === 'alice.test'
          ? HttpResponse.json(profile)
          : undefined
      )
    );
    const result = await fetchProfile('alice.test');
    expect(result).toEqual({
      ok: true,
      value: {
        did: ADA.did,
        handle: 'alice.test',
        displayName: 'Ada Example',
        description:
          'Research engineer working on open protocols.\n\nAlso: tea, trains and typography.',
        pronouns: 'she/her',
        avatar: `https://cdn.bsky.app/img/avatar_thumbnail/plain/${ADA.did}/bafkreiadaavatar@jpeg`,
        links: [
          {
            key: `at://${ADA.did}/app.bsky.actor.link/3mfixturelink0`,
            url: 'https://ada.example/',
            title: 'Website',
            iconUrl: `https://cdn.bsky.app/img/avatar/plain/${ADA.did}/bafkreifixtureicon0@jpeg`,
          },
          {
            key: `at://${ADA.did}/app.bsky.actor.link/3mfixturelink1`,
            url: 'https://github.com/ada-example',
            iconUrl: `https://cdn.bsky.app/img/avatar/plain/${ADA.did}/bafkreifixtureicon1@jpeg`,
          },
          {
            key: `at://${ADA.did}/app.bsky.actor.link/3mfixturelink2`,
            url: 'https://linkat.blue/alice.test',
            title: 'Linkat',
            iconUrl: `https://cdn.bsky.app/img/avatar/plain/${ADA.did}/bafkreifixtureicon2@jpeg`,
          },
        ],
        labels: [],
      },
    });
  });

  it('collects label values, such as the logged-out opt-out', async () => {
    server.use(
      http.get(`${APPVIEW}/app.bsky.actor.getProfile`, () =>
        HttpResponse.json({
          ...profile,
          labels: [
            {
              src: ADA.did,
              uri: `at://${ADA.did}/app.bsky.actor.profile/self`,
              val: '!no-unauthenticated',
              cts: '2026-01-01T00:00:00.000Z',
            },
          ],
        })
      )
    );
    const result = await fetchProfile(ADA.did);
    expect(result.ok && result.value.labels).toEqual(['!no-unauthenticated']);
  });

  it('reports a missing profile as not found', async () => {
    server.use(
      http.get(`${APPVIEW}/app.bsky.actor.getProfile`, () =>
        HttpResponse.json(
          { error: 'InvalidRequest', message: 'Profile not found' },
          { status: 400 }
        )
      )
    );
    const result = await fetchProfile('nobody.test');
    expect(!result.ok && result.error.kind).toBe('notFound');
  });

  it.each(['AccountTakedown', 'AccountDeactivated'])(
    'reports %s as unavailable',
    async (error) => {
      server.use(
        http.get(`${APPVIEW}/app.bsky.actor.getProfile`, () =>
          HttpResponse.json({ error }, { status: 400 })
        )
      );
      const result = await fetchProfile(ADA.did);
      expect(!result.ok && result.error.kind).toBe('unavailable');
    }
  );
});

describe('fetchPosts', () => {
  it('asks for posts without replies and drops reposts', async () => {
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`${APPVIEW}/app.bsky.feed.getAuthorFeed`, ({ request }) => {
        query = new URL(request.url).searchParams;
        return HttpResponse.json(authorFeed);
      })
    );
    const result = await fetchPosts(ADA.did, 3);
    expect(query?.get('actor')).toBe(ADA.did);
    expect(query?.get('filter')).toBe('posts_no_replies');
    expect(query?.get('limit')).toBe('6');
    expect(result.ok && result.value.map((post) => post.text)).toEqual([
      'Slides from my talk are up: ada.example/slides',
      'Great to meet @bea.test at the conference <b>today</b>',
      'Plain post with no links.',
    ]);
  });

  it('returns at most the limit, with a bsky.app link and facets', async () => {
    server.use(
      http.get(`${APPVIEW}/app.bsky.feed.getAuthorFeed`, () =>
        HttpResponse.json(authorFeed)
      )
    );
    const result = await fetchPosts(ADA.did, 1);
    expect(result.ok && result.value).toEqual([
      {
        key: `at://${ADA.did}/app.bsky.feed.post/3mfixturepost1`,
        url: `https://bsky.app/profile/${ADA.did}/post/3mfixturepost1`,
        text: 'Slides from my talk are up: ada.example/slides',
        facets: authorFeed.feed[0]!.post.record.facets,
        createdAt: '2026-11-09T10:00:00.000Z',
      },
    ]);
  });

  it('caps the request at 30 posts', async () => {
    let limit: string | null = null;
    server.use(
      http.get(`${APPVIEW}/app.bsky.feed.getAuthorFeed`, ({ request }) => {
        limit = new URL(request.url).searchParams.get('limit');
        return HttpResponse.json({ feed: [] });
      })
    );
    await fetchPosts(ADA.did, 20);
    expect(limit).toBe('30');
  });
});

describe('fetchRelationship', () => {
  it('asks the AppView through the viewer PDS and reads follows both ways', async () => {
    let proxyHeader: string | null = null;
    server.use(
      http.get(
        `${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`,
        ({ request }) => {
          proxyHeader = request.headers.get('atproto-proxy');
          return HttpResponse.json(relationships);
        }
      )
    );
    const result = await fetchRelationship(viewerAppview(), BEA.did, ADA.did);
    expect(proxyHeader).toBe(BSKY_APPVIEW_AUD);
    expect(result).toEqual({
      ok: true,
      value: {
        followUri: `at://${BEA.did}/app.bsky.graph.follow/3mfixturefollow`,
        followedBy: true,
        blocked: false,
      },
    });
  });

  it.each(['blocking', 'blockedBy', 'blockingByList', 'blockedByList'])(
    'treats %s as blocked',
    async (field) => {
      server.use(
        http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () =>
          HttpResponse.json({
            actor: BEA.did,
            relationships: [
              {
                $type: 'app.bsky.graph.defs#relationship',
                did: ADA.did,
                [field]: `at://${BEA.did}/app.bsky.graph.block/3mblock`,
              },
            ],
          })
        )
      );
      const result = await fetchRelationship(viewerAppview(), BEA.did, ADA.did);
      expect(result.ok && result.value).toEqual({
        followedBy: false,
        blocked: true,
      });
    }
  );

  it('reports a refused call as an error', async () => {
    server.use(
      http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () =>
        HttpResponse.json({ error: 'ScopeMissingError' }, { status: 403 })
      )
    );
    const result = await fetchRelationship(viewerAppview(), BEA.did, ADA.did);
    expect(!result.ok && result.error.kind).toBe('invalid');
  });
});

describe('fetchKnownFollowers', () => {
  it('samples two followers and counts the rest', async () => {
    let limit: string | null = null;
    server.use(
      http.get(
        `${VIEWER_PDS}/xrpc/app.bsky.graph.getKnownFollowers`,
        ({ request }) => {
          limit = new URL(request.url).searchParams.get('limit');
          return HttpResponse.json(knownFollowers);
        }
      )
    );
    const result = await fetchKnownFollowers(viewerAppview(), ADA.did);
    expect(limit).toBe('50');
    expect(result).toEqual({
      ok: true,
      value: {
        sample: [
          { did: BEA.did, handle: 'bea.test', displayName: 'Bea Example' },
          { did: CAL.did, handle: 'cal.test', displayName: 'Cal Example' },
        ],
        count: 5,
        more: true,
      },
    });
  });
});
