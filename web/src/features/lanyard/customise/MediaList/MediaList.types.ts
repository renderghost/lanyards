import type { MediaLink } from '@/lib/sources/lanyards/lanyards.types';

export type MediaListProps = {
  items: MediaLink[];
  disabled?: boolean;
  className?: string;
};
