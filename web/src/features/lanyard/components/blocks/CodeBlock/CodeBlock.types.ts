import type { BlockItems } from '@/lib/person/personView.types';

export type CodeBlockProps = {
  items: BlockItems['code'][];
  className?: string;
};
