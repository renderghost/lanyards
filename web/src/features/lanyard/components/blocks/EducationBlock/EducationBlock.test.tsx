import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { EducationBlock } from './EducationBlock';

describe('EducationBlock', () => {
  it('shows the institution, course and years', () => {
    renderWithProviders(
      <EducationBlock
        items={[
          {
            key: 'k',
            institution: 'University of Example',
            degree: 'PhD',
            fieldOfStudy: 'Computer Science',
            startedAt: '2014',
            endedAt: '2018-06',
          },
        ]}
      />
    );
    expect(screen.getByText('University of Example')).toBeInTheDocument();
    expect(
      screen.getByText('PhD, Computer Science · 2014–Jun 2018')
    ).toBeInTheDocument();
  });

  it('is a card that opens nothing', () => {
    renderWithProviders(
      <EducationBlock
        items={[{ key: 'e', institution: 'Example University', degree: 'PhD' }]}
      />
    );
    const card = document.querySelector('[data-card]');
    expect(card).not.toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
    expect(card).not.toHaveClass('cursor-pointer');
  });
});
