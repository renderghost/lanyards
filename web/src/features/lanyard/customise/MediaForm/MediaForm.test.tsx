import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { track } from '@/lib/analytics/analytics';
import { validateRecord } from '@/lib/lexicons/validate';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { captureWrites, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import audio from '../../../../../lexicons/lanyards/app/lanyards/link/media/audio.json';
import video from '../../../../../lexicons/lanyards/app/lanyards/link/media/video.json';
import { MediaForm } from './MediaForm';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const values = (name: string) =>
  within(screen.getByRole('combobox', { name }))
    .getAllByRole('option')
    .map((option) => option.getAttribute('value'))
    .filter(Boolean);

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
});

describe('MediaForm', () => {
  it('offers each kind’s platforms and content types from its lexicon', async () => {
    renderWithClient(<MediaForm />);
    const kind = screen.getByRole('group', { name: 'Type of media' });
    expect(within(kind).getByRole('radio', { name: 'Audio' })).toBeChecked();
    expect(values('Platform')).toEqual(
      audio.defs.main.record.properties.platform.enum
    );
    expect(values('Kind of content')).toEqual(
      audio.defs.main.record.properties.type.enum
    );
    await userEvent.click(within(kind).getByRole('radio', { name: 'Video' }));
    expect(values('Platform')).toEqual(
      video.defs.main.record.properties.platform.enum
    );
    expect(values('Kind of content')).toEqual(
      video.defs.main.record.properties.type.enum
    );
  });

  it('asks for a description in a text area', () => {
    renderWithClient(<MediaForm />);
    expect(screen.getByRole('textbox', { name: 'Description' }).tagName).toBe(
      'TEXTAREA'
    );
  });

  it('shows each problem and moves to the first', async () => {
    const writes = captureWrites();
    renderWithClient(<MediaForm />);
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Title' }),
      'x'.repeat(201)
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
    const address = screen.getByRole('textbox', { name: 'Web address' });
    expect(address).toHaveFocus();
    expect(address).toHaveAccessibleDescription('Enter a web address');
    expect(
      screen.getByRole('combobox', { name: 'Platform' })
    ).toHaveAccessibleDescription('Choose a platform');
    expect(
      screen.getByRole('textbox', { name: 'Title' })
    ).toHaveAccessibleDescription('Keep the title to 200 characters or fewer');
    expect(writes.created).toEqual([]);
  });

  it.each([
    [
      'Audio',
      'app.lanyards.link.media.audio',
      'spotify',
      'interview',
      'Audio added',
      'audio',
    ],
    [
      'Video',
      'app.lanyards.link.media.video',
      'youtube',
      'conference-talk',
      'Video added',
      'video',
    ],
  ] as const)(
    'adds %s to its own collection',
    async (label, collection, platform, type, toast, kind) => {
      const writes = captureWrites();
      renderWithClient(<MediaForm />);
      await userEvent.click(screen.getByRole('radio', { name: label }));
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Web address' }),
        'https://media.example/1'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: 'Platform' }),
        platform
      );
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Title' }),
        'Talking protocols'
      );
      await userEvent.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'A conversation about open protocols.'
      );
      await userEvent.selectOptions(
        screen.getByRole('combobox', { name: 'Kind of content' }),
        type
      );
      await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
      await waitFor(() => expect(writes.created).toHaveLength(1));
      const write = writes.created[0] as {
        collection: string;
        record: Record<string, unknown>;
      };
      expect(write.collection).toBe(collection);
      expect(write.record).toMatchObject({
        url: 'https://media.example/1',
        platform,
        title: 'Talking protocols',
        description: 'A conversation about open protocols.',
        type,
      });
      expect(validateRecord(collection, write.record).ok).toBe(true);
      await waitFor(() => expect(notify.success).toHaveBeenCalledWith(toast));
      expect(track).toHaveBeenCalledWith('kept_record_saved', { kind });
      expect(screen.getByRole('textbox', { name: 'Web address' })).toHaveValue(
        ''
      );
    }
  );

  it('has no axe violations, including with errors', async () => {
    const { container } = renderWithClient(<MediaForm />);
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
    await expectNoAxeViolations(container);
  });
});
