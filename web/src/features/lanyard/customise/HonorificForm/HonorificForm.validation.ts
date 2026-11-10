import { type Honorific, HONORIFICS } from './HonorificForm.constants';

/** Only the kept lexicon's three values can be saved. */
export function isHonorific(value: string): value is Honorific {
  return (HONORIFICS as string[]).includes(value);
}
