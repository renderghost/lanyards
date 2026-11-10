import { Client, simpleFetchHandler } from '@atcute/client';
import type { Did } from '@atcute/lexicons';
import type { OAuthUserAgent } from '@atcute/oauth-browser-client';

import type { SessionHandle } from './session';

/**
 * End-to-end tests only: a signed-in session seeded through localStorage,
 * talking to mocked hosts. session.ts reaches this only when the build has
 * VITE_E2E=true, so production bundles never contain it (CI checks).
 */
const KEY = 'lanyards:e2e-session';
const PDS = 'https://pds.e2e.test';
const APPVIEW = 'https://appview.e2e.test';

export function readE2eSession(): SessionHandle | null {
  let seeded: { did?: unknown; scope?: unknown } | null;
  try {
    seeded = JSON.parse(localStorage.getItem(KEY) ?? 'null') as typeof seeded;
  } catch {
    return null;
  }
  if (typeof seeded?.did !== 'string' || typeof seeded.scope !== 'string') {
    return null;
  }
  const agent = {
    signOut: async () => {
      localStorage.removeItem(KEY);
    },
  } as unknown as OAuthUserAgent;
  return {
    did: seeded.did as Did,
    scope: seeded.scope,
    agent,
    rpc: new Client({ handler: simpleFetchHandler({ service: PDS }) }),
    appview: new Client({ handler: simpleFetchHandler({ service: APPVIEW }) }),
  };
}
