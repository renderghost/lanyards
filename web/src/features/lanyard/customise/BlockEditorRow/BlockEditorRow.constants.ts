import { MAX_LINKS } from '@/lib/person/config';

/** "Items to show" offers 1 to 20, the most a block can show. */
export const LIMIT_OPTIONS = Array.from(
  { length: MAX_LINKS },
  (_, index) => index + 1
);
