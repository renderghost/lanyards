import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { TYPEAHEAD_URL } from '@/test/fixtures';
import { server } from '@/test/msw';
import { renderInRouter } from '@/test/router';

import { LanyardNotFound } from './LanyardNotFound';

describe('LanyardNotFound', () => {
  it('names the missing handle and searches for another', async () => {
    server.use(
      http.get(TYPEAHEAD_URL, () => HttpResponse.json({ actors: [] }))
    );
    const { router, container } = renderInRouter(
      <LanyardNotFound handle="nobody.test" />
    );
    expect(
      await screen.findByRole('heading', {
        name: "We couldn't find @nobody.test",
      })
    ).toBeInTheDocument();
    await userEvent.type(
      screen.getByRole('combobox', { name: 'Search for someone' }),
      ' @Bob.Test '
    );
    await userEvent.click(screen.getByRole('button', { name: 'Show lanyard' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/@bob.test')
    );
    await expectNoAxeViolations(container);
  });

  it('speaks generally when there was no handle', async () => {
    renderInRouter(<LanyardNotFound />);
    expect(
      await screen.findByRole('heading', {
        name: "We couldn't find that lanyard",
      })
    ).toBeInTheDocument();
  });
});
