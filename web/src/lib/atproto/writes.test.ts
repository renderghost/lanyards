import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/test/msw';
import { ADA, BEA } from '@/test/people';
import { signedInSession, VIEWER_PDS } from '@/test/person';

import {
  createRecord,
  deleteRecord,
  InvalidRecordError,
  MissingPermissionError,
  putRecord,
} from './writes';

const NOW = '2026-11-10T09:00:00.000Z';
const session = (scope?: string) =>
  signedInSession(BEA.did, scope).session as unknown as Parameters<
    typeof createRecord
  >[0];

function capture(method: string) {
  const bodies: unknown[] = [];
  server.use(
    http.post(
      `${VIEWER_PDS}/xrpc/com.atproto.repo.${method}`,
      async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json({
          uri: `at://${BEA.did}/app.bsky.graph.follow/3mnewfollow`,
          cid: `bafyrei${'a'.repeat(52)}`,
        });
      }
    )
  );
  return bodies;
}

describe('createRecord', () => {
  it('refuses to write without permission and sends nothing', async () => {
    const bodies = capture('createRecord');
    await expect(
      createRecord(session('atproto'), 'app.bsky.graph.follow', {
        subject: ADA.did,
        createdAt: NOW,
      })
    ).rejects.toBeInstanceOf(MissingPermissionError);
    expect(bodies).toEqual([]);
  });

  it('refuses a record that breaks its lexicon', async () => {
    const bodies = capture('createRecord');
    await expect(
      createRecord(session(), 'app.bsky.graph.follow', {
        subject: 'not a did',
        createdAt: NOW,
      })
    ).rejects.toBeInstanceOf(InvalidRecordError);
    expect(bodies).toEqual([]);
  });

  it('writes the record with its $type and a TID record key', async () => {
    const bodies = capture('createRecord');
    const result = await createRecord(session(), 'app.bsky.graph.follow', {
      subject: ADA.did,
      createdAt: NOW,
    });
    expect(result.uri).toBe(
      `at://${BEA.did}/app.bsky.graph.follow/3mnewfollow`
    );
    expect(bodies).toEqual([
      {
        repo: BEA.did,
        collection: 'app.bsky.graph.follow',
        rkey: expect.stringMatching(/^[2-7a-z]{13}$/),
        record: {
          $type: 'app.bsky.graph.follow',
          subject: ADA.did,
          createdAt: NOW,
        },
      },
    ]);
  });
});

describe('putRecord', () => {
  it('replaces a record at its key', async () => {
    const bodies = capture('putRecord');
    await putRecord(session(), 'app.lanyards.actor.lanyard', 'self', {
      createdAt: NOW,
    });
    expect(bodies).toEqual([
      {
        repo: BEA.did,
        collection: 'app.lanyards.actor.lanyard',
        rkey: 'self',
        record: { $type: 'app.lanyards.actor.lanyard', createdAt: NOW },
      },
    ]);
  });
});

describe('deleteRecord', () => {
  it('deletes the record at its key', async () => {
    const bodies = capture('deleteRecord');
    await deleteRecord(session(), 'app.bsky.graph.follow', '3mold');
    expect(bodies).toEqual([
      { repo: BEA.did, collection: 'app.bsky.graph.follow', rkey: '3mold' },
    ]);
  });

  it('refuses to delete without permission', async () => {
    await expect(
      deleteRecord(session('atproto'), 'app.bsky.graph.follow', '3mold')
    ).rejects.toBeInstanceOf(MissingPermissionError);
  });
});
