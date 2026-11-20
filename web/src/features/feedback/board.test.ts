import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { mockDidDocument, mockGetRecord } from '@/test/handlers';
import { server } from '@/test/msw';

import { discussionUrl, fetchFeedbackBoard } from './board';
import { BOARD_OWNER_DID, BOARD_RKEY } from './feedback.constants';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const PDS = 'https://pds.lanyards.test';
const CID = `bafyrei${'c'.repeat(52)}`;
const URI = `at://${BOARD_OWNER_DID}/app.userinput.space/3n2rdjjovcm2o`;

/** Our board's record, as @lanyards.app's server returns it. */
const ours = (value: Record<string, unknown> = {}) => ({
  uri: URI,
  cid: CID,
  value: {
    $type: 'app.userinput.space',
    name: 'Lanyards',
    icon: {
      $type: 'blob',
      ref: { $link: `bafkrei${'d'.repeat(52)}` },
      mimeType: 'image/jpeg',
      size: 380011,
    },
    tags: [
      { label: 'bug', value: 'bug' },
      { label: 'feature', value: 'feature' },
      { label: 'question', value: 'question' },
    ],
    createdAt: '2026-11-20T19:37:12.820Z',
    ...value,
  },
});

const serve = (record: ReturnType<typeof ours> | null) => {
  mockDidDocument(BOARD_OWNER_DID, PDS);
  mockGetRecord(
    PDS,
    BOARD_OWNER_DID,
    'app.userinput.space',
    BOARD_RKEY,
    record
  );
};

describe('fetchFeedbackBoard (#134, #144)', () => {
  it('reads our board, by its record key, with its tags and its page', async () => {
    expect(BOARD_RKEY).toBe('3n2rdjjovcm2o');
    serve(ours());
    expect(await fetchFeedbackBoard()).toEqual({
      ok: true,
      value: {
        uri: URI,
        cid: CID,
        name: 'Lanyards',
        tags: [
          { value: 'bug', label: 'bug' },
          { value: 'feature', label: 'feature' },
          { value: 'question', label: 'question' },
        ],
        url: `https://userinput.app/s/${BOARD_OWNER_DID}/3n2rdjjovcm2o`,
      },
    });
  });

  it('is null when the board isn’t there', async () => {
    serve(null);
    expect(await fetchFeedbackBoard()).toEqual({ ok: true, value: null });
  });

  it('is null when the record isn’t a valid board', async () => {
    serve(ours({ name: 42 }));
    expect(await fetchFeedbackBoard()).toEqual({ ok: true, value: null });
  });

  it('fails as a source error when the server is down', async () => {
    mockDidDocument(BOARD_OWNER_DID, PDS);
    server.use(
      http.get(`${PDS}/xrpc/com.atproto.repo.getRecord`, () =>
        HttpResponse.json({}, { status: 502 })
      )
    );
    const board = await fetchFeedbackBoard();
    expect(board.ok).toBe(false);
    expect(!board.ok && board.error.source).toBe('userinput');
  });
});

describe('discussionUrl', () => {
  it('is the post’s page on UserInput', () => {
    expect(discussionUrl('at://did:plc:x/app.userinput.discussion/3k')).toBe(
      'https://userinput.app/d/did:plc:x/3k'
    );
  });
});
