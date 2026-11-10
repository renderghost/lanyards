import type { BlockItems } from '@/lib/person/personView.types';

export type CollectionsBlockProps = {
  items: BlockItems['collections'][];
  className?: string;
};
