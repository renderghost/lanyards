import type { BadgeRole } from '@/lib/person/personView.types';
import type { OpenToValue } from '@/lib/sources/sifa/sifa.types';

export type DepartureBoardProps = {
  role?: BadgeRole;
  location?: string;
  openTo: OpenToValue[];
  /** The Roles block, when it is shown: links "+N more roles" to it. */
  rolesHref?: string;
  className?: string;
};
