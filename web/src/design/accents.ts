export const ACCENTS = [
  'violet',
  'indigo',
  'plum',
  'rose',
  'ember',
  'moss',
  'teal',
  'ocean',
] as const;

export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = 'violet';

/** Switches the active accent palette defined in styles/accents.css. */
export function applyAccent(accent: Accent): void {
  document.documentElement.dataset.accent = accent;
}
