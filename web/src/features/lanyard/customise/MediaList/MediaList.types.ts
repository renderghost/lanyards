import type { MediaLink } from '@/lib/sources/lanyards/lanyards.types';

export type MediaListProps = {
  items: MediaLink[];
  disabled?: boolean;
  /** Called when the last item is deleted, to move focus elsewhere. */
  onEmptied?(): void;
  className?: string;
};
