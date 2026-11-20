import { msg } from '@lingui/core/macro';

import type { Accent } from '@/design/accents';
import type { CoverPattern } from '@/design/covers';

/**
 * Lanyards' own badge: lime on brand blue, as the Show QR screen hangs a
 * lime badge (spec §8). Its cover points the way, like an airport sign.
 */
export const ACCENT: Accent = 'lime';

export const COVER: CoverPattern = 'arrows';

/** The departure board: who it's for, what it's built on, how far along. */
export const BOARD = [
  { label: msg`For`, value: msg`Academic researchers` },
  { label: msg`Built on`, value: msg`AT Protocol` },
  { label: msg`Status`, value: msg`Beta` },
] as const;
