import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/test/msw';
import { ADA, BEA } from '@/test/people';
import { signedInSession, VIEWER_PDS } from '@/test/person';

import {
  applyWrites,
  createRecord,
  deleteRecord,
  InvalidRecordError,
  MissingPermissionError,
  putRecord,
  RecordChangedError,
  WRITABLE_COLLECTIONS,
  type WriteOp,
  WriteFailedError,
} from './writes';

const NOW = '2026-11-10T09:00:00.000Z';
const CID = `bafyrei${'a'.repeat(52)}`;
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

  it('replaces only the version it read, when given its CID', async () => {
    const bodies = capture('putRecord');
    await putRecord(
      session(),
      'app.lanyards.actor.lanyard',
      'self',
      { createdAt: NOW },
      { swapRecord: CID }
    );
    expect(bodies[0]).toMatchObject({ rkey: 'self', swapRecord: CID });
  });

  it('creates only if no record exists, given a null swap', async () => {
    const bodies = capture('putRecord');
    await putRecord(
      session(),
      'app.lanyards.actor.lanyard',
      'self',
      { createdAt: NOW },
      { swapRecord: null }
    );
    expect(bodies[0]).toMatchObject({ swapRecord: null });
  });

  it('says so when the record changed since it was read', async () => {
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.putRecord`, () =>
        HttpResponse.json(
          { error: 'InvalidSwap', message: 'Record was at a different CID' },
          { status: 400 }
        )
      )
    );
    await expect(
      putRecord(
        session(),
        'app.lanyards.actor.lanyard',
        'self',
        { createdAt: NOW },
        { swapRecord: CID }
      )
    ).rejects.toBeInstanceOf(RecordChangedError);
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

describe('writable collections', () => {
  it('are the five Lanyards writes', () => {
    expect([...WRITABLE_COLLECTIONS].sort()).toEqual([
      'app.bsky.graph.follow',
      'app.lanyards.actor.lanyard',
      'app.lanyards.link.media.audio',
      'app.lanyards.link.media.video',
      'app.lanyards.media.item',
    ]);
  });

  it('refuses any other collection, even with broad permission', async () => {
    const bodies = capture('createRecord');
    await expect(
      createRecord(
        session('atproto transition:generic'),
        // @ts-expect-error: Sifa's records are Sifa's to write.
        'id.sifa.profile.skill',
        { name: 'Protocols', createdAt: NOW }
      )
    ).rejects.toBeInstanceOf(MissingPermissionError);
    await expect(
      deleteRecord(
        session('atproto transition:generic'),
        // @ts-expect-error: Sifa's records are Sifa's to delete.
        'id.sifa.profile.skill',
        '3m'
      )
    ).rejects.toBeInstanceOf(MissingPermissionError);
    expect(bodies).toEqual([]);
  });
});

describe('applyWrites', () => {
  const MEDIA = 'app.lanyards.media.item' as const;
  const item = (url: string) => ({
    url,
    kind: 'audio',
    title: 'Episode',
    createdAt: NOW,
  });

  it('sends creates, updates and deletes in one batch', async () => {
    const bodies = capture('applyWrites');
    await applyWrites(session(), [
      {
        type: 'create',
        collection: MEDIA,
        fields: item('https://ada.example/'),
      },
      {
        type: 'update',
        collection: MEDIA,
        rkey: '3mold',
        fields: item('https://ada.example/cv'),
      },
      { type: 'delete', collection: MEDIA, rkey: '3mgone' },
    ]);
    expect(bodies).toEqual([
      {
        repo: BEA.did,
        writes: [
          {
            $type: 'com.atproto.repo.applyWrites#create',
            collection: MEDIA,
            rkey: expect.stringMatching(/^[a-z2-7]{13}$/),
            value: { $type: MEDIA, ...item('https://ada.example/') },
          },
          {
            $type: 'com.atproto.repo.applyWrites#update',
            collection: MEDIA,
            rkey: '3mold',
            value: { $type: MEDIA, ...item('https://ada.example/cv') },
          },
          {
            $type: 'com.atproto.repo.applyWrites#delete',
            collection: MEDIA,
            rkey: '3mgone',
          },
        ],
      },
    ]);
  });

  it('keeps a create’s own rkey when given one', async () => {
    const bodies = capture('applyWrites');
    await applyWrites(session(), [
      {
        type: 'create',
        collection: 'app.lanyards.actor.lanyard',
        rkey: 'self',
        fields: { createdAt: NOW },
      },
    ]);
    expect(bodies[0]).toMatchObject({ writes: [{ rkey: 'self' }] });
  });

  it('refuses the whole batch if one op lacks permission, sending nothing', async () => {
    const bodies = capture('applyWrites');
    await expect(
      applyWrites(session('atproto'), [
        { type: 'delete', collection: MEDIA, rkey: '3mgone' },
      ])
    ).rejects.toBeInstanceOf(MissingPermissionError);
    expect(bodies).toEqual([]);
  });

  it('refuses the whole batch if one record breaks its lexicon, sending nothing', async () => {
    const bodies = capture('applyWrites');
    await expect(
      applyWrites(session(), [
        { type: 'delete', collection: MEDIA, rkey: '3mgone' },
        { type: 'create', collection: MEDIA, fields: { title: 'No URL' } },
      ])
    ).rejects.toBeInstanceOf(InvalidRecordError);
    expect(bodies).toEqual([]);
  });

  it('splits more than 10 ops into atomic chunks', async () => {
    const bodies = capture('applyWrites');
    const ops: WriteOp[] = Array.from({ length: 12 }, (_, index) => ({
      type: 'delete',
      collection: MEDIA,
      rkey: `3mgone${index}`,
    }));
    await applyWrites(session(), ops);
    expect(
      bodies.map((body) => (body as { writes: unknown[] }).writes.length)
    ).toEqual([10, 2]);
  });

  it('a failure part-way says how many writes landed', async () => {
    let calls = 0;
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.applyWrites`, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ results: [] })
          : HttpResponse.json(
              { error: 'InternalServerError' },
              { status: 500 }
            );
      })
    );
    const ops: WriteOp[] = Array.from({ length: 12 }, (_, index) => ({
      type: 'delete',
      collection: MEDIA,
      rkey: `3mgone${index}`,
    }));
    const failure = await applyWrites(session(), ops).catch(
      (error: unknown) => error
    );
    expect(failure).toBeInstanceOf(WriteFailedError);
    expect((failure as WriteFailedError).applied).toBe(10);
  });

  it('nothing landed when the first chunk fails', async () => {
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.applyWrites`, () =>
        HttpResponse.json({ error: 'InvalidRequest' }, { status: 400 })
      )
    );
    const failure = await applyWrites(session(), [
      { type: 'delete', collection: MEDIA, rkey: '3mgone' },
    ]).catch((error: unknown) => error);
    expect((failure as WriteFailedError).applied).toBe(0);
  });

  it('throws WriteFailedError when the PDS refuses', async () => {
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.applyWrites`, () =>
        HttpResponse.json({ error: 'InvalidRequest' }, { status: 400 })
      )
    );
    await expect(
      applyWrites(session(), [
        { type: 'delete', collection: MEDIA, rkey: '3mgone' },
      ])
    ).rejects.toBeInstanceOf(WriteFailedError);
  });
});
