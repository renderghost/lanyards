import { msg } from '@lingui/core/macro';
import type { ComponentType } from 'react';

import type { RenderableBlockType } from '@/lib/person/config';

import { BlogPostsBlock } from '../blocks/BlogPostsBlock/BlogPostsBlock';
import { BskyPostsBlock } from '../blocks/BskyPostsBlock/BskyPostsBlock';
import { CodeBlock } from '../blocks/CodeBlock/CodeBlock';
import { CollectionsBlock } from '../blocks/CollectionsBlock/CollectionsBlock';
import { DetailsBlock } from '../blocks/DetailsBlock/DetailsBlock';
import { EducationBlock } from '../blocks/EducationBlock/EducationBlock';
import { LinksBlock } from '../blocks/LinksBlock/LinksBlock';
import { MediaBlock } from '../blocks/MediaBlock/MediaBlock';
import { OpenToBlock } from '../blocks/OpenToBlock/OpenToBlock';
import { PublicationsBlock } from '../blocks/PublicationsBlock/PublicationsBlock';
import { SkillsBlock } from '../blocks/SkillsBlock/SkillsBlock';
import { TalksBlock } from '../blocks/TalksBlock/TalksBlock';

export const BLOCK_HEADINGS: Record<
  RenderableBlockType,
  ReturnType<typeof msg>
> = {
  links: msg`Links`,
  talks: msg`Talks`,
  openTo: msg`Open to`,
  blogPosts: msg`Blog posts`,
  bskyPosts: msg`Posts on Bluesky`,
  publications: msg`Publications`,
  skills: msg`Skills`,
  education: msg`Education`,
  code: msg`Code`,
  collections: msg`Collections`,
  media: msg`Podcasts and videos`,
  details: msg`Details`,
};

/** Each block's renderer; every one takes `{ items }` of its own type. */
export const BLOCK_COMPONENTS: Record<
  RenderableBlockType,
  ComponentType<{ items: never[] }>
> = {
  links: LinksBlock,
  talks: TalksBlock,
  openTo: OpenToBlock,
  blogPosts: BlogPostsBlock,
  bskyPosts: BskyPostsBlock,
  publications: PublicationsBlock,
  skills: SkillsBlock,
  education: EducationBlock,
  code: CodeBlock,
  collections: CollectionsBlock,
  media: MediaBlock,
  details: DetailsBlock,
};
