import type { BlockItems } from '@/lib/person/personView.types';

export type SkillsBlockProps = {
  items: BlockItems['skills'][];
  className?: string;
};
