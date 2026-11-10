import { delay, http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ALICE, ALISON, TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';

import { searchHandles } from './typeahead';

describe('searchHandles', () => {
  it('maps typeahead actors to suggestions', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(TYPEAHEAD_URL, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ actors: [ALICE, ALISON] });
      })
    );

    await expect(searchHandles('ali')).resolves.toEqual([
      {
        did: ALICE.did,
        handle: ALICE.handle,
        displayName: ALICE.displayName,
        avatar: ALICE.avatar,
      },
      { did: ALISON.did, handle: ALISON.handle },
    ]);
    expect(params?.get('q')).toBe('ali');
    expect(params?.get('limit')).toBe('8');
  });

  it('strips a leading @ and whitespace before searching', async () => {
    let query: string | null = null;
    server.use(
      http.get(TYPEAHEAD_URL, ({ request }) => {
        query = new URL(request.url).searchParams.get('q');
        return HttpResponse.json({ actors: [] });
      })
    );
    await searchHandles('  @ali ');
    expect(query).toBe('ali');
  });

  it('makes no request for queries shorter than two characters', async () => {
    // Any request would be unhandled and fail the test.
    await expect(searchHandles('@a')).resolves.toEqual([]);
    await expect(searchHandles(' ')).resolves.toEqual([]);
  });

  it('rejects with an AbortError when aborted', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, async () => {
        await delay('infinite');
        return HttpResponse.json({ actors: [] });
      })
    );
    const controller = new AbortController();
    const pending = searchHandles('ali', controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects when the AppView fails', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, () =>
        HttpResponse.json({ error: 'InternalServerError' }, { status: 500 })
      )
    );
    await expect(searchHandles('ali')).rejects.toBeTruthy();
  });
});
