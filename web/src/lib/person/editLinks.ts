import { msg } from '@lingui/core/macro';

import type { RenderableBlockType } from './config';

export type EditLink = { label: ReturnType<typeof msg>; url: string };

const sifa =
  (anchor?: string) =>
  (handle: string): EditLink => ({
    label: msg`Edit on Sifa`,
    url: `https://sifa.id/p/${encodeURIComponent(handle)}?edit=true${anchor ? `#${anchor}` : ''}`,
  });

const bluesky = (handle: string): EditLink => ({
  label: msg`Edit in Bluesky`,
  url: `https://bsky.app/profile/${encodeURIComponent(handle)}`,
});

const none = (): EditLink[] => [];

/**
 * Where the owner edits each block's data, for blocks whose data lives on
 * Sifa or Bluesky (spec §7.4). Links come from both. Blocks Lanyards keeps
 * itself (media) or other apps own (code, collections, blog posts) have
 * none here.
 */
export const EDIT_LINKS: Record<
  RenderableBlockType,
  (handle: string) => EditLink[]
> = {
  links: (handle) => [sifa('other-profiles')(handle), bluesky(handle)],
  talks: (handle) => [sifa('presentations')(handle)],
  openTo: (handle) => [sifa('career')(handle)],
  publications: (handle) => [sifa('publications')(handle)],
  skills: (handle) => [sifa('skills')(handle)],
  education: (handle) => [sifa('education')(handle)],
  details: (handle) => [sifa()(handle)],
  bskyPosts: (handle) => [bluesky(handle)],
  blogPosts: none,
  code: none,
  collections: none,
  media: none,
};
