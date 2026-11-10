import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { useSession } from '@/features/auth/session/useSession';
import { captureError, track } from '@/lib/analytics/analytics';
import { validateRecord } from '@/lib/lexicons/validate';
import { expectNoAxeViolations } from '@/test/axe';
import { mockDidDocument, mockGetRecord } from '@/test/handlers';
import { ADA } from '@/test/people';
import { captureWrites, signedInSession } from '@/test/person';
import { renderWithClient } from '@/test/render';

import { HonorificForm } from './HonorificForm';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));
vi.mock('@/lib/analytics/analytics', () => ({
  captureError: vi.fn(),
  track: vi.fn(),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const NSID = 'app.lanyards.actor.biography.honorific';
const CREATED = '2025-11-20T09:00:00.000Z';

function storedHonorific(value: string | null) {
  mockDidDocument(ADA.did, ADA.pds);
  mockGetRecord(
    ADA.pds,
    ADA.did,
    NSID,
    'self',
    value
      ? {
          uri: `at://${ADA.did}/${NSID}/self`,
          cid: `bafyrei${'a'.repeat(52)}`,
          value: { $type: NSID, value, createdAt: CREATED },
        }
      : null
  );
}

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(ADA.did));
});

describe('HonorificForm', () => {
  it('offers None, Dr and Prof under the legend Honorific', () => {
    renderWithClient(<HonorificForm current="Dr" />);
    const group = screen.getByRole('group', { name: 'Honorific' });
    expect(group).toBeInTheDocument();
    expect(
      screen.getAllByRole('radio').map((radio) => radio.getAttribute('value'))
    ).toEqual(['none', 'Dr', 'Prof']);
    expect(screen.getByRole('radio', { name: 'Dr' })).toBeChecked();
  });

  it('saves the choice, keeping when the record was created', async () => {
    storedHonorific('Dr');
    const writes = captureWrites();
    renderWithClient(<HonorificForm current="Dr" />);
    await userEvent.click(screen.getByRole('radio', { name: 'Prof' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Save honorific' })
    );
    await waitFor(() => expect(writes.put).toHaveLength(1));
    const write = writes.put[0] as {
      collection: string;
      rkey: string;
      record: Record<string, unknown>;
    };
    expect(write).toMatchObject({ collection: NSID, rkey: 'self' });
    expect(write.record).toMatchObject({ value: 'Prof', createdAt: CREATED });
    expect(write.record.updatedAt).toEqual(expect.any(String));
    expect(validateRecord(NSID, write.record).ok).toBe(true);
    expect(notify.success).toHaveBeenCalledWith('Honorific updated');
    expect(track).toHaveBeenCalledWith('kept_record_saved', {
      kind: 'honorific',
    });
  });

  it('creates the record when there is none yet', async () => {
    storedHonorific(null);
    const writes = captureWrites();
    renderWithClient(<HonorificForm current="none" />);
    await userEvent.click(screen.getByRole('radio', { name: 'Dr' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Save honorific' })
    );
    await waitFor(() => expect(writes.put).toHaveLength(1));
    const record = (writes.put[0] as { record: Record<string, unknown> })
      .record;
    expect(record.createdAt).toBe(record.updatedAt);
  });

  it('says so when saving fails, keeping the choice', async () => {
    storedHonorific('Dr');
    captureWrites({ fail: ['putRecord'] });
    renderWithClient(<HonorificForm current="Dr" />);
    await userEvent.click(screen.getByRole('radio', { name: 'None' }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Save honorific' })
    );
    await waitFor(() =>
      expect(notify.error).toHaveBeenCalledWith(
        'Failed to save. Please try again.'
      )
    );
    expect(screen.getByRole('radio', { name: 'None' })).toBeChecked();
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      source: 'honorific',
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderWithClient(<HonorificForm current="Prof" />);
    await expectNoAxeViolations(container);
  });
});
