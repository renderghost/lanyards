/** The owner's accents: the brand's four (#128). */
export const ACCENTS = ['blue', 'mint', 'lime', 'pink'] as const;

export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_ACCENT: Accent = 'blue';

/** The eight accents before #128, each read as the nearest of the four. */
export const LEGACY_ACCENTS: Readonly<Record<string, Accent>> = {
  violet: 'blue',
  indigo: 'blue',
  ocean: 'blue',
  moss: 'mint',
  teal: 'mint',
  rose: 'pink',
  plum: 'pink',
  ember: 'pink',
};

const isAccent = (value: string): value is Accent =>
  (ACCENTS as readonly string[]).includes(value);

/** A stored accent as one of the four: legacy ones mapped, others blue. */
export function resolveAccent(value: string | undefined): Accent {
  if (value === undefined) return DEFAULT_ACCENT;
  if (isAccent(value)) return value;
  return LEGACY_ACCENTS[value] ?? DEFAULT_ACCENT;
}

/** Switches the active accent palette defined in styles/accents.css. */
export function applyAccent(accent: Accent): void {
  document.documentElement.dataset.accent = accent;
}
