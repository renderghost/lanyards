import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { server } from '@/test/msw';

import { discussionUrl, fetchFeedbackBoard } from './board';
import { BOARD_OWNER_DID } from './feedback.constants';

vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const PDS = 'https://pds.lanyards.test';
const CID = `bafyrei${'c'.repeat(52)}`;
const space = (rkey: string, value: Record<string, unknown>) => ({
  uri: `at://${BOARD_OWNER_DID}/app.userinput.space/${rkey}`,
  cid: CID,
  value: {
    $type: 'app.userinput.space',
    createdAt: '2026-11-20T09:00:00.000Z',
    ...value,
  },
});

describe('fetchFeedbackBoard (#134)', () => {
  it('reads the newest board, with its tags and its page', async () => {
    mockDidDocument(BOARD_OWNER_DID, PDS);
    mockListRecords(PDS, BOARD_OWNER_DID, 'app.userinput.space', [
      space('3mnew', {
        name: 'Lanyards feedback',
        tags: [
          { value: 'bug', label: 'Bug' },
          { value: 'idea', label: 'Idea' },
        ],
      }),
      space('3mold', { name: 'An older board' }),
    ]);
    const board = await fetchFeedbackBoard();
    expect(board).toEqual({
      ok: true,
      value: {
        uri: `at://${BOARD_OWNER_DID}/app.userinput.space/3mnew`,
        cid: CID,
        name: 'Lanyards feedback',
        tags: [
          { value: 'bug', label: 'Bug' },
          { value: 'idea', label: 'Idea' },
        ],
        url: `https://userinput.app/s/${BOARD_OWNER_DID}/3mnew`,
      },
    });
  });

  it('skips a record that isn’t a valid board', async () => {
    mockDidDocument(BOARD_OWNER_DID, PDS);
    mockListRecords(PDS, BOARD_OWNER_DID, 'app.userinput.space', [
      space('3mbad', { name: 42 }),
      space('3mgood', { name: 'Lanyards feedback' }),
    ]);
    const board = await fetchFeedbackBoard();
    expect(board.ok && board.value?.uri).toBe(
      `at://${BOARD_OWNER_DID}/app.userinput.space/3mgood`
    );
    expect(board.ok && board.value?.tags).toEqual([]);
  });

  it('is null when there is no board yet', async () => {
    mockDidDocument(BOARD_OWNER_DID, PDS);
    mockListRecords(PDS, BOARD_OWNER_DID, 'app.userinput.space', []);
    expect(await fetchFeedbackBoard()).toEqual({ ok: true, value: null });
  });

  it('fails as a source error when the server is down', async () => {
    mockDidDocument(BOARD_OWNER_DID, PDS);
    server.use(
      http.get(`${PDS}/xrpc/com.atproto.repo.listRecords`, () =>
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
