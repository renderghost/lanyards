import type { BlockItems } from '@/lib/person/personView.types';

export type MediaBlockProps = {
  items: BlockItems['media'][];
  className?: string;
};
