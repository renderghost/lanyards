/** Services Lanyards reads from, and their limits. */

/** Bluesky's public AppView: unauthenticated reads with CORS enabled. */
export const PUBLIC_APPVIEW = 'https://public.api.bsky.app';

/** Service proxy target for authenticated AppView reads through the PDS. */
export const BSKY_APPVIEW_AUD = 'did:web:api.bsky.app#bsky_appview';

/** Sifa's AppView (the documented api.sifa.id host does not resolve). */
export const SIFA_APPVIEW = 'https://sifa.id';

export const TANGLED_APPVIEW = 'https://api.tangled.org';

export const ORCID_API = 'https://pub.orcid.org/v3.0';

/** The permanent public origin, used in links people copy elsewhere. */
export const CANONICAL_ORIGIN = 'https://lanyards.app';

/** Every browser read from a source gives up after this long. */
export const REQUEST_TIMEOUT_MS = 10_000;
