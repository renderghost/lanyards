/** Bluesky's stand-in for a handle that no longer verifies. */
const INVALID_HANDLE = 'handle.invalid';

/**
 * How to name someone in another app's profile URL (Bluesky, Sifa, Tangled,
 * Semble): their handle, or their DID when there's no verified handle. Each
 * of those apps accepts a DID there too.
 */
export function profileId(did: string, handle: string | undefined): string {
  return handle && handle !== INVALID_HANDLE ? handle : did;
}
