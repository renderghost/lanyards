import type { BlockItems } from '@/lib/person/personView.types';

export type BlogPostsBlockProps = {
  items: BlockItems['blogPosts'][];
  className?: string;
};
