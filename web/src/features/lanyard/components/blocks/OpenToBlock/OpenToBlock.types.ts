import type { BlockItems } from '@/lib/person/personView.types';

export type OpenToBlockProps = {
  items: BlockItems['openTo'][];
  className?: string;
};
