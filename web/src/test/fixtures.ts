export const TYPEAHEAD_URL =
  'https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead';

export const ALICE = {
  did: 'did:plc:ewvi7nxzyoun6zhxrhs64oiz',
  handle: 'alice.bsky.social',
  displayName: 'Alice',
  avatar: 'https://cdn.bsky.app/img/avatar/plain/did:plc:alice/bafk@jpeg',
} as const;

/** What the app should request for ALICE's avatar: the small CDN variant. */
export const ALICE_AVATAR_THUMBNAIL =
  'https://cdn.bsky.app/img/avatar_thumbnail/plain/did:plc:alice/bafk@jpeg';

export const ALISON = {
  did: 'did:plc:z72i7hdynmk6r22z27h6tvur',
  handle: 'alison.example.com',
} as const;

export const ALBERT = {
  did: 'did:plc:3jpt2mvvsumj2r7eqk4gzzjz',
  handle: 'albert.bsky.social',
  displayName: 'Albert',
} as const;
