import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError } from '@/lib/analytics/analytics';
import { expectNoAxeViolations } from '@/test/axe';
import { mockDidDocument, mockGetRecord } from '@/test/handlers';
import { ADA } from '@/test/people';
import { captureWrites, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { MediaList } from './MediaList';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const items = [
  {
    key: `at://${ADA.did}/app.lanyards.link.media.audio/3maudio`,
    kind: 'audio' as const,
    url: 'https://podcasts.example/ep12',
    platform: 'apple-podcasts',
    title: 'Talking protocols',
  },
  {
    key: `at://${ADA.did}/app.lanyards.link.media.video/3mvideo`,
    kind: 'video' as const,
    url: 'https://video.example/keynote',
    platform: 'youtube',
  },
];

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
});

describe('MediaList', () => {
  it.each([
    [
      'Delete Talking protocols',
      'app.lanyards.link.media.audio',
      '3maudio',
      'Audio deleted',
    ],
    [
      'Delete video.example',
      'app.lanyards.link.media.video',
      '3mvideo',
      'Video deleted',
    ],
  ])(
    '%s from its collection and confirms',
    async (name, collection, rkey, toast) => {
      const writes = captureWrites();
      renderWithClient(<MediaList items={items} />);
      await userEvent.click(screen.getByRole('button', { name }));
      await waitFor(() =>
        expect(writes.deleted).toEqual([{ repo: ADA.did, collection, rkey }])
      );
      await waitFor(() => expect(notify.success).toHaveBeenCalledWith(toast));
    }
  );

  it('offers Undo, which puts the deleted item back as it was', async () => {
    const stored = {
      $type: 'app.lanyards.link.media.audio',
      url: 'https://podcasts.example/ep12',
      platform: 'apple-podcasts',
      title: 'Talking protocols',
      createdAt: '2026-01-02T03:04:05.000Z',
    };
    mockDidDocument(ADA.did, ADA.pds);
    mockGetRecord(
      ADA.pds,
      ADA.did,
      'app.lanyards.link.media.audio',
      '3maudio',
      {
        uri: `at://${ADA.did}/app.lanyards.link.media.audio/3maudio`,
        cid: `bafyrei${'a'.repeat(52)}`,
        value: stored,
      }
    );
    const writes = captureWrites();
    renderWithClient(<MediaList items={items} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Talking protocols' })
    );
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Audio deleted', {
        id: 'media-deleted',
        action: { label: 'Undo', onClick: expect.any(Function) },
      })
    );
    const undo = vi.mocked(notify.success).mock.calls.at(-1)?.[1]?.action;
    await act(async () => undo?.onClick());
    expect(writes.put).toEqual([
      {
        repo: ADA.did,
        collection: 'app.lanyards.link.media.audio',
        rkey: '3maudio',
        record: stored,
      },
    ]);
    expect(notify.success).toHaveBeenCalledWith('Audio restored');
    expect(
      screen.getByRole('button', { name: 'Delete Talking protocols' })
    ).toHaveFocus();
  });

  it('keeps the item and says so when deleting fails', async () => {
    captureWrites({ fail: ['deleteRecord'] });
    renderWithClient(<MediaList items={items} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Talking protocols' })
    );
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        'Failed to save. Please try again.'
      )
    );
    expect(
      screen.getByRole('button', { name: 'Delete Talking protocols' })
    ).toBeEnabled();
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      source: 'media',
    });
  });

  it('moves focus to the next item, then out of the emptied list', async () => {
    captureWrites();
    const onEmptied = vi.fn();
    renderWithClient(<MediaList items={items} onEmptied={onEmptied} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Delete Talking protocols' })
    );
    const next = await screen.findByRole('button', {
      name: 'Delete video.example',
    });
    await waitFor(() => expect(next).toHaveFocus());
    await userEvent.click(next);
    await waitFor(() => expect(onEmptied).toHaveBeenCalled());
  });

  it('has no axe violations', async () => {
    const { container } = renderWithClient(<MediaList items={items} />);
    await expectNoAxeViolations(container);
  });
});
