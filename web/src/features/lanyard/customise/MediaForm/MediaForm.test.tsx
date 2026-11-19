import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { validateRecord } from '@/lib/lexicons/validate';
import { expectNoAxeViolations } from '@/test/axe';
import { renderWithClient } from '@/test/render';

import audio from '../../../../../lexicons/lanyards/app/lanyards/link/media/audio.json';
import video from '../../../../../lexicons/lanyards/app/lanyards/link/media/video.json';
import { MediaForm } from './MediaForm';

/** The form hands a valid entry over; it writes nothing itself. */
const onSubmit = vi.fn();

const values = (name: string) =>
  within(screen.getByRole('combobox', { name }))
    .getAllByRole('option')
    .map((option) => option.getAttribute('value'))
    .filter(Boolean);

beforeEach(() => {
  onSubmit.mockClear();
});

describe('MediaForm', () => {
  it('offers each kind’s platforms and content types from its lexicon', async () => {
    renderWithClient(<MediaForm onSubmit={onSubmit} />);
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
    renderWithClient(<MediaForm onSubmit={onSubmit} />);
    expect(screen.getByRole('textbox', { name: 'Description' }).tagName).toBe(
      'TEXTAREA'
    );
  });

  it('shows each problem and moves to the first', async () => {
    renderWithClient(<MediaForm onSubmit={onSubmit} />);
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
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ['Audio', 'app.lanyards.link.media.audio', 'spotify', 'interview', 'audio'],
    [
      'Video',
      'app.lanyards.link.media.video',
      'youtube',
      'conference-talk',
      'video',
    ],
  ] as const)(
    'hands over %s for its own collection',
    async (label, collection, platform, type, kind) => {
      renderWithClient(<MediaForm onSubmit={onSubmit} />);
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
      const fields = {
        url: 'https://media.example/1',
        platform,
        title: 'Talking protocols',
        description: 'A conversation about open protocols.',
        type,
      };
      expect(onSubmit).toHaveBeenCalledWith({ kind, ...fields });
      expect(
        validateRecord(collection, {
          $type: collection,
          ...fields,
          createdAt: '2026-11-19T12:00:00.000Z',
        }).ok
      ).toBe(true);
      expect(screen.getByRole('textbox', { name: 'Web address' })).toHaveValue(
        ''
      );
    }
  );

  it('edits an entry in place, from its current values', async () => {
    const onCancel = vi.fn();
    renderWithClient(
      <MediaForm
        onSubmit={onSubmit}
        onCancel={onCancel}
        initial={{
          kind: 'video',
          url: 'https://media.example/2',
          platform: 'youtube',
          title: 'Keynote',
        }}
      />
    );
    expect(screen.getByRole('radio', { name: 'Video' })).toBeChecked();
    const title = screen.getByRole('textbox', { name: 'Title' });
    expect(title).toHaveValue('Keynote');
    await userEvent.clear(title);
    await userEvent.type(title, 'Opening keynote');
    await userEvent.click(screen.getByRole('button', { name: 'Update' }));
    expect(onSubmit).toHaveBeenCalledWith({
      kind: 'video',
      url: 'https://media.example/2',
      platform: 'youtube',
      title: 'Opening keynote',
    });
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('editing keeps the kind: audio and video are different records', () => {
    renderWithClient(
      <MediaForm
        onSubmit={onSubmit}
        initial={{
          kind: 'video',
          url: 'https://video.example/1',
          platform: 'youtube',
        }}
      />
    );
    const kinds = within(screen.getByRole('group', { name: 'Type of media' }));
    expect(kinds.getByRole('radio', { name: 'Video' })).toBeChecked();
    expect(kinds.getByRole('radio', { name: 'Video' })).toBeDisabled();
    expect(kinds.getByRole('radio', { name: 'Audio' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Web address' })).toBeEnabled();
  });

  it('has no axe violations, including with errors', async () => {
    const { container } = renderWithClient(<MediaForm onSubmit={onSubmit} />);
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Add media' }));
    await expectNoAxeViolations(container);
  });
});
