import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { captureError } from '@/lib/analytics/analytics';
import type { BlockView } from '@/lib/person/personView.types';
import { renderWithProviders } from '@/test/render';

import { LanyardBlocks } from './LanyardBlocks';

vi.mock('@/lib/analytics/analytics', () => ({ captureError: vi.fn() }));
// The Talks block can't render a talk titled "Bad", as a block might fail
// on data it doesn't expect.
vi.mock('../blocks/TalksBlock/TalksBlock', () => ({
  TalksBlock: ({ items }: { items: { title: string }[] }) => {
    if (items.some((item) => item.title === 'Bad')) {
      throw new Error('render failed');
    }
    return <p>Talk list</p>;
  },
}));

const talks = (title: string): BlockView => ({
  type: 'talks',
  status: 'ready',
  items: [{ key: 'k', title }],
  failedSources: [],
});

beforeEach(() => {
  vi.mocked(captureError).mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.mocked(console.error).mockRestore();
});

describe('LanyardBlocks', () => {
  it('shows the owner a crashed block with its edit links and Retry', () => {
    renderWithProviders(
      <LanyardBlocks
        blocks={[talks('Bad')]}
        owner
        profile="alice.test"
        onRetry={vi.fn()}
      />
    );
    const section = screen.getByRole('region', { name: 'Talks' });
    expect(
      within(section).getByText("Couldn't show this block")
    ).toBeInTheDocument();
    expect(
      within(section).getByRole('link', { name: /^Edit on Sifa/ })
    ).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      source: 'block:talks',
    });
  });

  it('recovers on the first Retry, once the fresh data has arrived', async () => {
    let finish: () => void = () => undefined;
    const onRetry = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { rerender } = renderWithProviders(
      <LanyardBlocks blocks={[talks('Bad')]} owner onRetry={onRetry} />
    );
    const retry = screen.getByRole('button', { name: 'Retry' });
    await userEvent.click(retry);
    expect(onRetry).toHaveBeenCalledWith('talks');
    // Still loading: the stale data isn't rendered again meanwhile.
    expect(retry).toHaveAttribute('aria-busy', 'true');

    rerender(
      <LanyardBlocks blocks={[talks('Good')]} owner onRetry={onRetry} />
    );
    await act(async () => finish());
    expect(await screen.findByText('Talk list')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Talks' })).toHaveFocus();
    expect(captureError).toHaveBeenCalledTimes(1);
  });

  it('keeps focus on Retry when the block still can’t be shown', async () => {
    renderWithProviders(
      <LanyardBlocks
        blocks={[talks('Bad')]}
        owner
        onRetry={vi.fn(async () => undefined)}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    const retry = await screen.findByRole('button', { name: 'Retry' });
    expect(retry).not.toHaveAttribute('aria-busy');
    expect(retry).toHaveFocus();
    expect(screen.getByText("Couldn't show this block")).toBeInTheDocument();
    expect(captureError).toHaveBeenCalledTimes(2);
  });

  it('leaves a crashed block out for visitors', () => {
    renderWithProviders(
      <LanyardBlocks blocks={[talks('Bad')]} owner={false} onRetry={vi.fn()} />
    );
    expect(screen.queryByRole('region', { name: 'Talks' })).toBeNull();
  });
});
