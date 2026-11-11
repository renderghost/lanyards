import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { captureError } from '@/lib/analytics/analytics';
import type { BlockView } from '@/lib/person/personView.types';
import { renderWithProviders } from '@/test/render';

import { LanyardBlocks } from './LanyardBlocks';

vi.mock('@/lib/analytics/analytics', () => ({ captureError: vi.fn() }));
// The Talks block throws while `renders.crash` is set.
const renders = vi.hoisted(() => ({ crash: false }));
vi.mock('../blocks/TalksBlock/TalksBlock', () => ({
  TalksBlock: () => {
    if (renders.crash) throw new Error('render failed');
    return <p>Talk list</p>;
  },
}));

const talks: BlockView = {
  type: 'talks',
  status: 'ready',
  items: [{ key: 'k', title: 'A talk' }],
  failedSources: [],
};

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.mocked(console.error).mockRestore();
  renders.crash = false;
});

describe('LanyardBlocks', () => {
  it('offers the owner Retry for a block that crashed, which recovers it', async () => {
    renders.crash = true;
    const onRetry = vi.fn();
    renderWithProviders(
      <LanyardBlocks blocks={[talks]} owner onRetry={onRetry} />
    );
    const section = screen.getByRole('region', { name: 'Talks' });
    expect(
      within(section).getByText("Couldn't show this block")
    ).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      source: 'block:talks',
    });

    renders.crash = false;
    await userEvent.click(
      within(section).getByRole('button', { name: 'Retry' })
    );
    expect(onRetry).toHaveBeenCalledWith('talks');
    expect(screen.getByText('Talk list')).toBeInTheDocument();
  });

  it('leaves a crashed block out for visitors', () => {
    renders.crash = true;
    renderWithProviders(
      <LanyardBlocks blocks={[talks]} owner={false} onRetry={vi.fn()} />
    );
    expect(screen.queryByRole('region', { name: 'Talks' })).toBeNull();
  });
});
