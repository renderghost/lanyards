import { Client } from '@atcute/client';
import {
  AmbiguousHandleError,
  DidNotFoundError,
  DocumentNotFoundError,
  ImproperDidError,
  InvalidResolvedHandleError,
  UnsupportedDidMethodError,
} from '@atcute/identity-resolver';
import type { ActorIdentifier, Did } from '@atcute/lexicons';
import {
  configureOAuth,
  createAuthorizationUrl,
  deleteStoredSession,
  finalizeAuthorization,
  getSession,
  LoginError,
  OAuthResponseError,
  OAuthUserAgent,
} from '@atcute/oauth-browser-client';

import { track } from '@/lib/analytics/analytics';

import { BSKY_APPVIEW_AUD } from './endpoints';
import { identityResolver } from './identity';
import {
  DID_STORAGE_KEY,
  FALLBACK_SCOPE,
  GRANULAR_SCOPE,
  safeReturnTo,
  SIGN_UP_PDS,
} from './oauthConfig';

/** Where to send someone who has to start signing in again. */
const RETURN_TO_KEY = 'lanyards:returnTo';

function rememberReturnTo(path: string): void {
  try {
    sessionStorage.setItem(RETURN_TO_KEY, path);
  } catch {
    // Storage blocked: "Try again" falls back to the landing page.
  }
}

/** The safe path sign-in started from, for "Try again" after a failure. */
export function recallReturnTo(): string {
  try {
    return safeReturnTo(sessionStorage.getItem(RETURN_TO_KEY));
  } catch {
    return '/';
  }
}

/** Give the browser time to persist OAuth state before navigating away. */
const REDIRECT_DELAY_MS = 200;

/** A token refresh slower than this falls back to the stored session. */
const RESTORE_TIMEOUT_MS = 8000;

class RestoreTimeoutError extends Error {
  override name = 'RestoreTimeoutError';
}

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
  /** Calls the user's own PDS. */
  rpc: Client;
  /** Calls the Bluesky AppView through the user's PDS (service proxy). */
  appview: Client;
  /** The scope the authorisation server actually granted. */
  scope: string;
};

export type RestoreResult =
  | { status: 'none' }
  | { status: 'restored'; session: SessionHandle }
  | { status: 'expired' };

type SignInState = { returnTo: string };

const UNKNOWN_ACCOUNT_ERRORS = [
  DidNotFoundError,
  InvalidResolvedHandleError,
  AmbiguousHandleError,
  DocumentNotFoundError,
  UnsupportedDidMethodError,
  ImproperDidError,
];

/**
 * True when sign-in could not start because the handle or DID does not
 * exist (usually a typo), as opposed to a network or server failure.
 */
export function isUnknownAccountError(error: unknown): boolean {
  return UNKNOWN_ACCOUNT_ERRORS.some((type) => error instanceof type);
}

// atcute signals a consumed or unknown OAuth state only through its message.
const REPLAYED_CALLBACK = /unknown state|missing parameters/i;

export function configureAuth(): void {
  configureOAuth({
    metadata: {
      client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
    },
    identityResolver,
  });
}

type AuthorizationOptions = Omit<
  Parameters<typeof createAuthorizationUrl>[0],
  'scope'
>;

/**
 * Requests the granular scopes, falling back once to transition:generic
 * when the authorisation server refuses them (for example a PDS without
 * permission-set support, or a permission set it cannot resolve yet).
 */
async function authorizationUrl(options: AuthorizationOptions): Promise<URL> {
  try {
    return await createAuthorizationUrl({ ...options, scope: GRANULAR_SCOPE });
  } catch (error) {
    if (!(error instanceof OAuthResponseError)) throw error;
    if (error.error !== 'invalid_scope') throw error;
    track('oauth_scope_fallback');
    return createAuthorizationUrl({ ...options, scope: FALLBACK_SCOPE });
  }
}

export async function startSignIn(
  identifier: string,
  returnTo: string
): Promise<void> {
  const state: SignInState = { returnTo: safeReturnTo(returnTo) };
  rememberReturnTo(state.returnTo);
  const url = await authorizationUrl({
    target: { type: 'account', identifier: identifier as ActorIdentifier },
    state,
  });
  track('sign_in_started');
  await redirect(url);
}

export async function startSignUp(returnTo: string): Promise<void> {
  const state: SignInState = { returnTo: safeReturnTo(returnTo) };
  rememberReturnTo(state.returnTo);
  const url = await authorizationUrl({
    target: { type: 'pds', serviceUrl: SIGN_UP_PDS },
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
    // A bookmarked, reloaded or reused callback URL: its state was consumed.
    const replayed =
      cause instanceof LoginError && REPLAYED_CALLBACK.test(cause.message);
    throw new OAuthCallbackError(replayed ? 'missing' : 'failed', { cause });
  }

  const did = result.session.info.sub;
  localStorage.setItem(DID_STORAGE_KEY, did);
  const state = result.state as Partial<SignInState> | null;
  return { did, returnTo: safeReturnTo(state?.returnTo) };
}

/**
 * Restores the signed-in account, refreshing its tokens when needed.
 *
 * Only failures that say nothing about the grant itself (offline, network
 * errors, a 5xx, or a refresh slower than RESTORE_TIMEOUT_MS) keep the stored
 * session, so the app works without signal and refreshes on the next
 * request. A revoked grant or any other refusal expires it. Blocked browser
 * storage reads as signed out.
 */
export async function restoreSession(): Promise<RestoreResult> {
  const stored = readStoredDid();
  if (!stored) return { status: 'none' };
  const did = stored as Did;

  try {
    const fresh = await withTimeout(getSession(did), RESTORE_TIMEOUT_MS);
    return { status: 'restored', session: toHandle(did, fresh) };
  } catch (error) {
    if (isTransient(error)) {
      try {
        const stale = await getSession(did, { allowStale: true });
        return { status: 'restored', session: toHandle(did, stale) };
      } catch {
        // The stored record is unusable too; treat as expired below.
      }
    }
    forget(did);
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

function readStoredDid(): string | null {
  try {
    return localStorage.getItem(DID_STORAGE_KEY);
  } catch {
    // Storage disabled (e.g. strict privacy settings): nobody is signed in.
    return null;
  }
}

function forget(did: Did): void {
  deleteStoredSession(did);
  try {
    localStorage.removeItem(DID_STORAGE_KEY);
  } catch {
    // Nothing stored that we could remove.
  }
}

const isTransient = (error: unknown) =>
  error instanceof TypeError ||
  error instanceof RestoreTimeoutError ||
  (error instanceof OAuthResponseError && error.status >= 500);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new RestoreTimeoutError()), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function toHandle(
  did: Did,
  session: Awaited<ReturnType<typeof getSession>>
): SessionHandle {
  const agent = new OAuthUserAgent(session);
  return {
    did,
    agent,
    rpc: new Client({ handler: agent }),
    appview: new Client({ handler: agent, proxy: BSKY_APPVIEW_AUD }),
    scope: session.token.scope,
  };
}

async function redirect(url: URL): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, REDIRECT_DELAY_MS));
  window.location.assign(url);
}
