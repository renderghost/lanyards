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
});
