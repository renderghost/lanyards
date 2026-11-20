import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { type OwnPaths, ownPaths } from '@/lib/person/ownPaths';

/** The signed-in person's own pages (#150); null when signed out. */
export function useOwnPaths(): OwnPaths | null {
  const session = useSession();
  const did = session.status === 'signedIn' ? session.session.did : undefined;
  const profile = useProfile(did);
  return did ? ownPaths(did, profile.data?.handle) : null;
}
