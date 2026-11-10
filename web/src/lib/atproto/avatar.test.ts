import { describe, expect, it } from 'vitest';

import { avatarThumbnail } from './avatar';

describe('avatarThumbnail', () => {
  it('uses the small CDN variant for Bluesky avatars', () => {
    expect(
      avatarThumbnail(
        'https://cdn.bsky.app/img/avatar/plain/did:plc:abc/bafkrei@jpeg'
      )
    ).toBe(
      'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:abc/bafkrei@jpeg'
    );
  });

  it('leaves other URLs alone', () => {
    expect(avatarThumbnail('https://example.com/img/avatar/me.png')).toBe(
      'https://example.com/img/avatar/me.png'
    );
  });

  it('passes through a missing avatar', () => {
    expect(avatarThumbnail(undefined)).toBeUndefined();
  });
});
