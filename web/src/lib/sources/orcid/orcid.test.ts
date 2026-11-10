import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '@/test/msw';
import { ADA } from '@/test/people';

import researcherUrls from './fixtures/researcher-urls.json';
import verifiedUrls from './fixtures/researcher-urls-verified.json';
import works from './fixtures/works.json';
import {
  fetchOrcidVerified,
  fetchOrcidWorks,
  findOrcidId,
  isValidOrcid,
} from './orcid';

const ID = '0000-0002-1825-0097';
const API = `https://pub.orcid.org/v3.0/${ID}`;

const account = (url: string, platform: string) => ({
  key: `at://${ADA.did}/id.sifa.profile.externalAccount/x`,
  url,
  platform,
});

describe('isValidOrcid', () => {
  it.each(['0000-0002-1825-0097', '0000-0002-9079-593X'])(
    'accepts %s',
    (id) => {
      expect(isValidOrcid(id)).toBe(true);
    }
  );

  it.each(['0000-0002-1825-0098', '0000-0002-1825-009', 'abcd-0002-1825-0097'])(
    'rejects %s',
    (id) => {
      expect(isValidOrcid(id)).toBe(false);
    }
  );
});

describe('findOrcidId', () => {
  it('finds the iD on an ORCID account', () => {
    expect(findOrcidId([account(`https://orcid.org/${ID}`, 'orcid')])).toBe(ID);
  });

  it('finds the iD in any orcid.org URL', () => {
    expect(
      findOrcidId([
        account('https://github.com/ada', 'github'),
        account(`http://www.orcid.org/${ID}/`, 'website'),
      ])
    ).toBe(ID);
  });

  it('ignores an iD with a wrong check digit', () => {
    expect(
      findOrcidId([account('https://orcid.org/0000-0002-1825-0098', 'orcid')])
    ).toBeUndefined();
  });
});

describe('fetchOrcidWorks', () => {
  it('maps the preferred summary of each work, newest first', async () => {
    let accept: string | null = null;
    server.use(
      http.get(`${API}/works`, ({ request }) => {
        accept = request.headers.get('accept');
        return HttpResponse.json(works);
      })
    );
    const result = await fetchOrcidWorks(ID);
    expect(accept).toBe('application/json');
    expect(result.ok && result.value.slice(0, 3)).toEqual([
      {
        key: `orcid:${ID}/9543020`,
        title: 'A Methodology for the Emulation of Architecture',
        doi: '10.5555/12345680',
        year: '2012',
      },
      {
        key: `orcid:${ID}/4562455`,
        title: 'The Memory Bus Considered Harmful',
        doi: '10.5555/666655554444',
        year: '2012',
      },
      {
        key: `orcid:${ID}/4562454`,
        title: 'The Impact of Interactive Epistemologies on Cryptography',
        doi: '10.5555/987654321',
        year: '2011',
      },
    ]);
    expect(result.ok && result.value).toHaveLength(5);
  });

  it('reports an unknown iD as not found', async () => {
    server.use(
      http.get(`${API}/works`, () =>
        HttpResponse.json(
          { 'response-code': 404, 'error-code': 9016 },
          { status: 404 }
        )
      )
    );
    const result = await fetchOrcidWorks(ID);
    expect(!result.ok && result.error.kind).toBe('notFound');
  });

  it('reports ORCID’s burst limit as rate limiting', async () => {
    server.use(
      http.get(`${API}/works`, () => HttpResponse.json({}, { status: 503 }))
    );
    const result = await fetchOrcidWorks(ID);
    expect(!result.ok && result.error.kind).toBe('rateLimited');
  });
});

describe('fetchOrcidVerified', () => {
  it('is true when the record links back to the lanyard', async () => {
    server.use(
      http.get(`${API}/researcher-urls`, () => HttpResponse.json(verifiedUrls))
    );
    await expect(fetchOrcidVerified(ID, ADA.did)).resolves.toEqual({
      ok: true,
      value: true,
    });
  });

  it('is true when the record links to the Bluesky profile', async () => {
    const withBluesky = structuredClone(researcherUrls);
    withBluesky['researcher-url'][0]!.url.value =
      `https://bsky.app/profile/${ADA.did}`;
    server.use(
      http.get(`${API}/researcher-urls`, () => HttpResponse.json(withBluesky))
    );
    await expect(fetchOrcidVerified(ID, ADA.did)).resolves.toEqual({
      ok: true,
      value: true,
    });
  });

  it('is false when no researcher URL points back', async () => {
    server.use(
      http.get(`${API}/researcher-urls`, () =>
        HttpResponse.json(researcherUrls)
      )
    );
    await expect(fetchOrcidVerified(ID, ADA.did)).resolves.toEqual({
      ok: true,
      value: false,
    });
  });

  it('does not accept a link to someone else’s lanyard', async () => {
    server.use(
      http.get(`${API}/researcher-urls`, () => HttpResponse.json(verifiedUrls))
    );
    await expect(
      fetchOrcidVerified(ID, 'did:plc:fixturebeaaaaaaaaaaaaaaa')
    ).resolves.toEqual({ ok: true, value: false });
  });
});
