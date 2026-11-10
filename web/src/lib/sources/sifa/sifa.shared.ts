import type { Did } from '@atcute/lexicons';

import { OPEN_TO_VALUES, type OpenToValue, type SifaTalk } from './sifa.types';

const DEFS_TOKEN = /^id\.sifa\.defs#/;
const PLATFORM_TOKEN = /^id\.sifa\.defs#platform/i;

export const sifaUri = (did: Did, collection: string, rkey: string) =>
  `at://${did}/id.sifa.profile.${collection}/${rkey}`;

/** Removes the `id.sifa.defs#` prefix from a token, if present. */
export const stripDefsToken = (value: string) => value.replace(DEFS_TOKEN, '');

/**
 * Sifa's records store platforms as bare strings ('orcid', 'GitHub'), while
 * its lexicon defines tokens ('id.sifa.defs#platformOrcid'). Both become
 * bare lower-case names.
 */
export const normalisePlatform = (value: string) =>
  value.replace(PLATFORM_TOKEN, '').toLowerCase();

export const toOpenTo = (values: readonly string[] | undefined) =>
  (values ?? [])
    .map(stripDefsToken)
    .filter((value): value is OpenToValue =>
      (OPEN_TO_VALUES as readonly string[]).includes(value)
    );

/** Newest first; undated talks last. */
export const byDateDescending = (a: SifaTalk, b: SifaTalk) =>
  (b.date ?? '').localeCompare(a.date ?? '');

/** Copies only the defined optional fields, so results compare cleanly. */
export function defined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as T;
}
