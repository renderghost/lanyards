import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { servePerson, signedInSession } from '@/test/person';
import { renderInRouter } from '@/test/router';

import { useCustomiserDraft } from '../../hooks/useCustomiserDraft';
import { LanyardEditor } from './LanyardEditor';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));

/** The editor over the real draft, as the customiser wires it. */
function Harness() {
  const { settings, records } = useCustomiserDraft(ADA.did);
  return (
    <>
      <LanyardEditor
        did={ADA.did}
        config={settings.config}
        onChange={settings.update}
        disabled={!settings.ready}
        records={records}
        recordsDisabled={!records.ready}
      />
      <output data-testid="hidden">{settings.config.hidden.join(' ')}</output>
    </>
  );
}

const TALK = 'Building on ATProto at Example Conf 2024';
const GONE = `at://${ADA.did}/id.sifa.profile.presentationDelivery/deleted`;

/** The blocks' types, in order (each block's own items are lists too). */
const order = (list: HTMLElement) =>
  [...list.children].map((child) => (child as HTMLElement).dataset.block);

const block = (type: string) =>
  document.querySelector<HTMLElement>(`[data-block="${type}"]`)!;

async function renderEditor() {
  const view = renderInRouter(<Harness />);
  await screen.findByRole('heading', { level: 2, name: 'Dr Ada Example' });
  const down = await screen.findByRole('button', { name: 'Move Links down' });
  await waitFor(() => expect(down).not.toHaveAttribute('aria-disabled'), {
    timeout: 5000,
  });
  return view;
}

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
  document.documentElement.dataset.accent = 'blue';
});

describe('LanyardEditor', { timeout: 20_000 }, () => {
  it('moves a block with Move down and announces it', async () => {
    servePerson();
    await renderEditor();
    const blocks = screen.getByRole('list', { name: 'Blocks' });
    expect(order(blocks).slice(0, 2)).toEqual(['links', 'talks']);
    await userEvent.click(
      screen.getByRole('button', { name: 'Move Links down' })
    );
    expect(order(blocks).slice(0, 2)).toEqual(['talks', 'links']);
    expect(
      screen.getByText('Links moved to position 2 of 12')
    ).toBeInTheDocument();
  });

  it('keeps focus on Move down after moving', async () => {
    servePerson();
    await renderEditor();
    await userEvent.click(
      screen.getByRole('button', { name: 'Move Links down' })
    );
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Move Links down' })
      ).toHaveFocus()
    );
  });

  it('hiding a block collapses it in place and keeps focus on its switch', async () => {
    servePerson();
    await renderEditor();
    const talks = block('talks');
    expect(within(talks).getByText(/Example Conf 2024/)).toBeInTheDocument();
    const toggle = within(talks).getByRole('switch', { name: 'Show Talks' });
    toggle.focus();
    await userEvent.keyboard(' ');
    expect(block('talks')).toBe(talks);
    expect(within(talks).queryByText(/Example Conf 2024/)).toBeNull();
    expect(within(talks).getByText('Hidden from visitors')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(toggle).toHaveFocus();
  });

  it('a counted block offers Show N; Talks doesn’t', async () => {
    servePerson();
    await renderEditor();
    expect(
      within(block('bskyPosts')).getByRole('combobox', {
        name: 'Items to show for Social posts',
      })
    ).toHaveValue('3');
    expect(within(block('talks')).queryByRole('combobox')).toBeNull();
  });

  it('hiding a record marks it Hidden in place, keeping focus', async () => {
    servePerson();
    await renderEditor();
    const hide = await screen.findByRole('button', { name: `Hide ${TALK}` });
    hide.focus();
    await userEvent.keyboard('{Enter}');
    const show = screen.getByRole('button', { name: `Show ${TALK}` });
    expect(show).toHaveFocus();
    expect(
      within(block('talks')).getByText(/Example Conf 2024/)
    ).toBeInTheDocument();
    expect(within(block('talks')).getByText('Hidden')).toBeInTheDocument();
    expect(screen.getByTestId('hidden').textContent).not.toBe('');
  });

  it('Clear removes hidden entries that are no longer on the lanyard', async () => {
    servePerson({ config: { hidden: [GONE] } });
    await renderEditor();
    const line = await screen.findByText(
      '1 hidden item is no longer on your lanyard',
      undefined,
      { timeout: 5000 }
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(line).not.toBeInTheDocument();
    expect(screen.getByTestId('hidden').textContent).toBe('');
    // The button is gone: focus lands on the blocks, and the change is said.
    expect(screen.getByRole('list', { name: 'Blocks' })).toHaveFocus();
    expect(
      screen.getByText('Cleared 1 hidden item from your settings')
    ).toBeInTheDocument();
  });

  it('says when the Bluesky profile can’t be read, offering Try again', async () => {
    servePerson({
      profileError: { error: 'InternalServerError', status: 500 },
    });
    renderInRouter(<Harness />);
    expect(
      await screen.findByRole(
        'button',
        { name: 'Try again' },
        { timeout: 15_000 }
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Loading lanyard…')).toBeNull();
  });

  it('puts the ORCID helper in Publications', async () => {
    servePerson({
      config: {
        blocks: [
          { type: 'links', visible: true },
          { type: 'media', visible: true },
          { type: 'publications', visible: true, limit: 3 },
        ],
      },
    });
    await renderEditor();
    expect(
      await within(block('publications')).findByRole(
        'heading',
        { level: 3, name: /ORCID iD/ },
        { timeout: 5000 }
      )
    ).toBeInTheDocument();
  });

  it('adds podcasts and videos in their block; links can only be hidden', async () => {
    servePerson({
      config: {
        blocks: [
          { type: 'links', visible: true },
          { type: 'media', visible: true },
          { type: 'publications', visible: true, limit: 3 },
        ],
      },
    });
    await renderEditor();
    expect(
      within(block('links')).queryByRole('button', { name: 'Add a link' })
    ).toBeNull();
    expect(
      within(block('media')).getByRole('button', {
        name: 'Add a podcast or video',
      })
    ).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    servePerson();
    const { container } = await renderEditor();
    await screen.findByRole('button', { name: `Hide ${TALK}` });
    await expectNoAxeViolations(container);
  });
});
