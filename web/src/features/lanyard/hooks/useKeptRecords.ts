import type { Did } from '@atcute/lexicons';
import { useQuery } from '@tanstack/react-query';

import { sourceQueryOptions } from '@/lib/person/sourceQuery';
import { queryKeys } from '@/lib/query/keys';
import { fetchLanyardRecords } from '@/lib/sources/lanyards/lanyards';

/** The owner's kept records (honorific, web links, media), as the lanyard reads them. */
export function useKeptRecords(did: Did) {
  return useQuery({
    queryKey: queryKeys.source('lanyards', did),
    ...sourceQueryOptions('lanyards', (signal) =>
      fetchLanyardRecords(did, signal)
    ),
  });
}

/** The last segment of an AT-URI: its record key. */
export const rkeyOf = (uri: string): string => uri.split('/').pop() ?? '';
