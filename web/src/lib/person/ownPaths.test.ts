import { describe, expect, it } from 'vitest';

import { ownPaths } from './ownPaths';

const DID = 'did:plc:fixturealiceaaaaaaaaaaaa';

describe('ownPaths (#150)', () => {
  it('names your pages by handle', () => {
    expect(ownPaths(DID, 'alice.test')).toEqual({
      id: 'alice.test',
      edit: '/alice.test/edit',
      view: '/alice.test',
      share: '/alice.test/share',
    });
  });

  it('falls back to your DID without a handle that verifies', () => {
    for (const handle of [undefined, 'handle.invalid']) {
      expect(ownPaths(DID, handle)).toEqual({
        id: DID,
        edit: `/${DID}/edit`,
        view: `/d/${DID}`,
        share: `/${DID}/share`,
      });
    }
  });
});
