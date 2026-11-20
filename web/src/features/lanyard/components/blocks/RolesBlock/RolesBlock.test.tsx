import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { SifaPosition } from '@/lib/sources/sifa/sifa.types';
import { expectNoAxeViolations } from '@/test/axe';
import { ADA } from '@/test/people';
import { renderWithProviders } from '@/test/render';

import { RolesBlock } from './RolesBlock';

const role = (
  rkey: string,
  fields: Partial<SifaPosition> = {}
): SifaPosition => ({
  key: `at://${ADA.did}/id.sifa.profile.position/${rkey}`,
  title: rkey,
  isPrimary: false,
  ...fields,
});

const items = [
  role('Research Engineer', {
    company: 'Example Lab',
    startedAt: '2019-03',
    isPrimary: true,
  }),
  role('Visiting Fellow', { startedAt: '2024' }),
  role('Software Developer', {
    company: 'Old Company',
    startedAt: '2015',
    endedAt: '2019',
  }),
];

describe('RolesBlock (#130)', () => {
  it('lists the roles in the order given', () => {
    renderWithProviders(<RolesBlock items={items} />);
    expect(
      screen
        .getAllByRole('listitem')
        .map((row) => row.querySelector('p')?.textContent)
    ).toEqual(['Research Engineer', 'Visiting Fellow', 'Software Developer']);
  });

  it('marks current roles Now, with their dates', async () => {
    const { container } = renderWithProviders(<RolesBlock items={items} />);
    const [current, other, past] = screen.getAllByRole('listitem');
    expect(within(current!).getByText('Now')).toBeInTheDocument();
    expect(within(current!).getByText('Mar 2019 – now')).toBeInTheDocument();
    expect(within(current!).getByText('Example Lab')).toBeInTheDocument();
    expect(within(other!).getByText('2024 – now')).toBeInTheDocument();
    expect(within(past!).queryByText('Now')).toBeNull();
    expect(within(past!).getByText('2015 – 2019')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('shows the company’s initial, or a dot without one', () => {
    renderWithProviders(<RolesBlock items={items} />);
    const [first, second] = screen.getAllByRole('listitem');
    expect(first!.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      /^E$/
    );
    expect(second!.querySelector('[aria-hidden="true"]')).toHaveTextContent(
      /^·$/
    );
  });
});
