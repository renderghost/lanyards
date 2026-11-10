import {
  createAuthorizationUrl,
  deleteStoredSession,
  LoginError,
  finalizeAuthorization,
  getSession,
  OAuthResponseError,
  TokenRefreshError,
} from '@atcute/oauth-browser-client';
import type { Did } from '@atcute/lexicons';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  DidNotFoundError,
  DocumentNotFoundError,
  FailedHandleResolutionError,
} from '@atcute/identity-resolver';

import { track } from '@/lib/analytics/analytics';

import { DID_STORAGE_KEY } from './oauthConfig';
import {
  completeSignIn,
  isUnknownAccountError,
  OAuthCallbackError,
  restoreSession,
  signOut,
  startSignIn,
  startSignUp,
} from './session';

const agentSignOut = vi.fn();

vi.mock('@/lib/analytics/analytics', () => ({
  track: vi.fn(),
  captureError: vi.fn(),
}));

vi.mock('@atcute/oauth-browser-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@atcute/oauth-browser-client')>();
  // Mirrors the real agent's surface: a fetch handler object with signOut.
  class FakeAgent {
    session: unknown;
    signOut = agentSignOut;
    handle = vi.fn();
    constructor(session: unknown) {
      this.session = session;
    }
  }
  return {
    ...actual,
    configureOAuth: vi.fn(),
    createAuthorizationUrl: vi.fn(),
    finalizeAuthorization: vi.fn(),
    getSession: vi.fn(),
    deleteStoredSession: vi.fn(),
    OAuthUserAgent: FakeAgent,
  };
});

const DID = 'did:plc:ewvi7nxzyoun6zhxrhs64oiz' as Did;
const fakeSession = { info: { sub: DID } } as never;
const assign = vi.fn();

beforeEach(() => {
  vi.stubGlobal('location', { ...window.location, assign });
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  // Reset, not just clear: unused one-time results must not leak between tests.
  vi.resetAllMocks();
});

describe('startSignIn', () => {
  it('requests the atproto scope with a safe return path, then redirects', async () => {
    const url = new URL('https://bsky.social/oauth/authorize?x=1');
    vi.mocked(createAuthorizationUrl).mockResolvedValue(url);

    await startSignIn('alice.bsky.social', '//evil');

    expect(createAuthorizationUrl).toHaveBeenCalledWith({
      target: { type: 'account', identifier: 'alice.bsky.social' },
      scope: 'atproto',
      state: { returnTo: '/' },
    });
    expect(assign).toHaveBeenCalledWith(url);
    expect(track).toHaveBeenCalledWith('sign_in_started');
  });
});

describe('isUnknownAccountError', () => {
  it('recognises handles and DIDs that do not exist', () => {
    expect(
      isUnknownAccountError(new DidNotFoundError('alise.bsky.social'))
    ).toBe(true);
    expect(
      isUnknownAccountError(new DocumentNotFoundError('did:plc:abc' as Did))
    ).toBe(true);
  });

  it('treats network failures as system errors', () => {
    expect(
      isUnknownAccountError(
        new FailedHandleResolutionError('alice.bsky.social', {
          cause: new TypeError('Failed to fetch'),
        })
      )
    ).toBe(false);
    expect(isUnknownAccountError(new Error('boom'))).toBe(false);
  });
});

describe('startSignUp', () => {
  it('opens account creation at bsky.social', async () => {
    vi.mocked(createAuthorizationUrl).mockResolvedValue(
      new URL('https://bsky.social/oauth/authorize')
    );
    await startSignUp('/settings');
    expect(createAuthorizationUrl).toHaveBeenCalledWith({
      target: { type: 'pds', serviceUrl: 'https://bsky.social' },
      scope: 'atproto',
      prompt: 'create',
      state: { returnTo: '/settings' },
    });
    expect(track).toHaveBeenCalledWith('sign_up_started');
  });
});

