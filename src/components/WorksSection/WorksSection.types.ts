import { LinkWork } from '@/types';

export interface WorksSectionProps {
  works: LinkWork[];
  onAdd: (doi: string, type: string) => Promise<void>;
  onDelete: (doi: string) => Promise<void>;
}
