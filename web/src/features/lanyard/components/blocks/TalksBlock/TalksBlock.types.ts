import type { BlockItems } from '@/lib/person/personView.types';

export type TalksBlockProps = {
  items: BlockItems['talks'][];
  className?: string;
};
