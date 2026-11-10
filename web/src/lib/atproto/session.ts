import { Client } from '@atcute/client';
import type { ActorIdentifier, Did } from '@atcute/lexicons';
import {
  configureOAuth,
  createAuthorizationUrl,
  deleteStoredSession,
  finalizeAuthorization,
  getSession,
  OAuthUserAgent,
  TokenRefreshError,
} from '@atcute/oauth-browser-client';

import { track } from '@/lib/analytics/analytics';

import { identityResolver } from './identity';
import {
  DID_STORAGE_KEY,
  OAUTH_SCOPE,
  safeReturnTo,
  SIGN_UP_PDS,
} from './oauthConfig';

/** Give the browser time to persist OAuth state before navigating away. */
const REDIRECT_DELAY_MS = 200;

export type OAuthCallbackErrorCode = 'denied' | 'missing' | 'failed';

export class OAuthCallbackError extends Error {
  readonly code: OAuthCallbackErrorCode;

  constructor(code: OAuthCallbackErrorCode, options?: { cause?: unknown }) {
    super(`OAuth callback failed: ${code}`, options);
    this.name = 'OAuthCallbackError';
    this.code = code;
  }
}

export type SessionHandle = {
  did: Did;
  agent: OAuthUserAgent;
  rpc: Client;
};

export type RestoreResult =
  | { status: 'none' }
  | { status: 'restored'; session: SessionHandle }
  | { status: 'expired' };

type SignInState = { returnTo: string };

export function configureAuth(): void {
  configureOAuth({
    metadata: {
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    },
    identityResolver,
  });
}

export async function startSignIn(
  identifier: string,
  returnTo: string
): Promise<void> {
  const state: SignInState = { returnTo: safeReturnTo(returnTo) };
  const url = await createAuthorizationUrl({
    target: { type: 'account', identifier: identifier as ActorIdentifier },
    scope: OAUTH_SCOPE,
    state,
  });
  track('sign_in_started');
  await redirect(url);
}

export async function startSignUp(returnTo: string): Promise<void> {
  const state: SignInState = { returnTo: safeReturnTo(returnTo) };
  const url = await createAuthorizationUrl({
    target: { type: 'pds', serviceUrl: SIGN_UP_PDS },
    scope: OAUTH_SCOPE,
    prompt: 'create',
    state,
  });
  track('sign_up_started');
  await redirect(url);
}

/** Finishes sign-in from the callback URL's hash fragment. */
export async function completeSignIn(
  hash: string
): Promise<{ did: Did; returnTo: string }> {
  try {
    const result = await finishSignIn(hash);
    track('sign_in_completed');
    return result;
  } catch (error) {
    if (error instanceof OAuthCallbackError) {
      track('sign_in_failed', { reason: error.code });
    }
    throw error;
  }
}

async function finishSignIn(
  hash: string
): Promise<{ did: Did; returnTo: string }> {
  const params = new URLSearchParams(hash.replace(/^#/, ''));

  if (params.has('error')) {
    throw new OAuthCallbackError(
      params.get('error') === 'access_denied' ? 'denied' : 'failed'
    );
  }
  if (!params.has('code') && !params.has('state')) {
    throw new OAuthCallbackError('missing');
  }

  let result: Awaited<ReturnType<typeof finalizeAuthorization>>;
  try {
    result = await finalizeAuthorization(params);
  } catch (cause) {
    throw new OAuthCallbackError('failed', { cause });
  }

  const did = result.session.info.sub;
  localStorage.setItem(DID_STORAGE_KEY, did);
  const state = result.state as Partial<SignInState> | null;
  return { did, returnTo: safeReturnTo(state?.returnTo) };
}

/**
 * Restores the signed-in account, refreshing its tokens when needed. Only a
 * revoked or deleted grant counts as expired: when the refresh fails for any
 * other reason (offline, network), the stored session is kept so the app
 * still works without signal and refreshes on the next request.
 */
export async function restoreSession(): Promise<RestoreResult> {
  const stored = localStorage.getItem(DID_STORAGE_KEY);
  if (!stored) return { status: 'none' };
  const did = stored as Did;

  try {
    return {
      status: 'restored',
      session: toHandle(did, await getSession(did)),
    };
  } catch (error) {
    if (!(error instanceof TokenRefreshError)) {
      try {
        const stale = await getSession(did, { allowStale: true });
        return { status: 'restored', session: toHandle(did, stale) };
      } catch {
        // The stored record is unusable too; treat as expired below.
      }
    }
    deleteStoredSession(did);
    localStorage.removeItem(DID_STORAGE_KEY);
    return { status: 'expired' };
  }
}

/** Revokes the session; falls back to forgetting it locally if offline. */
export async function signOut(session: SessionHandle): Promise<void> {
  try {
    await session.agent.signOut();
  } catch {
    deleteStoredSession(session.did);
  } finally {
    localStorage.removeItem(DID_STORAGE_KEY);
  }
}

function toHandle(
  did: Did,
  session: Awaited<ReturnType<typeof getSession>>
): SessionHandle {
  const agent = new OAuthUserAgent(session);
  return { did, agent, rpc: new Client({ handler: agent }) };
}

async function redirect(url: URL): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, REDIRECT_DELAY_MS));
  window.location.assign(url);
}
