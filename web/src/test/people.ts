import type { Did } from '@atcute/lexicons';

/**
 * Synthetic people used by source fixtures. Fixtures are captured from real
 * public records and then anonymised to these identities.
 */
export const ADA = {
  did: 'did:plc:fixturealiceaaaaaaaaaaaa' as Did,
  handle: 'alice.test',
  displayName: 'Ada Example',
  pds: 'https://pds.ada.test',
} as const;

export const BEA = {
  did: 'did:plc:fixturebeaaaaaaaaaaaaaaa' as Did,
  handle: 'bea.test',
  displayName: 'Bea Example',
} as const;

export const CAL = {
  did: 'did:plc:fixturecalaaaaaaaaaaaaaa' as Did,
  handle: 'cal.test',
  displayName: 'Cal Example',
} as const;
