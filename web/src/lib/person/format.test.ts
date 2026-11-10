import { describe, expect, it } from 'vitest';

import { formatPartialDate, truncateGraphemes } from './format';

describe('formatPartialDate', () => {
  it.each([
    ['2024', '2024'],
    ['2024-03', 'Mar 2024'],
    ['2024-03-07', '7 Mar 2024'],
    ['2024-03-07T09:00:00.000Z', '7 Mar 2024'],
  ])('formats %s as %s', (value, expected) => {
    expect(formatPartialDate(value)).toBe(expected);
  });

  it('returns anything it cannot read unchanged', () => {
    expect(formatPartialDate('Spring 2024')).toBe('Spring 2024');
  });
});

describe('truncateGraphemes', () => {
  it('leaves short text alone', () => {
    expect(truncateGraphemes('Hello', 10)).toBe('Hello');
  });

  it('cuts long text at a grapheme boundary and adds an ellipsis', () => {
    expect(truncateGraphemes('👩‍🔬👩‍🔬👩‍🔬', 2)).toBe('👩‍🔬👩‍🔬…');
  });
});
