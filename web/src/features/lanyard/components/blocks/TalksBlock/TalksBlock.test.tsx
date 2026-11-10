import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { TalksBlock } from './TalksBlock';

describe('TalksBlock', () => {
  it('shows each talk with its event, date and role', async () => {
    const { container } = renderWithProviders(
      <TalksBlock
        items={[
          {
            key: 'k1',
            title: 'Talk title',
            eventName: 'Event name',
            date: '2024-03-07',
            role: 'keynote',
            url: 'https://conf.example/talk',
          },
          { key: 'k2', title: 'Untitled panel', role: 'panelist' },
        ]}
      />
    );
    expect(
      screen.getByRole('link', { name: 'Talk title (opens in a new tab)' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Event name · 7 Mar 2024 · Keynote')
    ).toBeInTheDocument();
    expect(screen.getByText('Untitled panel')).toBeInTheDocument();
    expect(screen.getByText('Panellist')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('clamps very long titles instead of overflowing', () => {
    renderWithProviders(
      <TalksBlock items={[{ key: 'k', title: 'x'.repeat(5000) }]} />
    );
    expect(screen.getByText('x'.repeat(5000))).toHaveClass('line-clamp-3');
  });
});
