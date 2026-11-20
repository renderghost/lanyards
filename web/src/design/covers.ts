/** The badge's cover patterns (#129), drawn in the owner's accent. */
export const COVERS = [
  'dots',
  'stripes',
  'pixels',
  'orb',
  'symbols',
  'hazard',
  'arrows',
  'monogram',
] as const;

export type CoverPattern = (typeof COVERS)[number];

export const isCover = (value: unknown): value is CoverPattern =>
  typeof value === 'string' && (COVERS as readonly string[]).includes(value);

/**
 * The cover someone gets until they pick one: the same for them every
 * time, and different from person to person (FNV-1a over the DID).
 */
export function coverFor(did: string): CoverPattern {
  let hash = 0x811c9dc5;
  for (let index = 0; index < did.length; index++) {
    hash ^= did.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return COVERS[hash % COVERS.length]!;
}

const LETTER = /[\p{L}\p{N}]/u;

/** Up to two initials: the first letters of the first and last words. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = (word: string | undefined) =>
    word ? ([...word].find((char) => LETTER.test(char)) ?? '') : '';
  const initials =
    words.length > 1
      ? first(words[0]) + first(words[words.length - 1])
      : first(words[0]);
  return initials.toLocaleUpperCase();
}
