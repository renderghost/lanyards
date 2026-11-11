import { msg } from '@lingui/core/macro';

import type { RenderableBlockType } from './config';

export type EditLink = { label: ReturnType<typeof msg>; url: string };

const sifa =
  (anchor?: string) =>
  (profile: string): EditLink => ({
    label: msg`Edit on Sifa`,
    url: `https://sifa.id/p/${encodeURIComponent(profile)}?edit=true${anchor ? `#${anchor}` : ''}`,
  });

const bluesky = (profile: string): EditLink => ({
  label: msg`Edit in Bluesky`,
  url: `https://bsky.app/profile/${encodeURIComponent(profile)}`,
});

const none = (): EditLink[] => [];

/**
 * Where the owner edits each block's data, for blocks whose data lives on
 * Sifa or Bluesky (spec §7.4). Links come from both. Blocks Lanyards keeps
 * itself (media) or other apps own (code, collections, blog posts) have
 * none here. Each takes the owner's profile, or DID when it doesn't verify
 * (see profileId).
 */
export const EDIT_LINKS: Record<
  RenderableBlockType,
  (profile: string) => EditLink[]
> = {
  links: (profile) => [sifa('other-profiles')(profile), bluesky(profile)],
  talks: (profile) => [sifa('presentations')(profile)],
  openTo: (profile) => [sifa('career')(profile)],
  publications: (profile) => [sifa('publications')(profile)],
  skills: (profile) => [sifa('skills')(profile)],
  education: (profile) => [sifa('education')(profile)],
  details: (profile) => [sifa()(profile)],
  bskyPosts: (profile) => [bluesky(profile)],
  blogPosts: none,
  code: none,
  collections: none,
  media: none,
};
