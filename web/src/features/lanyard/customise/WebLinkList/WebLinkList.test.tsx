import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { captureWrites, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { WebLinkList } from './WebLinkList';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const links = [
  {
    key: `at://${ADA.did}/app.lanyards.link.web/3mcv`,
    url: 'https://ada.example/cv',
    title: 'CV',
  },
  {
    key: `at://${ADA.did}/app.lanyards.link.web/3mblog`,
    url: 'https://blog.ada.example/',
  },
];

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
});

describe('WebLinkList', () => {
  it('lists the links, named by title or else address', () => {
    renderWithClient(<WebLinkList links={links} />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining('CV'),
      expect.stringContaining('blog.ada.example'),
    ]);
  });

  it('deletes a link and confirms', async () => {
    const writes = captureWrites();
    renderWithClient(<WebLinkList links={links} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete CV' }));
    await waitFor(() =>
      expect(writes.deleted).toEqual([
        { repo: ADA.did, collection: 'app.lanyards.link.web', rkey: '3mcv' },
      ])
    );
    await waitFor(() =>
      expect(notify.success).toHaveBeenCalledWith('Link deleted')
    );
  });

  it('keeps the link and says so when deleting fails', async () => {
    captureWrites({ fail: ['deleteRecord'] });
    renderWithClient(<WebLinkList links={links} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete CV' }));
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        'Failed to save. Please try again.'
      )
    );
    expect(screen.getByRole('button', { name: 'Delete CV' })).toBeEnabled();
  });

  it('shows nothing without links', () => {
    const { container } = renderWithClient(<WebLinkList links={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('moves focus to the next item, then out of the emptied list', async () => {
    captureWrites();
    const onEmptied = vi.fn();
    renderWithClient(<WebLinkList links={links} onEmptied={onEmptied} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete CV' }));
    const next = await screen.findByRole('button', {
      name: 'Delete blog.ada.example',
    });
    await waitFor(() => expect(next).toHaveFocus());
    await userEvent.click(next);
    await waitFor(() => expect(onEmptied).toHaveBeenCalled());
  });

  it('has no axe violations', async () => {
    const { container } = renderWithClient(<WebLinkList links={links} />);
    await expectNoAxeViolations(container);
  });
});
