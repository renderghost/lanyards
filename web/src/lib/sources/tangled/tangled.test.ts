import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { server } from '@/test/msw';
import { ADA } from '@/test/people';

import declarations from './fixtures/declarations.json';
import listRepos from './fixtures/listRepos.json';
import { fetchRepos } from './tangled';

const LIST_REPOS = 'https://api.tangled.org/xrpc/org.tangled.repo.listRepos';

describe('fetchRepos', () => {
  it('lists repositories from the Tangled AppView, newest first', async () => {
    let subject: string | null = null;
    server.use(
      http.get(LIST_REPOS, ({ request }) => {
        subject = new URL(request.url).searchParams.get('subject');
        return HttpResponse.json(listRepos);
      })
    );
    const result = await fetchRepos(ADA.did, 'alice.test', 10);
    expect(subject).toBe(ADA.did);
    expect(result).toEqual({
      ok: true,
      value: [
        {
          key: 'at://did:plc:fixturerepotwoaaaaaaaaaa/org.tangled.repo.manifest/self',
          name: 'notes',
          url: 'https://tangled.org/alice.test/notes',
          createdAt: '2026-06-01T09:00:00.000000Z',
        },
        {
          key: 'at://did:plc:fixturerepooneaaaaaaaaaa/org.tangled.repo.manifest/self',
          name: 'lanyard-tools',
          description: 'Tools for conference lanyards',
          url: 'https://tangled.org/alice.test/lanyard-tools',
          createdAt: '2026-03-01T09:00:00.000000Z',
        },
      ],
    });
  });

  it('returns at most the limit', async () => {
    server.use(http.get(LIST_REPOS, () => HttpResponse.json(listRepos)));
    const result = await fetchRepos(ADA.did, 'alice.test', 1);
    expect(result.ok && result.value.map((repo) => repo.name)).toEqual([
      'notes',
    ]);
  });

  it('falls back to repository declarations on the PDS', async () => {
    server.use(
      http.get(LIST_REPOS, () => HttpResponse.json({}, { status: 502 }))
    );
    mockDidDocument(ADA.did, ADA.pds);
    mockListRecords(
      ADA.pds,
      ADA.did,
      'org.tangled.repo.declaration',
      declarations.records
    );
    const result = await fetchRepos(ADA.did, 'alice.test', 10);
    expect(result.ok && result.value).toEqual([
      {
        key: `at://${ADA.did}/org.tangled.repo.declaration/notes`,
        name: 'notes',
        url: 'https://tangled.org/alice.test/notes',
        createdAt: '2026-06-01T09:00:00.000000Z',
      },
      {
        key: `at://${ADA.did}/org.tangled.repo.declaration/lanyard-tools`,
        name: 'lanyard-tools',
        url: 'https://tangled.org/alice.test/lanyard-tools',
        createdAt: '2026-03-01T09:00:00.000000Z',
      },
    ]);
  });

  it('fails when the AppView and the PDS both fail', async () => {
    server.use(http.get(LIST_REPOS, () => HttpResponse.error()));
    mockDidDocument(ADA.did, ADA.pds);
    server.use(
      http.get(`${ADA.pds}/xrpc/com.atproto.repo.listRecords`, () =>
        HttpResponse.json({}, { status: 500 })
      )
    );
    const result = await fetchRepos(ADA.did, 'alice.test', 10);
    expect(!result.ok && result.error.source).toBe('tangled');
  });
});
