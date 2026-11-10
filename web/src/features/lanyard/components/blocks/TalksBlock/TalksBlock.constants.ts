import { msg } from '@lingui/core/macro';

/** Sifa presentation roles, without the id.sifa.defs# prefix. */
export const ROLE_LABELS: Record<string, ReturnType<typeof msg>> = {
  presenter: msg`Speaker`,
  keynote: msg`Keynote`,
  panelist: msg`Panellist`,
  workshop: msg`Workshop`,
  host: msg`Host`,
};
