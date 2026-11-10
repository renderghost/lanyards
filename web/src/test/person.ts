import { Client, simpleFetchHandler } from '@atcute/client';
import { http, HttpResponse } from 'msw';
import { vi } from 'vitest';

import { BSKY_APPVIEW_AUD } from '@/lib/atproto/endpoints';
import { GRANULAR_SCOPE } from '@/lib/atproto/oauthConfig';
import knownFollowers from '@/lib/sources/bluesky/fixtures/getKnownFollowers.json';
import profile from '@/lib/sources/bluesky/fixtures/getProfile.json';
import relationships from '@/lib/sources/bluesky/fixtures/getRelationships.json';
import sifaView from '@/lib/sources/sifa/fixtures/getProfileView.json';

import { mockDidDocument, mockGetRecord, mockListRecords } from './handlers';
import { server } from './msw';
import { ADA, BEA } from './people';

const PROFILE_URL =
  'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile';
const SIFA_URL = 'https://sifa.id/xrpc/id.sifa.getProfileView';
export const VIEWER_PDS = 'https://pds.bea.test';
const CID = `bafyrei${'a'.repeat(52)}`;

type ServeOptions = {
  /** Fields merged into the Bluesky profile. */
  profile?: Record<string, unknown>;
  /** An XRPC error to return instead of the profile. */
  profileError?: { error: string; status: number };
  /** The Sifa view, 'none' for ProfileNotFound. */
  sifa?: Record<string, unknown> | 'none';
  /** app.lanyards.actor.lanyard fields, or null for no record. */
  config?: Record<string, unknown> | null;
  honorific?: 'Dr' | 'Prof' | null;
};

/** Answers every public read for ADA's lanyard. */
export function servePerson(options: ServeOptions = {}) {
  const profileAnswer = options.profileError
    ? HttpResponse.json(
        { error: options.profileError.error },
        { status: options.profileError.status }
      )
    : HttpResponse.json({ ...profile, ...options.profile });

  server.use(
    http.get(PROFILE_URL, ({ request }) => {
      const actor = new URL(request.url).searchParams.get('actor');
      if (actor !== ADA.did && actor !== ADA.handle) {
        return HttpResponse.json(
          { error: 'InvalidRequest', message: 'Profile not found' },
          { status: 400 }
        );
      }
      return profileAnswer.clone();
    }),
    http.get(SIFA_URL, () =>
      options.sifa === 'none'
        ? HttpResponse.json({ error: 'ProfileNotFound' }, { status: 400 })
        : HttpResponse.json(options.sifa ?? sifaView)
    )
  );

  mockDidDocument(ADA.did, ADA.pds);
  mockGetRecord(
    ADA.pds,
    ADA.did,
    'app.lanyards.actor.lanyard',
    'self',
    options.config
      ? {
          uri: `at://${ADA.did}/app.lanyards.actor.lanyard/self`,
          cid: CID,
          value: {
            $type: 'app.lanyards.actor.lanyard',
            createdAt: '2026-11-01T09:00:00.000Z',
            ...options.config,
          },
        }
      : null
  );
  mockGetRecord(
    ADA.pds,
    ADA.did,
    'app.lanyards.actor.biography.honorific',
    'self',
    options.honorific === null
      ? null
      : {
          uri: `at://${ADA.did}/app.lanyards.actor.biography.honorific/self`,
          cid: CID,
          value: {
            $type: 'app.lanyards.actor.biography.honorific',
            value: options.honorific ?? 'Dr',
            createdAt: '2025-11-20T09:00:00.000Z',
          },
        }
  );
  for (const collection of [
    'app.lanyards.link.web',
    'app.lanyards.link.media.audio',
    'app.lanyards.link.media.video',
  ]) {
    mockListRecords(ADA.pds, ADA.did, collection, []);
  }
}

/** Answers BEA's authenticated AppView reads about ADA. */
export function serveViewerReads(
  overrides: { relationship?: Record<string, unknown> } = {}
) {
  server.use(
    http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getRelationships`, () =>
      HttpResponse.json(
        overrides.relationship
          ? {
              actor: BEA.did,
              relationships: [
                {
                  $type: 'app.bsky.graph.defs#relationship',
                  did: ADA.did,
                  ...overrides.relationship,
                },
              ],
            }
          : relationships
      )
    ),
    http.get(`${VIEWER_PDS}/xrpc/app.bsky.graph.getKnownFollowers`, () =>
      HttpResponse.json(knownFollowers)
    )
  );
}

/** A signed-in session value for useSession mocks. */
export function signedInSession(did: string, scope = GRANULAR_SCOPE) {
  const rpc = new Client({
    handler: simpleFetchHandler({ service: VIEWER_PDS }),
  });
  return {
    status: 'signedIn' as const,
    session: {
      did,
      scope,
      rpc,
      appview: new Client({
        handler: simpleFetchHandler({ service: VIEWER_PDS }),
        proxy: BSKY_APPVIEW_AUD,
      }),
      agent: { signOut: vi.fn() },
    } as never,
    signOut: vi.fn(),
    refresh: vi.fn(),
  };
}

export const signedOutSession = () => ({
  status: 'signedOut' as const,
  signOut: vi.fn(),
  refresh: vi.fn(),
});
