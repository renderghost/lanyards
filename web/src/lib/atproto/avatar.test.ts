import { describe, expect, it } from 'vitest';

import { avatarThumbnail, blobThumbnail } from './avatar';

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

describe('blobThumbnail', () => {
  const blob = (mimeType: string) => ({
    $type: 'blob',
    ref: {
      $link: 'bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy',
    },
    mimeType,
    size: 1000,
  });

  it('serves an image blob through Bluesky’s CDN, as a feed thumbnail', () => {
    expect(blobThumbnail('did:plc:ada', blob('image/png'))).toBe(
      'https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:ada/bafkreibme22gw2h7y2h7tg2fhqotaqjucnbc24deqo72b6mkl2egezxhvy@jpeg'
    );
  });

  it('gives nothing for anything else', () => {
    expect(blobThumbnail('did:plc:ada', blob('video/mp4'))).toBeUndefined();
    expect(
      blobThumbnail('did:plc:ada', { mimeType: 'image/png' })
    ).toBeUndefined();
    expect(blobThumbnail('did:plc:ada', undefined)).toBeUndefined();
  });
});
