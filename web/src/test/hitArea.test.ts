import { describe, expect, it } from 'vitest';

import { hitHeight } from './hitArea';

describe('hitHeight', () => {
  it('is the control’s own height without a ::before', () => {
    expect(hitHeight('min-h-11 px-4')).toBe(44);
    expect(hitHeight('size-11')).toBe(44);
  });

  it('adds the ::before overhang to the padding box', () => {
    expect(hitHeight('min-h-9 before:absolute before:-inset-y-1')).toBe(44);
  });

  it('takes the borders off, as the ::before starts inside them', () => {
    expect(hitHeight('h-6 border-2 before:absolute before:-inset-y-2.5')).toBe(
      40
    );
    expect(hitHeight('min-h-9 border before:absolute before:-inset-y-1')).toBe(
      42
    );
  });
});
