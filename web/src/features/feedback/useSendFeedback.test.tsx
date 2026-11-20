import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { FEEDBACK_SCOPE, GRANULAR_SCOPE } from '@/lib/atproto/oauthConfig';
import {
  MissingPermissionError,
  ScopeRefusedError,
  WriteFailedError,
} from '@/lib/atproto/writes';
import { mockDidDocument, mockListRecords } from '@/test/handlers';
import { server } from '@/test/msw';
import { BEA } from '@/test/people';
import { signedInSession, VIEWER_PDS } from '@/test/person';

import { BOARD_OWNER_DID } from './feedback.constants';
import type { Screenshot } from './images';
import { BoardUnavailableError, useSendFeedback } from './useSendFeedback';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

const BOARD_PDS = 'https://pds.lanyards.test';
const CURRENT_CID = `bafyrei${'e'.repeat(52)}`;
const BOARD = `at://${BOARD_OWNER_DID}/app.userinput.space/3mboard`;
// Valid CIDs: base32, so letters a–z and digits 2–7 only.
const BLOB_CID = (n: number) => `bafkrei${'abcd'[n]!.repeat(52)}`;

const screenshot = (alt: string): Screenshot => ({
  id: alt,
  blob: new Blob([new Uint8Array(100)], { type: 'image/webp' }),
  previewUrl: `blob:${alt}`,
  alt,
});

let uploads = 0;
let created: { record: Record<string, unknown> }[] = [];

beforeEach(() => {
  uploads = 0;
  created = [];
  vi.mocked(useSession).mockReturnValue(
    signedInSession(BEA.did, `${GRANULAR_SCOPE} ${FEEDBACK_SCOPE}`)
  );
  mockDidDocument(BOARD_OWNER_DID, BOARD_PDS);
  // The board was edited since the page read it: this is its current cid.
  mockListRecords(BOARD_PDS, BOARD_OWNER_DID, 'app.userinput.space', [
    {
      uri: BOARD,
      cid: CURRENT_CID,
      value: {
        $type: 'app.userinput.space',
        name: 'Lanyards feedback',
        tags: [{ value: 'bug', label: 'Bug' }],
        createdAt: '2026-11-20T09:00:00.000Z',
      },
    },
  ]);
  server.use(
    http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.uploadBlob`, async () => {
      uploads += 1;
      return HttpResponse.json({
        blob: {
          $type: 'blob',
          ref: { $link: BLOB_CID(uploads) },
          mimeType: 'image/webp',
          size: 100,
        },
      });
    }),
    http.post(
      `${VIEWER_PDS}/xrpc/com.atproto.repo.createRecord`,
      async ({ request }) => {
        created.push(
          (await request.json()) as { record: Record<string, unknown> }
        );
        return HttpResponse.json({
          uri: `at://${BEA.did}/app.userinput.discussion/3mpost`,
          cid: `bafyrei${'f'.repeat(52)}`,
        });
      }
    )
  );
});

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const draft = {
  type: 'bug',
  title: 'The badge overlaps on my phone',
  details: 'It happens at 320 px.',
  screenshots: [screenshot('The badge'), screenshot('The board')],
  techDetails: 'App: dev\nPage: /@alice.test',
};

describe('useSendFeedback (#134)', () => {
  it('uploads each screenshot, then posts to the board’s current version', async () => {
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    const sent = await act(() => result.current.mutateAsync(draft));
    expect(uploads).toBe(2);
    expect(created).toHaveLength(1);
    expect(created[0]!.record).toEqual({
      $type: 'app.userinput.discussion',
      space: { uri: BOARD, cid: CURRENT_CID },
      title: 'The badge overlaps on my phone',
      body: 'It happens at 320 px.\n\n---\n\n```\nApp: dev\nPage: /@alice.test\n```',
      tags: ['bug'],
      images: [
        {
          alt: 'The badge',
          image: {
            $type: 'blob',
            ref: { $link: BLOB_CID(1) },
            mimeType: 'image/webp',
            size: 100,
          },
        },
        {
          alt: 'The board',
          image: {
            $type: 'blob',
            ref: { $link: BLOB_CID(2) },
            mimeType: 'image/webp',
            size: 100,
          },
        },
      ],
      createdAt: expect.any(String),
    });
    expect(sent).toEqual({
      uri: `at://${BEA.did}/app.userinput.discussion/3mpost`,
      url: `https://userinput.app/d/${BEA.did}/3mpost`,
    });
  });

  it('sends only what was given', async () => {
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        type: '',
        title: 'Just a title',
        details: '',
        screenshots: [],
      })
    );
    const record = created[0]!.record;
    expect(record).not.toHaveProperty('body');
    expect(record).not.toHaveProperty('tags');
    expect(record).not.toHaveProperty('images');
  });

  it('posts nothing when a screenshot fails to upload', async () => {
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.uploadBlob`, () =>
        HttpResponse.json({ error: 'InternalServerError' }, { status: 500 })
      )
    );
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    await expect(
      act(() => result.current.mutateAsync(draft))
    ).rejects.toBeInstanceOf(WriteFailedError);
    expect(created).toHaveLength(0);
  });

  it('says so when the server refuses the permission', async () => {
    server.use(
      http.post(`${VIEWER_PDS}/xrpc/com.atproto.repo.uploadBlob`, () =>
        HttpResponse.json({ error: 'InsufficientScope' }, { status: 403 })
      )
    );
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    await expect(
      act(() => result.current.mutateAsync(draft))
    ).rejects.toBeInstanceOf(ScopeRefusedError);
  });

  it('asks for permission it doesn’t have, before sending anything', async () => {
    vi.mocked(useSession).mockReturnValue(
      signedInSession(BEA.did, GRANULAR_SCOPE)
    );
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    await expect(
      act(() => result.current.mutateAsync(draft))
    ).rejects.toBeInstanceOf(MissingPermissionError);
    expect(uploads).toBe(0);
  });

  it('fails clearly when the board has gone', async () => {
    mockListRecords(BOARD_PDS, BOARD_OWNER_DID, 'app.userinput.space', []);
    const { result } = renderHook(() => useSendFeedback(), { wrapper });
    await expect(
      act(() => result.current.mutateAsync(draft))
    ).rejects.toBeInstanceOf(BoardUnavailableError);
    expect(uploads).toBe(0);
  });
});
