import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { captureWrites, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { MediaList } from './MediaList';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
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
  });

  it('has no axe violations', async () => {
    const { container } = renderWithClient(<MediaList items={items} />);
    await expectNoAxeViolations(container);
  });
});
