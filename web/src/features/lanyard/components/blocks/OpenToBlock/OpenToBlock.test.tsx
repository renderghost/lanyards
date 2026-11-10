import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { expectNoAxeViolations } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

import { OpenToBlock } from './OpenToBlock';

describe('OpenToBlock', () => {
  it('labels every openTo value in plain English', async () => {
    const { container } = renderWithProviders(
      <OpenToBlock
        items={[
          { key: 'openTo:mentoringOthers', value: 'mentoringOthers' },
          { key: 'openTo:speakingEngagements', value: 'speakingEngagements' },
        ]}
      />
    );
    expect(screen.getByText('Mentoring others')).toBeInTheDocument();
    expect(screen.getByText('Speaking engagements')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
