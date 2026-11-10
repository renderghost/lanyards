import type { Did } from '@atcute/lexicons';
import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import {
  mockDidDocument,
  mockGetRecord,
  mockListRecords,
} from '@/test/handlers';
import { server } from '@/test/msw';

import { getRecord, listRecords, resolvePds } from './pds';

const PDS = 'https://pds.fixture.test';
const COLLECTION = 'site.standard.document';

const records = (count: number, did: string) =>
  Array.from({ length: count }, (_, index) => ({
    uri: `at://${did}/${COLLECTION}/${index}`,
    cid: `bafy${index}`,
    value: { index },
  }));

// Each test uses its own DID: resolvePds memoises per DID.
const didFor = (name: string) =>
  `did:plc:${name.padEnd(24, '0').slice(0, 24)}` as Did;

describe('resolvePds', () => {
  it('reads the PDS from the DID document and remembers it', async () => {
    const did = didFor('resolveonce');
    let requests = 0;
    server.events.on('request:start', ({ request }) => {
      if (decodeURIComponent(request.url).includes(did)) requests += 1;
    });
    mockDidDocument(did, PDS);
    await expect(resolvePds(did, { source: 'semble' })).resolves.toEqual({
      ok: true,
      value: PDS,
    });
    await expect(resolvePds(did, { source: 'semble' })).resolves.toEqual({
      ok: true,
      value: PDS,
    });
    expect(requests).toBe(1);
    server.events.removeAllListeners();
  });

  it('shares one lookup between parallel callers', async () => {
    const did = didFor('parallelcalls');
    let requests = 0;
    server.events.on('request:start', ({ request }) => {
      if (decodeURIComponent(request.url).includes(did)) requests += 1;
    });
    mockDidDocument(did, PDS);
    const results = await Promise.all(
      (['semble', 'tangled', 'standardSite', 'lanyards', 'sifa'] as const).map(
        (source) => resolvePds(did, { source })
      )
    );
    expect(results).toEqual(Array(5).fill({ ok: true, value: PDS }));
    expect(requests).toBe(1);
    server.events.removeAllListeners();
  });

  it('labels a shared failure with each caller’s own source', async () => {
    const did = didFor('sharedfailure');
    server.use(
      http.get(`https://plc.directory/${did}`, () =>
        HttpResponse.json({ message: 'DID not registered' }, { status: 404 })
      )
    );
    const [semble, tangled] = await Promise.all([
      resolvePds(did, { source: 'semble' }),
      resolvePds(did, { source: 'tangled' }),
    ]);
    expect(!semble.ok && semble.error.source).toBe('semble');
    expect(!tangled.ok && tangled.error.source).toBe('tangled');
  });

  it('does not remember a failed lookup', async () => {
    const did = didFor('retryafterfail');
    mockDidDocument(did, PDS);
    server.use(
      http.get(`https://plc.directory/${did}`, () => HttpResponse.error(), {
        once: true,
      })
    );
    const first = await resolvePds(did, { source: 'semble' });
    expect(!first.ok && first.error.kind).toBe('network');
    await expect(resolvePds(did, { source: 'semble' })).resolves.toEqual({
      ok: true,
      value: PDS,
    });
  });

  it('lets one caller give up without failing the others', async () => {
    const did = didFor('onecallerquits');
    server.use(
      http.get(`https://plc.directory/${did}`, async () => {
        await delay(50);
        return HttpResponse.json({
          id: did,
          service: [
            {
              id: '#atproto_pds',
              type: 'AtprotoPersonalDataServer',
              serviceEndpoint: PDS,
            },
          ],
        });
      })
    );
    const controller = new AbortController();
    const quitting = resolvePds(did, {
      source: 'semble',
      signal: controller.signal,
    });
    const staying = resolvePds(did, { source: 'tangled' });
    controller.abort();
    const quit = await quitting;
    expect(!quit.ok && quit.error.kind).toBe('timeout');
    await expect(staying).resolves.toEqual({ ok: true, value: PDS });
  });

  it('reports an unknown DID as not found for the calling source', async () => {
    const did = didFor('unknowndid');
    server.use(
      http.get(`https://plc.directory/${did}`, () =>
        HttpResponse.json({ message: 'DID not registered' }, { status: 404 })
      )
    );
    const result = await resolvePds(did, { source: 'tangled' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.source).toBe('tangled');
      expect(result.error.kind).toBe('notFound');
    }
  });
});

describe('listRecords', () => {
  it('pages until the limit is reached', async () => {
    const did = didFor('pagestwo');
    mockDidDocument(did, PDS);
    mockListRecords(PDS, did, COLLECTION, records(200, did));
    let pages = 0;
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('listRecords')) pages += 1;
    });
    const result = await listRecords('standardSite', did, COLLECTION, {
      limit: 150,
    });
    server.events.removeAllListeners();
    expect(result.ok && result.value).toHaveLength(150);
    expect(pages).toBe(2);
  });

  it('stops when the PDS returns a null cursor', async () => {
    const did = didFor('nullcursor');
    mockDidDocument(did, PDS);
    server.use(
      http.get(`${PDS}/xrpc/com.atproto.repo.listRecords`, () =>
        HttpResponse.json({ records: records(3, did), cursor: null })
      )
    );
    const result = await listRecords('tangled', did, COLLECTION, {
      limit: 50,
    });
    expect(result.ok && result.value).toHaveLength(3);
  });

  it('returns uri, cid and value for each record', async () => {
    const did = didFor('shape');
    mockDidDocument(did, PDS);
    mockListRecords(PDS, did, COLLECTION, records(1, did));
    const result = await listRecords('standardSite', did, COLLECTION, {
      limit: 5,
    });
    expect(result).toEqual({
      ok: true,
      value: [
        {
          uri: `at://${did}/${COLLECTION}/0`,
          cid: 'bafy0',
          value: { index: 0 },
        },
      ],
    });
  });
});

describe('getRecord', () => {
  it('returns null when the record does not exist', async () => {
    const did = didFor('norecord');
    mockDidDocument(did, PDS);
    mockGetRecord(PDS, did, 'app.lanyards.actor.lanyard', 'self', null);
    await expect(
      getRecord('lanyards', did, 'app.lanyards.actor.lanyard', 'self')
    ).resolves.toEqual({ ok: true, value: null });
  });

  it('returns the record when it exists', async () => {
    const did = didFor('hasrecord');
    const record = {
      uri: `at://${did}/app.lanyards.actor.lanyard/self`,
      cid: 'bafyself',
      value: { createdAt: '2026-11-10T09:00:00.000Z' },
    };
    mockDidDocument(did, PDS);
    mockGetRecord(PDS, did, 'app.lanyards.actor.lanyard', 'self', record);
    await expect(
      getRecord('lanyards', did, 'app.lanyards.actor.lanyard', 'self')
    ).resolves.toEqual({ ok: true, value: record });
  });
});
