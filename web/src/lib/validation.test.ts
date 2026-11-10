import { describe, expect, it } from 'vitest';

import { tooLong, validateWebAddress } from './validation';

describe('validateWebAddress', () => {
  it.each([
    ['', 'required'],
    ['   ', 'required'],
    ['ftp://x', 'scheme'],
    ['example.com', 'scheme'],
    ['javascript:alert(1)', 'scheme'],
    ['https://', 'scheme'],
  ] as const)('rejects %j as %s', (value, error) => {
    expect(validateWebAddress(value)).toBe(error);
  });

  it.each([
    'https://example.com',
    'http://a.example/path?q=1',
    ' https://x.example ',
  ])('accepts %j', (value) => {
    expect(validateWebAddress(value)).toBeNull();
  });
});

describe('tooLong', () => {
  it('counts UTF-8 bytes, as lexicon maxLength does', () => {
    expect(tooLong('x'.repeat(100), 100)).toBe(false);
    expect(tooLong('x'.repeat(101), 100)).toBe(true);
    expect(tooLong('é'.repeat(51), 100)).toBe(true);
  });
});
