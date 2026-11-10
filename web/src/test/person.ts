import { Client, simpleFetchHandler } from '@atcute/client';
import { delay, http, HttpResponse } from 'msw';
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

type WriteMethod = 'createRecord' | 'putRecord' | 'deleteRecord';

/**
 * Records the signed-in viewer's writes to their PDS. `fail` answers the
 * named methods with a server error; `delayMs` holds every answer back.
 */
export function captureWrites(
  options: { fail?: WriteMethod[]; delayMs?: number } = {}
) {
  const writes = {
    created: [] as Record<string, unknown>[],
    put: [] as Record<string, unknown>[],
    deleted: [] as Record<string, unknown>[],
  };
  const lists: Record<WriteMethod, Record<string, unknown>[]> = {
    createRecord: writes.created,
    putRecord: writes.put,
    deleteRecord: writes.deleted,
  };
  for (const method of Object.keys(lists) as WriteMethod[]) {
    server.use(
      http.post(
        `${VIEWER_PDS}/xrpc/com.atproto.repo.${method}`,
        async ({ request }) => {
          if (options.delayMs) await delay(options.delayMs);
          if (options.fail?.includes(method)) {
            return HttpResponse.json(
              { error: 'InternalServerError' },
              { status: 500 }
            );
          }
          const body = (await request.json()) as Record<string, unknown>;
          lists[method].push(body);
          if (method === 'deleteRecord') return HttpResponse.json({});
          const rkey =
            typeof body.rkey === 'string' ? body.rkey : '3mnewrecord';
          return HttpResponse.json({
            uri: `at://${String(body.repo)}/${String(body.collection)}/${rkey}`,
            cid: CID,
          });
        }
      )
    );
  }
  return writes;
}
