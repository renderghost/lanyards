import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { ALBERT, ALICE, TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';
import { renderWithProviders } from '@/test/render';

import { HandleCombobox } from './HandleCombobox';

function Harness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <HandleCombobox
      id="handle"
      label="Your handle"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

const respondWith =
  (byQuery: Record<string, { actors: object[]; delayMs?: number }>) =>
  async ({ request }: { request: Request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? '';
    const match = byQuery[q] ?? { actors: [] };
    if (match.delayMs) await delay(match.delayMs);
    return HttpResponse.json({ actors: match.actors });
  };

describe('HandleCombobox', () => {
  it('lists matching accounts as the user types', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, respondWith({ ali: { actors: [ALICE] } }))
    );
    renderWithProviders(<Harness />);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Your handle' }),
      'ali'
    );
    const option = await screen.findByRole('option', {
      name: /alice\.bsky\.social/,
    });
    expect(within(option).getByText('Alice')).toBeInTheDocument();
  });

  it('never lets an older, slower response replace newer results', async () => {
    server.use(
      http.get(
        TYPEAHEAD_URL,
        respondWith({
          al: { actors: [ALBERT], delayMs: 300 },
          ali: { actors: [ALICE] },
        })
      )
    );
    renderWithProviders(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Your handle' });
    await userEvent.type(input, 'al');
    await new Promise((resolve) => setTimeout(resolve, 250));
    await userEvent.type(input, 'i');

    await screen.findByRole('option', { name: /alice\.bsky\.social/ });
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(
      screen.queryByRole('option', { name: /albert\.bsky\.social/ })
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(1);
  });

  it('fails silently and keeps the typed handle when lookup errors', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, () =>
        HttpResponse.json({ error: 'InternalServerError' }, { status: 500 })
      )
    );
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Your handle' }),
      'ali'
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith('ali');
    expect(screen.getByRole('combobox', { name: 'Your handle' })).toHaveValue(
      'ali'
    );
  });

  it('only reports itself expanded when suggestions are showing', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, respondWith({ ali: { actors: [ALICE] } }))
    );
    renderWithProviders(<Harness />);
    const input = screen.getByRole('combobox', { name: 'Your handle' });
    await userEvent.type(input, 'zz');
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.clear(input);
    await userEvent.type(input, 'ali');
    await screen.findByRole('option', { name: /alice\.bsky\.social/ });
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('fills in the handle when a suggestion is chosen', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, respondWith({ ali: { actors: [ALICE] } }))
    );
    const onChange = vi.fn();
    renderWithProviders(<Harness onChange={onChange} />);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Your handle' }),
      'ali'
    );
    await userEvent.click(
      await screen.findByRole('option', { name: /alice\.bsky\.social/ })
    );
    await waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith('alice.bsky.social')
    );
    expect(screen.getByRole('combobox', { name: 'Your handle' })).toHaveValue(
      'alice.bsky.social'
    );
  });

  it('has no axe violations with suggestions open', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, respondWith({ ali: { actors: [ALICE] } }))
    );
    const { container } = renderWithProviders(<Harness />);
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Your handle' }),
      'ali'
    );
    await screen.findByRole('option', { name: /alice\.bsky\.social/ });
    await expectNoAxeViolations(container);
  });
});
