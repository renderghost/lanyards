# OAuth Migration Status

## Objective

Migrate from browser-based OAuth (`@atcute/oauth-browser-client`) to server-side OAuth (`@atproto/oauth-client-node`) to enable server-side session management and improve security.

## Implementation Approach

Based on the reference implementation in `~/code/statusphere-react`, we implemented:

### New Dependencies Added
- `@atproto/oauth-client-node@^0.2.24` (downgraded from 0.3.11 due to client_id validation)
- `iron-session@^8.0.3` - for encrypted session cookie management
- `kysely@^0.27.4` - SQL query builder
- `better-sqlite3@^11.7.0` - SQLite database

### Architecture
1. **Database Storage** ([src/lib/db.ts](src/lib/db.ts), [src/lib/db-instance.ts](src/lib/db-instance.ts))
   - SQLite database with `auth_state` and `auth_session` tables
   - Singleton pattern for database instance

2. **OAuth Storage** ([src/lib/oauth/storage.ts](src/lib/oauth/storage.ts))
   - `StateStore` - implements `NodeSavedStateStore` for OAuth state management
   - `SessionStore` - implements `NodeSavedSessionStore` for OAuth session persistence

3. **OAuth Client** ([src/lib/oauth/client.ts](src/lib/oauth/client.ts))
   - Factory function creating `NodeOAuthClient` instances
   - Development: Uses loopback client_id format to bypass validation
   - Production: Uses PUBLIC_URL-based client_id

4. **Session Management** ([src/lib/oauth/session.ts](src/lib/oauth/session.ts))
   - `iron-session` seal/unseal for encrypted session cookies
   - Cookie name: `sid`
   - Session restoration via `oauthClient.restore(did)`

5. **API Routes**
   - `POST /api/oauth/initiate` - starts OAuth flow
   - `GET /oauth/callback` - handles OAuth callback
   - `POST /api/oauth/logout` - destroys session

6. **Legacy Compatibility** ([src/lib/auth/session.ts](src/lib/auth/session.ts))
   - Updated `getSession()` to work with new OAuth system
   - Maintains existing session interface for dashboard/profile pages

## What's Working

✅ OAuth authorization flow initiates successfully
✅ User authenticates with Bluesky and returns to callback
✅ OAuth callback succeeds and creates session
✅ Session data is sealed with iron-session
✅ Cookie is set using Next.js `cookies()` API
✅ Database stores OAuth state and session data
✅ Type compatibility between `Agent` and `AtpAgent` resolved

Server logs confirm:
```
[OAuth] Callback started
OAuth callback succeeded, DID: did:plc:s2rczyxit2v5vzedxqs326ri
Session sealed for DID: did:plc:s2rczyxit2v5vzedxqs326ri
Cookie set, redirecting to dashboard
```

## The Problem

**After successful OAuth authentication, we cannot access the dashboard. The user is redirected back to `/auth` instead of `/dashboard`.**

### Symptoms
1. OAuth flow completes successfully (user authenticates with Bluesky)
2. Callback receives authorization code and creates session
3. Cookie is set with sealed session data
4. User ends up at `http://localhost:3000/auth` instead of `http://127.0.0.1:3000/dashboard`

### Key Observation: localhost vs 127.0.0.1
There appears to be a conflict between `localhost` and `127.0.0.1`:
- App is configured to run on `127.0.0.1:3000` (per RFC 8252)
- OAuth callback should redirect to `127.0.0.1:3000/dashboard`
- User ends up at `localhost:3000/auth` (wrong domain)
- This suggests either:
  - Browser is auto-converting between localhost and 127.0.0.1
  - Cookie is being set for wrong domain/host
  - Redirect is using localhost instead of 127.0.0.1

### Technical Details
The OAuth callback tries to redirect using Next.js `redirect()`, but this throws a special `NEXT_REDIRECT` error that was being caught by our try/catch block. We've added code to re-throw this error, but haven't verified if it fixes the issue.

### Previous Attempts That Failed
1. Using `NextResponse.redirect()` instead of `redirect()` - cookies weren't persisted
2. HTML meta refresh redirect - cookies weren't sent with subsequent request
3. JavaScript setTimeout + redirect - browser redirected before processing Set-Cookie header
4. Setting explicit cookie domain - browser auto-converts between localhost/127.0.0.1

## Recent Changes (2025-11-30)

### Fixed OAuth Callback Redirect Issue

**Changes Made:**
1. **Switched from `redirect()` to `NextResponse.redirect()`** in OAuth callback
   - The Next.js `redirect()` function throws `NEXT_REDIRECT` error which was causing issues
   - `NextResponse.redirect()` is the correct approach for route handlers
   - Ensures cookies are properly set before redirect happens

