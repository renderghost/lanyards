import { MAX_LINKS } from '@/lib/person/config';

/** "Items to show" (for counted blocks) offers 1 to 20. */
export const LIMIT_OPTIONS = Array.from(
  { length: MAX_LINKS },
  (_, index) => index + 1
);
