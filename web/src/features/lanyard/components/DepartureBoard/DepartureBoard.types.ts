import type { BadgeRole, BoardCell } from '@/lib/person/personView.types';
import type { OpenToValue } from '@/lib/sources/sifa/sifa.types';

export type DepartureBoardProps = {
  role?: BadgeRole;
  location?: string;
  openTo: OpenToValue[];
  /** The Roles block, when it is shown: links "+N more roles" to it. */
  rolesHref?: string;
  /**
   * Sifa hasn't answered yet: the cells the owner shows, whose places the
   * board keeps rather than jump.
   */
  pending?: readonly BoardCell[];
  className?: string;
};
