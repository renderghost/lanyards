import type { BlockItems } from '@/lib/person/personView.types';

export type BskyPostsBlockProps = {
  items: BlockItems['bskyPosts'][];
  className?: string;
};
