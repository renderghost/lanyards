import type { Did } from '@atcute/lexicons';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { handleQuery } from '@/lib/person/personQueries';
import type { SourceState } from '@/lib/person/personView.types';
import { toSourceState } from '@/lib/person/sourceQuery';

/**
 * Resolves a handle to a DID through the Bluesky profile, and seeds the
 * profile query for that DID so the lanyard doesn't fetch it again.
 */
export function useResolveHandle(handle: string): {
  state: SourceState<Did>;
  retry(): void;
} {
  const queryClient = useQueryClient();
  const query = useQuery(handleQuery(queryClient, handle));
  return {
    state: toSourceState(query, true) ?? { status: 'loading' },
    retry: () => {
      void query.refetch();
    },
  };
}
