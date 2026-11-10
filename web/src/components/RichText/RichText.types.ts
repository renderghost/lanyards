import type { Facet } from '@/lib/sources/bluesky/bluesky.types';

export type RichTextProps = {
  text: string;
  facets?: Facet[];
  className?: string;
};
