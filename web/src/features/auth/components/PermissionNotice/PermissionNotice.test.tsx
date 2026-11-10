import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/features/auth/session/useSession';
import { BEA } from '@/test/people';
import { signedInSession } from '@/test/person';
import { renderWithProviders } from '@/test/render';

import { PermissionNotice } from './PermissionNotice';

vi.mock('@/features/auth/session/useSession', () => ({ useSession: vi.fn() }));

const HEADING = 'Lanyards needs your permission';

beforeEach(() => {
  vi.mocked(useSession).mockReturnValue(signedInSession(BEA.did, 'atproto'));
});

describe('PermissionNotice', () => {
  it('takes focus when it appears in answer to an action', () => {
    renderWithProviders(
      <PermissionNotice returnTo="/@alice.test" focusOnShow />
    );
    expect(screen.getByRole('heading', { name: HEADING })).toHaveFocus();
  });

  it('leaves focus alone when it is part of the page', () => {
    renderWithProviders(<PermissionNotice returnTo="/@alice.test" />);
    expect(screen.getByRole('heading', { name: HEADING })).not.toHaveFocus();
  });
});
