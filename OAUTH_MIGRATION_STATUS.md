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

## Next Steps

1. Test OAuth flow end-to-end with the NEXT_REDIRECT fix
2. If redirect still fails, investigate alternative approaches:
   - Move cookie setting outside try/catch
   - Use different redirect mechanism
   - Examine Next.js App Router redirect patterns for route handlers
3. Remove debug console.log statements once working
4. Update tests

## Configuration Notes

- **MUST use `127.0.0.1` not `localhost`** per RFC 8252 requirements
- `COOKIE_SECRET` environment variable required (32+ character string)
- Development uses loopback client_id format: `http://localhost/?redirect_uri=...`
- Production requires `PUBLIC_URL` environment variable
