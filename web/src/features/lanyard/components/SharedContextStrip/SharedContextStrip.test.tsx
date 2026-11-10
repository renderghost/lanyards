import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/render';
import { BEA, CAL } from '@/test/people';

import { SharedContextStrip } from './SharedContextStrip';

const bea = { did: BEA.did, handle: 'bea.test', displayName: 'Bea Example' };
const cal = { did: CAL.did, handle: 'cal.test' };

describe('SharedContextStrip', () => {
  it.each([
    [[bea], 1, false, 'Followed by Bea Example, who you follow'],
    [
      [bea, cal],
      2,
      false,
      'Followed by Bea Example and cal.test, who you follow',
    ],
    [
      [bea, cal],
      3,
      false,
      'Followed by Bea Example, cal.test and 1 other you follow',
    ],
    [
      [bea, cal],
      6,
      false,
      'Followed by Bea Example, cal.test and 4 others you follow',
    ],
    [[bea], 5, true, 'Followed by Bea Example and 4+ others you follow'],
  ])('describes %#', (sample, count, more, text) => {
    renderWithProviders(
      <SharedContextStrip
        mutual={false}
        knownFollowers={{ sample, count, more } as never}
      />
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('renders nothing when there is nothing shared', () => {
    const { container } = renderWithProviders(
      <SharedContextStrip mutual={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
