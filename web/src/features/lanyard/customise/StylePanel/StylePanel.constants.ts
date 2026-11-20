/** The accordion's sections, by id. */
export const SECTIONS = {
  accent: 'accent',
  cover: 'cover',
  badge: 'badge',
} as const;

/** The badge's switches: what its departure board shows (#129). */
export const BADGE_SETTINGS = [
  'showRole',
  'showLocation',
  'showOpenTo',
] as const;

/** Accent colour starts open: it's the setting people change most. */
export const OPEN_AT_FIRST = [SECTIONS.accent];
