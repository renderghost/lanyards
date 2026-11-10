import { http, HttpResponse, type JsonBodyType } from 'msw';

import { server } from './msw';

/** Answers plc.directory for `did`, pointing its PDS at `pds`. */
export function mockDidDocument(did: string, pds: string) {
  server.use(
    http.get(`https://plc.directory/${did}`, () =>
      HttpResponse.json({
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/multikey/v1',
        ],
        id: did,
        alsoKnownAs: ['at://alice.test'],
        verificationMethod: [],
        service: [
          {
            id: '#atproto_pds',
            type: 'AtprotoPersonalDataServer',
            serviceEndpoint: pds,
          },
        ],
      })
    )
  );
}

type FixtureRecord = { uri: string; cid: string; value: unknown };

/**
 * Serves `records` from `listRecords` on `pds` for one repo and collection,
 * paging with numeric cursors. Requests for other repos or collections fall
 * through to the next handler.
 */
export function mockListRecords(
  pds: string,
  did: string,
  collection: string,
  records: FixtureRecord[]
) {
  server.use(
    http.get(`${pds}/xrpc/com.atproto.repo.listRecords`, ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('repo') !== did) return undefined;
      if (url.searchParams.get('collection') !== collection) return undefined;
      const limit = Number(url.searchParams.get('limit') ?? 50);
      const start = Number(url.searchParams.get('cursor') ?? 0);
      const page = records.slice(start, start + limit);
      const next = start + limit;
      return HttpResponse.json({
        records: page,
        ...(next < records.length ? { cursor: String(next) } : {}),
      });
    })
  );
}

/** Serves one record (or RecordNotFound when `record` is null). */
export function mockGetRecord(
  pds: string,
  did: string,
  collection: string,
  rkey: string,
  record: FixtureRecord | null
) {
  server.use(
    http.get(`${pds}/xrpc/com.atproto.repo.getRecord`, ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.get('repo') !== did) return undefined;
      if (url.searchParams.get('collection') !== collection) return undefined;
      if (url.searchParams.get('rkey') !== rkey) return undefined;
      return record
        ? HttpResponse.json(record)
        : HttpResponse.json(
            { error: 'RecordNotFound', message: 'Could not locate record' },
            { status: 400 }
          );
    })
  );
}

/** Answers GET `url` (query string ignored) with `body`. */
export function mockJson(url: string, body: JsonBodyType, init?: ResponseInit) {
  server.use(http.get(url, () => HttpResponse.json(body, init)));
}