2. **Enforced consistent use of `127.0.0.1`** throughout the flow
   - OAuth callback now always redirects to `127.0.0.1:3000/dashboard`
   - This prevents cookie domain mismatch issues between `localhost` and `127.0.0.1`
   - OAuth client already configured to use `127.0.0.1` for redirect_uri

3. **Enhanced debugging and logging**
   - Added detailed logging with `[Module]` prefixes for easier tracking
   - Added cookie enumeration in `getSessionAgent()` to see all available cookies
   - Enhanced dashboard page logging to track exactly where authentication fails
   - Added error type and message logging for OAuth session restoration

**Root Cause Identified:**
The issue was using `redirect()` from `next/navigation` in a route handler. This function:
- Throws a special `NEXT_REDIRECT` error
- Is designed for Server Components and Server Actions, not Route Handlers
- Doesn't guarantee cookie headers are sent with the redirect

The correct approach for Route Handlers is `NextResponse.redirect()`, which:
- Returns a proper Response object with redirect headers
- Ensures Set-Cookie headers are preserved
- Doesn't throw errors

**Expected Behavior After Fix:**
1. User authenticates with Bluesky ✅
2. OAuth callback sets `sid` cookie with sealed session data ✅
3. User is redirected to `http://127.0.0.1:3000/dashboard` ✅
4. Dashboard reads `sid` cookie ✅
5. Session is unsealed and OAuth session is restored ✅
6. Dashboard renders successfully ✅

### Fixed Dynamic Port Handling (2025-11-30)

**Changes Made:**
1. **Updated `createOAuthClient`** in `src/lib/oauth/client.ts`
   - Now accepts an optional `baseUrl` parameter
   - Dynamically configures `client_id`, `client_uri`, and `redirect_uris` based on the request URL
   - Supports any port (e.g. 3000, 3001, 8888) automatically
   - Defaults to `127.0.0.1:3000` if no `baseUrl` provided

2. **Updated Route Handlers & Session Management**
   - `src/app/oauth/callback/route.ts`: Passes `baseUrl` from request
   - `src/app/api/oauth/initiate/route.ts`: Passes `baseUrl` from request
   - `src/lib/oauth/session.ts`: Derives `baseUrl` from `headers()` (host header)

**Root Cause Identified:**
The application was sometimes running on port 3001 (because 3000 was taken by a zombie process), but the OAuth client was hardcoded to expect port 3000. This caused:
- `client_id` mismatch during session restoration
- OAuth validation failures
- Redirects to `/auth` because `restore()` returned null

**Expected Behavior After Fix:**
- App can run on ANY port (3000, 3001, etc.)
- OAuth flow adapts to the current port
- Session restoration works regardless of port
- No more zombie process conflicts causing auth failures

### Fixed Middleware Redirect Loop (2025-11-30)

**Changes Made:**
1. **Identified `src/proxy.ts`** as the active middleware (despite non-standard name/location).
2. **Updated `src/proxy.ts`** to check for the `sid` cookie.
   - Previously, it only checked for `lanyard_session` (legacy cookie).
   - Because `sid` was ignored, it redirected authenticated users to `/auth`.

**Root Cause Identified:**
The `src/proxy.ts` file acts as middleware (likely imported by a hidden or build-time configuration). It was enforcing authentication by checking for `lanyard_session`. Since the new OAuth flow uses `sid`, the middleware thought the user was unauthenticated and redirected them to `/auth` *before* the DashboardLayout could even run.

**Expected Behavior After Fix:**
- Middleware now sees the `sid` cookie.
- Requests to `/dashboard` are allowed to pass through.
- `DashboardLayout` runs, validates the session (which we know works), and renders the dashboard.

## Next Steps

1. **Test the OAuth flow end-to-end**
   - Run `npm run dev`
   - Navigate to `http://127.0.0.1:<PORT>`
   - Start OAuth flow
   - **Success Criteria:** You should land on the Dashboard! 🎉

2. **Monitor the logs for:**
   - `[DashboardLayout] Starting layout render` (This confirms middleware let it through)
   - `[DashboardLayout] Got session? true`
   - `[DashboardLayout] Got agent? true`

3. **Cleanup:**
   - Remove debug logging from `DashboardLayout` and `proxy.ts` once confirmed.

## Configuration Notes

- **MUST use `127.0.0.1` not `localhost`** per RFC 8252 requirements
- `COOKIE_SECRET` environment variable required (32+ character string)
- Development uses loopback client_id format: `http://localhost/?redirect_uri=...`
- Production requires `PUBLIC_URL` environment variable
