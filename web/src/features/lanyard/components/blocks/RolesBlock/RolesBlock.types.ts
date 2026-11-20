import type { SifaPosition } from '@/lib/sources/sifa/sifa.types';

export type RolesBlockProps = {
  /** In the block's order (sortRoles). */
  items: SifaPosition[];
  className?: string;
};
