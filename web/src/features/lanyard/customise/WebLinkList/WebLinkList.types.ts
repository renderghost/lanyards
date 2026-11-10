import type { WebLink } from '@/lib/sources/lanyards/lanyards.types';

export type WebLinkListProps = {
  links: WebLink[];
  disabled?: boolean;
  /** Called when the last item is deleted, to move focus elsewhere. */
  onEmptied?(): void;
  className?: string;
};
