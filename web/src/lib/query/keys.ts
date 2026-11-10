import type { SourceKey } from '@/lib/person/personView.types';

/** Query keys shared by every hook that reads or updates the same data. */
export const queryKeys = {
  source: (key: SourceKey, subject: string, ...extra: string[]) =>
    ['source', key, subject, ...extra] as const,
  relationship: (viewer: string, subject: string) =>
    ['relationship', viewer, subject] as const,
  knownFollowers: (viewer: string, subject: string) =>
    ['knownFollowers', viewer, subject] as const,
};
