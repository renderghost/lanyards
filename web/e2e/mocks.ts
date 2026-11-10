import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Page, Route } from '@playwright/test';

const fixture = (path: string) =>
  JSON.parse(
    readFileSync(
      resolve(import.meta.dirname, '../src/lib/sources', path),
      'utf8'
    )
  ) as Record<string, unknown>;

export const ADA = {
  did: 'did:plc:fixturealiceaaaaaaaaaaaa',
  handle: 'alice.test',
};
export const BEA = { did: 'did:plc:fixturebeaaaaaaaaaaaaaaa' };

const ADA_PDS = 'https://pds.ada.test';
const CID = `bafyrei${'a'.repeat(52)}`;
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, json: body });

type PersonOptions = {
  labels?: string[];
  /** Fields merged into the Sifa view. */
  sifa?: Record<string, unknown>;
  /** app.lanyards.actor.lanyard fields; no record when absent. */
  config?: Record<string, unknown>;
  /** Make the Sifa view and its PDS fallback fail. */
  sifaDown?: boolean;
};

/** Answers every public read for ADA's lanyard. */
export async function mockPerson(page: Page, options: PersonOptions = {}) {
  const profile = fixture('bluesky/fixtures/getProfile.json');
  const view = fixture('sifa/fixtures/getProfileView.json');

  await page.route('https://cdn.bsky.app/**', (route) =>
    route.fulfill({ contentType: 'image/png', body: PNG })
  );
  await page.route(
    'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile**',
    (route) => {
      const actor = new URL(route.request().url()).searchParams.get('actor');
      if (actor !== ADA.did && actor !== ADA.handle) {
        return json(
          route,
          { error: 'InvalidRequest', message: 'Profile not found' },
          400
        );
      }
      return json(route, {
        ...profile,
        labels: (options.labels ?? []).map((val) => ({
          src: ADA.did,
          uri: `at://${ADA.did}/app.bsky.actor.profile/self`,
          val,
          cts: '2026-01-01T00:00:00.000Z',
        })),
      });
    }
  );
  await page.route('https://sifa.id/xrpc/id.sifa.getProfileView**', (route) =>
    options.sifaDown
      ? json(route, {}, 500)
      : json(route, { ...view, ...options.sifa })
  );
  await page.route(`https://plc.directory/**`, (route) =>
    json(route, {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: ADA.did,
      alsoKnownAs: [`at://${ADA.handle}`],
      verificationMethod: [],
      service: [
        {
          id: '#atproto_pds',
          type: 'AtprotoPersonalDataServer',
          serviceEndpoint: ADA_PDS,
        },
      ],
    })
  );
  await page.route(`${ADA_PDS}/xrpc/com.atproto.repo.getRecord**`, (route) => {
    const collection = new URL(route.request().url()).searchParams.get(
      'collection'
    );
    if (collection === 'app.lanyards.actor.lanyard' && options.config) {
      return json(route, {
        uri: `at://${ADA.did}/${collection}/self`,
        cid: CID,
        value: {
          $type: collection,
          createdAt: '2026-11-01T09:00:00.000Z',
          ...options.config,
        },
      });
    }
    if (collection === 'app.lanyards.actor.biography.honorific') {
      return json(route, {
        uri: `at://${ADA.did}/${collection}/self`,
        cid: CID,
        value: {
          $type: collection,
          value: 'Dr',
          createdAt: '2025-11-20T09:00:00.000Z',
        },
      });
    }
    return json(route, { error: 'RecordNotFound' }, 400);
  });
  await page.route(
    `${ADA_PDS}/xrpc/com.atproto.repo.listRecords**`,
    (route) => {
      const collection =
        new URL(route.request().url()).searchParams.get('collection') ?? '';
      if (options.sifaDown && collection.startsWith('id.sifa')) {
        return json(route, {}, 500);
      }
      return json(route, { records: [] });
    }
  );
}

export type Writes = { created: unknown[]; deleted: unknown[] };

/** Answers the signed-in viewer's AppView reads and records their writes. */
export async function mockViewer(
  page: Page,
  options: {
    following?: boolean;
    /** People the viewer follows who follow the person. */
    knownFollowers?: { did: string; handle: string; displayName?: string }[];
  } = {}
): Promise<Writes> {
  const writes: Writes = { created: [], deleted: [] };
  await page.route(
    'https://appview.e2e.test/xrpc/app.bsky.graph.getRelationships**',
    (route) =>
      json(route, {
        actor: BEA.did,
        relationships: [
          {
            $type: 'app.bsky.graph.defs#relationship',
            did: ADA.did,
            ...(options.following
              ? { following: `at://${BEA.did}/app.bsky.graph.follow/3mold` }
              : {}),
          },
        ],
      })
  );
  await page.route(
    'https://appview.e2e.test/xrpc/app.bsky.graph.getKnownFollowers**',
    (route) =>
      json(route, { subject: {}, followers: options.knownFollowers ?? [] })
  );
  await page.route(
    'https://pds.e2e.test/xrpc/com.atproto.repo.createRecord',
    (route) => {
      writes.created.push(route.request().postDataJSON());
      return json(route, {
        uri: `at://${BEA.did}/app.bsky.graph.follow/3mnew`,
        cid: CID,
      });
    }
  );
  await page.route(
    'https://pds.e2e.test/xrpc/com.atproto.repo.deleteRecord',
    (route) => {
      writes.deleted.push(route.request().postDataJSON());
      return json(route, {});
    }
  );
  return writes;
}

/** Signs in through the e2e-only seeded session (VITE_E2E builds). */
export async function signIn(
  page: Page,
  session: { did: string; scope: string }
) {
  await page.addInitScript((value) => {
    localStorage.setItem('lanyards:e2e-session', value);
  }, JSON.stringify(session));
}
