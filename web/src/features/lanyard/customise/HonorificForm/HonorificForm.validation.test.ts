import { describe, expect, it } from 'vitest';

import { isHonorific } from './HonorificForm.validation';

describe('isHonorific', () => {
  it('accepts the lexicon’s three values only', () => {
    expect(['none', 'Dr', 'Prof'].every(isHonorific)).toBe(true);
    expect(isHonorific('Mr')).toBe(false);
    expect(isHonorific('dr')).toBe(false);
  });
});
