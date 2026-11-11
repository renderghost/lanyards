import { describe, expect, it } from 'vitest';

import { ADA } from '@/test/people';

import { profileId } from './profileId';

describe('profileId', () => {
  it('names someone by their handle', () => {
    expect(profileId(ADA.did, 'alice.test')).toBe('alice.test');
  });

  it.each(['handle.invalid', '', undefined])(
    'falls back to the DID when the handle is %j',
    (handle) => {
      expect(profileId(ADA.did, handle)).toBe(ADA.did);
    }
  );
});
