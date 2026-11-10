const CDN_AVATAR = 'https://cdn.bsky.app/img/avatar/';
const CDN_THUMBNAIL = 'https://cdn.bsky.app/img/avatar_thumbnail/';

/**
 * Bluesky's AppView returns full-size avatars (~25 KB); the CDN's thumbnail
 * variant (~2 KB) is plenty for avatars up to 64px and much kinder to venue
 * Wi-Fi. Other URLs are returned unchanged.
 */
export function avatarThumbnail(url: string | undefined): string | undefined {
  return url?.startsWith(CDN_AVATAR)
    ? CDN_THUMBNAIL + url.slice(CDN_AVATAR.length)
    : url;
}
