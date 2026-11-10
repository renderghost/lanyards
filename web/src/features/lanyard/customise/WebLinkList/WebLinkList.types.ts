import type { WebLink } from '@/lib/sources/lanyards/lanyards.types';

export type WebLinkListProps = {
  links: WebLink[];
  disabled?: boolean;
  className?: string;
};