describe('completeSignIn', () => {
  it('reports a cancelled consent as denied', async () => {
    await expect(completeSignIn('#error=access_denied')).rejects.toMatchObject({
      code: 'denied',
    });
    expect(track).toHaveBeenCalledWith('sign_in_failed', { reason: 'denied' });
  });

  it('reports a callback without parameters as missing', async () => {
    await expect(completeSignIn('')).rejects.toMatchObject({ code: 'missing' });
    await expect(completeSignIn('#')).rejects.toMatchObject({
      code: 'missing',
    });
  });

  it('reports a failed token exchange as failed', async () => {
    vi.mocked(finalizeAuthorization).mockRejectedValue(new Error('bad state'));
    const error = await completeSignIn('#code=abc&state=xyz').catch(
      (e: unknown) => e
    );
    expect(error).toBeInstanceOf(OAuthCallbackError);
    expect(error).toMatchObject({ code: 'failed' });
    expect(track).toHaveBeenCalledWith('sign_in_failed', { reason: 'failed' });
  });

  it('reports a replayed or consumed callback as missing', async () => {
    vi.mocked(finalizeAuthorization).mockRejectedValue(
      new LoginError('unknown state provided')
    );
    await expect(completeSignIn('#code=abc&state=used')).rejects.toMatchObject({
      code: 'missing',
    });
    expect(track).toHaveBeenCalledWith('sign_in_failed', { reason: 'missing' });
  });

  it('stores the DID and returns the requested path', async () => {
    vi.mocked(finalizeAuthorization).mockResolvedValue({
      session: fakeSession,
      state: { returnTo: '/settings' },
    });
    await expect(completeSignIn('#code=abc&state=xyz')).resolves.toEqual({
      did: DID,
      returnTo: '/settings',
    });
    expect(localStorage.getItem(DID_STORAGE_KEY)).toBe(DID);
    expect(track).toHaveBeenCalledWith('sign_in_completed');
  });

  it('never returns an unsafe path from the state', async () => {
    vi.mocked(finalizeAuthorization).mockResolvedValue({
      session: fakeSession,
      state: { returnTo: 'https://evil.com' },
    });
    await expect(completeSignIn('#code=abc&state=xyz')).resolves.toEqual({
      did: DID,
      returnTo: '/',
    });
  });
});

describe('restoreSession', () => {
  it('reports none when nobody has signed in', async () => {
    await expect(restoreSession()).resolves.toEqual({ status: 'none' });
    expect(getSession).not.toHaveBeenCalled();
  });

  it('restores a stored session', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession).mockResolvedValue(fakeSession);
    const result = await restoreSession();
    expect(result.status).toBe('restored');
    if (result.status === 'restored') expect(result.session.did).toBe(DID);
  });

  it('clears a revoked session and reports it expired', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession).mockRejectedValue(
      new TokenRefreshError(DID, 'revoked')
    );
    await expect(restoreSession()).resolves.toEqual({ status: 'expired' });
    expect(deleteStoredSession).toHaveBeenCalledWith(DID);
    expect(localStorage.getItem(DID_STORAGE_KEY)).toBeNull();
  });

  it('keeps the session when the refresh fails for network reasons', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession)
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(fakeSession);
    const result = await restoreSession();
    expect(result.status).toBe('restored');
    expect(getSession).toHaveBeenLastCalledWith(DID, { allowStale: true });
    expect(deleteStoredSession).not.toHaveBeenCalled();
    expect(localStorage.getItem(DID_STORAGE_KEY)).toBe(DID);
  });
});

describe('restoreSession resilience', () => {
  const oauthError = (status: number) =>
    new OAuthResponseError(new Response(null, { status }), {
      error: status >= 500 ? 'server_error' : 'invalid_request',
    });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('treats blocked browser storage as signed out', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage is disabled', 'SecurityError');
    });
    await expect(restoreSession()).resolves.toEqual({ status: 'none' });
  });

  it('expires the session on a 4xx refresh error', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession)
      .mockRejectedValueOnce(oauthError(400))
      .mockResolvedValueOnce(fakeSession);
    await expect(restoreSession()).resolves.toEqual({ status: 'expired' });
    expect(getSession).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(DID_STORAGE_KEY)).toBeNull();
  });

  it('keeps the stale session when the server has a 5xx problem', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession)
      .mockRejectedValueOnce(oauthError(503))
      .mockResolvedValueOnce(fakeSession);
    const result = await restoreSession();
    expect(result.status).toBe('restored');
    expect(getSession).toHaveBeenLastCalledWith(DID, { allowStale: true });
  });

  it('stops waiting for a stalled refresh and keeps the stale session', async () => {
    vi.useFakeTimers();
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession)
      .mockReturnValueOnce(new Promise(() => undefined))
      .mockResolvedValueOnce(fakeSession);
    const pending = restoreSession();
    await vi.advanceTimersByTimeAsync(8000);
    const result = await pending;
    expect(result.status).toBe('restored');
    expect(getSession).toHaveBeenLastCalledWith(DID, { allowStale: true });
  });
});

describe('signOut', () => {
  it('falls back to deleting the stored session when revocation fails', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession).mockResolvedValue(fakeSession);
    const restored = await restoreSession();
    if (restored.status !== 'restored') throw new Error('setup failed');
    agentSignOut.mockRejectedValueOnce(new Error('offline'));

    await signOut(restored.session);

    expect(deleteStoredSession).toHaveBeenCalledWith(DID);
    expect(localStorage.getItem(DID_STORAGE_KEY)).toBeNull();
  });

  it('clears the stored DID after a clean sign-out', async () => {
    localStorage.setItem(DID_STORAGE_KEY, DID);
    vi.mocked(getSession).mockResolvedValue(fakeSession);
    const restored = await restoreSession();
    if (restored.status !== 'restored') throw new Error('setup failed');
    agentSignOut.mockResolvedValueOnce(undefined);

    await signOut(restored.session);

    expect(deleteStoredSession).not.toHaveBeenCalled();
    expect(localStorage.getItem(DID_STORAGE_KEY)).toBeNull();
  });
});
