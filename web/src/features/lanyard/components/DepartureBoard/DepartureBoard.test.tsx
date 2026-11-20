import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { DepartureBoard } from './DepartureBoard';

describe('DepartureBoard', () => {
  it('lists Now, Based and Open to as a description list', () => {
    const { container } = renderWithProviders(
      <DepartureBoard
        role={{ title: 'UX Strategist', company: 'Renderghost', others: 0 }}
        location="Berlin"
        openTo={['speakingEngagements']}
      />
    );
    const list = container.querySelector('dl');
    expect(list).not.toBeNull();
    const terms = [...list!.querySelectorAll('dt')].map((dt) => dt.textContent);
    expect(terms).toEqual(['Now', 'Based', 'Open to']);
    expect(
      within(list!).getByText('UX Strategist · Renderghost')
    ).toBeInTheDocument();
    expect(within(list!).getByText('Berlin')).toBeInTheDocument();
    expect(within(list!).getByText('Speaking engagements')).toBeInTheDocument();
  });

  it('shows two of what they’re open to, then how many more', () => {
    renderWithProviders(
      <DepartureBoard
        openTo={['speakingEngagements', 'mentoringOthers', 'collaborations']}
      />
    );
    expect(
      screen.getByText('Speaking engagements · Mentoring others +1')
    ).toBeInTheDocument();
  });

  it('links other current roles to the Roles block, when there is one', () => {
    const role = { title: 'UX Strategist', others: 2 };
    const { rerender } = renderWithProviders(
      <DepartureBoard role={role} openTo={[]} />
    );
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<DepartureBoard role={role} openTo={[]} rolesHref="#roles" />);
    expect(screen.getByRole('link', { name: '+2 more roles' })).toHaveAttribute(
      'href',
      '#roles'
    );
  });

  it('shows nothing with nothing to show', () => {
    const { container } = renderWithProviders(<DepartureBoard openTo={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
