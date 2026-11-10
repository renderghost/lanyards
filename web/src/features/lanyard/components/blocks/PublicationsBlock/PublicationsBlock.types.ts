import type { BlockItems } from '@/lib/person/personView.types';

export type PublicationsBlockProps = {
  items: BlockItems['publications'][];
  className?: string;
};
