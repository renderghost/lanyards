import { describe, expect, it } from 'vitest';

import {
  normaliseIdentifier,
  validateIdentifier,
} from './SignInForm.validation';

describe('normaliseIdentifier', () => {
  it('trims, strips a leading @ and lower-cases handles', () => {
    expect(normaliseIdentifier('  @Alice.Bsky.Social ')).toBe(
      'alice.bsky.social'
    );
  });

  it('only trims DIDs, which are case-sensitive', () => {
    expect(normaliseIdentifier(' did:plc:Z72i7hdynmk6r22z27h6tvur ')).toBe(
      'did:plc:Z72i7hdynmk6r22z27h6tvur'
    );
  });
});

describe('validateIdentifier', () => {
  it('requires a value', () => {
    expect(validateIdentifier('')).toBe('required');
    expect(validateIdentifier('   ')).toBe('required');
  });

  it('spots an email address typed by mistake', () => {
    expect(validateIdentifier('alice@example.com')).toBe('email');
  });

  it('rejects text that is not a handle', () => {
    expect(validateIdentifier('not a handle')).toBe('invalid');
    expect(validateIdentifier('alice')).toBe('invalid');
  });

  it('accepts handles in any case, with or without @', () => {
    expect(validateIdentifier('@Alice.Bsky.Social')).toBeNull();
    expect(validateIdentifier('alice.bsky.social')).toBeNull();
  });

  it('accepts DIDs', () => {
    expect(validateIdentifier('did:plc:z72i7hdynmk6r22z27h6tvur')).toBeNull();
  });
});
