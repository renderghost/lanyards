import { describe, expect, it } from 'vitest';

import { cn } from './utils';

describe('cn', () => {
  it('merges conflicting Tailwind classes, last wins', () => {
    const isHidden = Boolean(Number('0'));
    expect(cn('px-2 leading-6', isHidden && 'hidden', 'px-4')).toBe(
      'leading-6 px-4'
    );
  });
});
