/** Bluesky's stand-in for a handle that no longer verifies. */
const INVALID_HANDLE = 'handle.invalid';

export type OwnPaths = {
  /** How the pages name you: your handle, or your DID. */
  id: string;
  /** Customise: `/<handle>/edit`. */
  edit: string;
  /** View: the public lanyard, `/<handle>`. */
  view: string;
  /** Show QR: `/<handle>/share`. */
  share: string;
};

/**
 * Someone's own pages (#150), by handle; by DID while the handle is
 * unknown or doesn't verify, which every one of them also accepts.
 */
export function ownPaths(did: string, handle?: string): OwnPaths {
  const valid = Boolean(handle) && handle !== INVALID_HANDLE;
  const id = valid ? (handle as string) : did;
  return {
    id,
    edit: `/${id}/edit`,
    view: valid ? `/${id}` : `/d/${did}`,
    share: `/${id}/share`,
  };
}

/**
 * When a link to one of your own pages is the current page: only there.
 * The router otherwise counts /<handle> as current on /<handle>/edit.
 */
export const OWN_PAGE_ACTIVE = { exact: true, includeSearch: false } as const;
