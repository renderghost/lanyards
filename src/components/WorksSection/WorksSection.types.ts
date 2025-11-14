import { Work } from '@/types';

export interface WorksSectionProps {
  works: Work[];
  onAdd: (doi: string, type: string) => Promise<void>;
  onDelete: (doi: string) => Promise<void>;
}
