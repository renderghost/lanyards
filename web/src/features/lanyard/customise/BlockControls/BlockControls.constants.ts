/** The most a counted block can show. */
export const MAX_COUNT = 20;

/** "Show N" offers 1 to MAX_COUNT. */
export const LIMIT_OPTIONS = Array.from(
  { length: MAX_COUNT },
  (_, index) => index + 1
);
