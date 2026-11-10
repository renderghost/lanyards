# Slice 1b: The Lanyard — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every AT Protocol account a public, shareable lanyard at `/@:handle` and `/d/:did`, with person-specific link previews. Signed-in owners can customise it, add kept records, and show a QR code. All of it is built from data people already have on Bluesky, Sifa, standard.site, ORCID, Tangled and Semble.

**Architecture:**
- **Sources:** one adapter per source in `web/src/lib/sources/<name>/`. Each returns a `Result` and never imports another adapter. A pure composer in `web/src/lib/person/` merges them into a badge hero and ordered blocks, applying the owner's `app.lanyards.actor.lanyard` config.
- **Data loading:** TanStack Query runs one query per source, so a slow or failed source never blocks the page.
- **Writes:** writes go through one typed helper. Each is validated against the pinned lexicon and checked against the session's *granted* scope.
- **Link previews:** two Vercel Node.js functions, `web/api/meta.ts` and `web/api/og.tsx`, inject Open Graph tags and render badge images. They share code only with `web/server/`.

**Delivery:** one plan, two PRs on `claude/lanyards-rebuild-attendee-ux-vcl1sb`, both closing into #102:
- **PR 1, "Public lanyard":** Tasks 1–15. It covers lexicons, scopes, adapters, PersonView, the public pages, Follow and link previews.
- **PR 2, "Customise, QR and ORCID":** Tasks 16–21, started after PR 1 merges.

**Tech Stack:**
- **Existing (Slice 1a):** Vite 8, React 19, TypeScript `~6.0.3`, TanStack Router and Query, Tailwind v4, Lingui 6, `@atcute/*`.
- **New:**
  - lexicon tooling: `@atcute/lex-cli`, `@atcute/lexicon-doc`, `@atcute/lexicon-resolver`
  - atcute: `@atcute/atproto`, `@atcute/tid`, `@atcute/bluesky-richtext-segmenter`
  - UI: `lean-qr`, `lucide-react`, `simple-icons`, `radix-ui`, `@dnd-kit/*`
  - link previews: `satori`, `@resvg/resvg-wasm` and `@fontsource/dm-sans`

**Spec:** `docs/superpowers/specs/2026-11-10-attendee-ux-design.md`, sections §3, §7, §10, §12, §13, §14, §15, §16 and §17 Slice 1. The spec was corrected during this planning round, and the correction ships in the same commit as this plan.

**Issue:** #102 (parent #95, epic #94).

## Planning decisions (2026-11-10)

These were settled before writing the plan. Executors don't revisit them.

| Topic | Decision |
|---|---|
| Lexicon account | `lanyards.app` = `did:plc:ua3d6biqepazbq6mw4ysotfo` (the brand account). The owner publishes with `goat lex publish` |
| Honorific | The schema stays as it is today (closed enum `none`, `Dr`, `Prof`). The form offers None, Dr and Prof |
| Sifa fallback | The PDS `listRecords` fallback runs when the Sifa view *fails* (network, timeout, 429, 5xx, invalid body). `ProfileNotFound` means "no Sifa profile" and triggers no fallback. The fallback may show items hidden on Sifa; the owner has accepted this |
| Web-link NSID | `app.lanyards.link.web` (what the legacy app writes), not `link.web.web` |
| Tangled | `org.tangled.repo.*`, read through the Tangled AppView, with a PDS declaration fallback |
| Delivery | One plan, two PRs |
| Hero headline | Sifa `headline`, else the first paragraph of the Bluesky bio, truncated to 200 graphemes. The spec doesn't specify this |
| Third-party images | Only `cdn.bsky.app` images (avatars, Bluesky link icons). No Semble, standard.site or Sifa cover images, which would leak visitors' IP addresses to arbitrary hosts |
| Offline persistence | Not in this slice. The query cache persister arrives with Slice 2's "download for offline". The QR works offline because it's generated locally |
| `events` block | Present in the lexicon, but never rendered until Slice 2 adds the `calendar` adapter |

## Global Constraints

- **Location:**
  - all code lives under `web/`
  - outside `web/`, this plan edits only `.github/workflows/web-ci.yml` and `docs/`
  - the legacy root `lexicons/` and `src/` are untouched
- **Toolchain:** as in Slice 1a: npm, Node 22, TypeScript `~6.0.3`.
- **New dependencies:** all verified on 2026-11-10, and each version is at least two weeks old.
  - runtime: `@atcute/atproto@^4.0.4`, `@atcute/tid@^1.1.4`, `@atcute/bluesky-richtext-segmenter@^3.0.2`, `lean-qr@^2.7.4`, `radix-ui@^1.8.1`, `@dnd-kit/core@^6.3.1`, `@dnd-kit/sortable@^10.0.0`, `@dnd-kit/utilities@^3.2.2`
  - runtime, exact pins (their newest releases are under two weeks old): `lucide-react@1.61.0`, `simple-icons@16.36.0`
  - functions, exact pins (satori moves fast): `satori@0.63.2`, `@resvg/resvg-wasm@2.6.2`; plus `@fontsource/dm-sans@^5.3.0` for static TTF/WOFF2 weights (variable fonts render only their default instance in satori)
  - dev: `@atcute/lex-cli@^3.3.0`, `@atcute/lexicon-doc@^3.1.0`, `@atcute/lexicon-resolver@^1.0.2`
  - do **not** use `@vercel/og`: 1.0.2 and 1.0.3 crash in plain Node functions
- **Endpoints:** each is a constant in `web/src/lib/atproto/endpoints.ts`.
  - `PUBLIC_APPVIEW = 'https://public.api.bsky.app'` (moved from `identity.ts`, which re-exports it)
  - `BSKY_APPVIEW_AUD = 'did:web:api.bsky.app#bsky_appview'`
  - `SIFA_APPVIEW = 'https://sifa.id'`
  - `TANGLED_APPVIEW = 'https://api.tangled.org'`
  - `ORCID_API = 'https://pub.orcid.org/v3.0'`
  - `CANONICAL_ORIGIN = 'https://lanyards.app'`
- **Timeouts:** each browser source request aborts after `REQUEST_TIMEOUT_MS = 10_000`. The functions' upstream requests abort after `UPSTREAM_TIMEOUT_MS = 1500`.
- **Lexicons:**
  - **NSIDs:** `app.lanyards.actor.lanyard`, `app.lanyards.actor.biography.honorific`, `app.lanyards.link.web`, `app.lanyards.link.media.audio`, `app.lanyards.link.media.video`, and the permission set `app.lanyards.authFull`.
  - **Publishing:** they are published from `did:plc:ua3d6biqepazbq6mw4ysotfo`.
  - **DNS TXT records** (each `did=did:plc:ua3d6biqepazbq6mw4ysotfo`): `_lexicon.lanyards.app`, `_lexicon.actor.lanyards.app`, `_lexicon.biography.actor.lanyards.app`, `_lexicon.link.lanyards.app` and `_lexicon.media.link.lanyards.app`.
- **OAuth scopes:** these exact strings, in this order, joined with single spaces. Requested scopes must match the client metadata byte for byte.
  1. `atproto`
  2. `include:app.lanyards.authFull`
  3. `repo:app.bsky.graph.follow?action=create&action=delete`
  4. `rpc?lxm=app.bsky.actor.getPreferences&lxm=app.bsky.graph.getBlocks&lxm=app.bsky.graph.getKnownFollowers&lxm=app.bsky.graph.getMutes&lxm=app.bsky.graph.getRelationships&aud=did:web:api.bsky.app%23bsky_appview`
  - **Fallback:** `atproto transition:generic`.
  - **Client metadata:** its `scope` (and the loopback `client_id`'s `scope`) is the granular list followed by `transition:generic`.
- **Copy:**
  - British English, through Lingui; no hard-coded strings
  - copy quoted in this plan is exact
  - plurals use Lingui `plural`
- **Components and styling:** as in Slice 1a:
  - the 4-file structure; forms add `X.validation.ts`
  - Tailwind only: no inline styles and no margin utilities
  - `leading-*` on all text, and `cn()` for conditional classes
- **Safe rendering:**
  - record text renders as text, with Bluesky facets through `RichText`; never `dangerouslySetInnerHTML`
  - every rendered URL goes through `safeHref()` (allowed schemes: `https`, `http`, `mailto`)
  - external links use `target="_blank" rel="noopener noreferrer"` and visually hidden "(opens in a new tab)"
  - the functions HTML-escape every injected value
- **Accessibility:**
  - WCAG 2.2 AA (AAA where feasible); 7:1 for body text and essential UI, in every accent and in light and dark
  - touch targets ≥ 44×44 px; QR controls ≥ 56 px tall
  - live regions for save, follow and check results; focus is managed in sheets
  - `motion-safe:` for transitions; layouts hold at 320 px and 200% zoom
- **Privacy:**
  - analytics and error reports carry no DIDs, handles, names or URLs
  - `captureError(error, { source })` names the source
- **Test fixtures:**
  - captured from real public records, then anonymised: every DID, handle, name and free-text value is replaced with a synthetic one (e.g. `did:plc:fixturealice000000000000`, `alice.test`, "Ada Example")
  - structure, field presence, `null`s and value formats are kept exactly as captured
  - saved under `web/src/test/fixtures/sources/<source>/`
- **Budget:** initial JS for the public lanyard route (entry plus the `/@{$handle}` route chunks) ≤ **204800** bytes gzipped.
- **Functions (`web/api`, `web/server`):**
  - Node.js runtime
  - no `@/` imports and no `import.meta.env`; relative imports carry `.ts`/`.tsx` extensions
  - `web/tsconfig.json` sets `"rewriteRelativeImportExtensions": true` and includes `api` and `server`
- **Commits:** `<type>: <description> (#102)`, authored as the repository owner (CLAUDE.md), with Claude's `Co-Authored-By` and session trailers. Each commit passes `npm run lint`, `typecheck` and `test`.
- **Playwright:** always `--trace off`; set `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium` here.

## Review Focus

These behaviours are implied by the spec but are easy to miss. Each is pinned by a test in the task named.

1. **Sessions without write permission.** Slice 1a sessions were granted only `atproto`, and some PDSes drop or refuse granular scopes.
   - Lanyards never attempts a write it lacks permission for. It shows the permission notice instead.
   - Follow never creates a duplicate follow when the relationship is unknown.
   - *(Tasks 3, 13)*
2. **Hostile or odd record content.** Examples: `<script>` or `"><img onerror>` in a display name, headline or title; `javascript:` URLs; titles of 5,000 characters.
   - They render as inert text, and disallowed URLs are dropped.
   - Long text is clamped visually without breaking layout at 320 px.
   - The functions escape everything.
   - *(Tasks 10, 12, 14)*
3. **Handle URL variants.** `/@Alice.Bsky.Social` redirects to lowercase. `/%40alice.test` and `/@alice.test/` resolve. `/@did:plc:…` redirects to `/d/did:plc:…`. An unresolvable handle shows "We couldn't find @handle" with search. *(Task 11)*
4. **Partial outages.**
   - When Sifa returns 500, the PDS fallback kicks in.
   - ORCID 503, a Tangled timeout or a malformed record each affect only their own block: hidden for visitors, "Couldn't load … · Retry" for owners.
   - The badge hero renders as soon as the Bluesky profile arrives.
   - *(Tasks 6, 7, 8, 10, 12)*
5. **Opt-outs and blocks.**
   - A profile labelled `!no-unauthenticated` shows signed-out visitors only an opt-out notice. Its link preview carries no name, avatar or headline.
   - A block in either direction shows a minimal page with no actions.
   - *(Tasks 11, 14)*

---

## PR 1: Public lanyard

### Task 1: Lexicons, code generation and record validation

**Files:**
- Create: `web/lexicons/lanyards/app/lanyards/` with:
  - `authFull.json`
  - `actor/lanyard.json`, `actor/biography/honorific.json`
  - `link/web.json`, `link/media/audio.json`, `link/media/video.json`
- Create: `web/lex.config.ts`, `web/lexicons/vendor/**` (pulled, committed), `web/src/lexicons/**` (generated, committed), `web/src/lib/lexicons/nsids.ts`, `web/src/lib/lexicons/validate.ts`
- Modify:
  - `web/package.json`: add the scripts `lex:pull` (`lex-cli pull`), `lex:gen` (`lex-cli generate`), and `lex:check` (`lex-cli generate && git diff --exit-code src/lexicons`)
  - `web/eslint.config.js` and Prettier: ignore `src/lexicons/**` and `lexicons/vendor/**`
  - `.github/workflows/web-ci.yml`: add a `lex:check` step after typecheck
- Test: `web/scripts/lexiconDocs.test.ts`, `web/src/lib/lexicons/validate.test.ts`

**Interfaces:**
- Produces:
  - `LANYARDS_NSID = { lanyard: 'app.lanyards.actor.lanyard', honorific: 'app.lanyards.actor.biography.honorific', webLink: 'app.lanyards.link.web', audio: 'app.lanyards.link.media.audio', video: 'app.lanyards.link.media.video', authFull: 'app.lanyards.authFull' } as const`
  - `AUTH_FULL_COLLECTIONS`: the five record NSIDs
  - `BLOCK_TYPES = ['links', 'talks', 'openTo', 'blogPosts', 'bskyPosts', 'publications', 'skills', 'education', 'code', 'collections', 'media', 'events', 'details'] as const` and `type BlockType`
  - `stripNulls<T>(value: T): T` (removes `null` object properties recursively; leaves arrays' non-null items)
  - `validateRecord(nsid: KnownRecordNsid, value: unknown): { ok: true; value: unknown } | { ok: false; message: string }`. It validates with the generated schemas via `@atcute/lexicons/validations` `safeParse`, after `stripNulls`.
  - generated namespaces under `@/lexicons` (lex-cli naming, e.g. `AppLanyardsActorLanyard`, `IdSifaGetProfileView`, `SiteStandardDocument`, `OrgTangledRepoManifest`, `NetworkCosmikCard`)

- [ ] **Step 1: Write the failing tests.** In `scripts/lexiconDocs.test.ts`:
  - each authored document passes `v.safeParse(lexiconDoc, doc)` and `refineLexiconDoc(doc, true)` returns no issues (both from `@atcute/lexicon-doc`, with `valibot`)
  - `honorific.json`, `link/web.json`, `audio.json` and `video.json` deep-equal the legacy root files `lexicons/actor/biography/honorific.json`, `lexicons/link/web/web.json`, `lexicons/link/media/audio.json` and `lexicons/link/media/video.json`
  - `authFull` lists exactly `AUTH_FULL_COLLECTIONS`
  - the lanyard `#block.type` knownValues equal `BLOCK_TYPES`

  In `validate.test.ts`:
  - accepted:
    - a minimal lanyard `{ $type, createdAt }`
    - a full lanyard with 20 blocks, `hidden`, `connect`, and one `events` entry
  - rejected:
    - a lanyard with 21 blocks
    - a block `limit` of 0 or 21
    - honorific `'Mx'` (closed enum)
    - a web link with `url: 'not a url'`
  - `stripNulls({ a: null, b: { c: null, d: 1 }, e: [1, null] })` returns `{ b: { d: 1 }, e: [1, null] }`
- [ ] **Step 2: Run** `npm test -- --run scripts/lexiconDocs.test.ts src/lib/lexicons`. Expected: FAIL (files missing).
- [ ] **Step 3: Author the lexicons.**
  - **Kept lexicons:** copy the four kept documents byte-for-byte from the legacy root.
  - **`actor/lanyard.json`:** key `literal:self`; required `createdAt`.
    - `accent`: string, knownValues = the 8 accents, maxLength 32
    - `showJob`: boolean, default true
    - `blocks`: array maxLength 20 of `#block`
      - `#block` = `{ type` (string, knownValues `BLOCK_TYPES`, maxLength 32, required), `visible` (boolean, required), `limit` (integer 1–20) `}`
    - `hidden`: array maxLength 500 of string maxLength 2048
    - `connect`: ref `#connectPrefs`
      - `#connectPrefs` = `{ follow, vouch, metPack }` booleans, each default true
    - `events`: array maxLength 200 of `#eventOverride`
      - `event`: at-uri, required
      - `headline`: maxGraphemes 100, maxLength 1000
      - `hereFor`: maxGraphemes 200, maxLength 2000
      - `emphasise`: array maxLength 13 of string, knownValues `BLOCK_TYPES`
      - `metPacks`: array maxLength 20 of at-uri
    - `createdAt` and `updatedAt`: datetime
  - **`authFull.json`:** exactly as follows.

```json
{
  "lexicon": 1,
  "id": "app.lanyards.authFull",
  "defs": {
    "main": {
      "type": "permission-set",
      "title": "Manage your Lanyards profile",
      "detail": "Create, update and delete your lanyard settings, honorific, web links, and audio and video links.",
      "permissions": [
        {
          "type": "permission",
          "resource": "repo",
          "collection": [
            "app.lanyards.actor.lanyard",
            "app.lanyards.actor.biography.honorific",
            "app.lanyards.link.web",
            "app.lanyards.link.media.audio",
            "app.lanyards.link.media.video"
          ]
        }
      ]
    }
  }
}
```

- [ ] **Step 4: Configure and pull.**
  - **Generation:** `lex.config.ts` generates from `lexicons/**/*.json` into `src/lexicons/`, with `imports: ['@atcute/atproto', '@atcute/bluesky']`.
  - **Pull:** pull into `lexicons/vendor/` with `clean: true`, from one `{ type: 'atproto', mode: 'nsids' }` source listing:
    - `id.sifa.defs`, `id.sifa.getProfileView`
    - `id.sifa.profile.{self, position, education, skill, externalAccount, publication, presentation, presentationDelivery, location}`
    - `site.standard.{document, publication}`
    - `org.tangled.repo.{declaration, manifest, defs}`
    - `network.cosmik.{collection, collectionLink, card, defs}`
  - Then run `npm run lex:pull && npm run lex:gen`. Add every transitively referenced NSID that generation reports as unresolved (expect `community.lexicon.location.*` and `community.lexicon.calendar.event`), and repeat until it succeeds.
- [ ] **Step 5: Implement** `nsids.ts` and `validate.ts`. `KnownRecordNsid` is the union of our five record NSIDs plus `app.bsky.graph.follow`, and maps each one to its generated `mainSchema`.
- [ ] **Step 6: Run** the Step 2 tests, then `npm run lint && npm run typecheck && npm run lex:check`. Expected: PASS, and `lex:check` exits 0.
- [ ] **Step 7: Commit.** `feat: pin lexicons and generate validated record types (#102)`.

---

### Task 2: Publish the lexicons (owner) and verify they resolve

**Files:**
- Create: `web/scripts/verify-lexicons.ts`, plus the `lex:verify` script (`tsx scripts/verify-lexicons.ts`)
- Modify: `web/README.md` (a "Publishing lexicons" section)
- Test: `web/scripts/verifyLexicons.test.ts`

**Interfaces:**
- Consumes: the authored documents from Task 1.
- Produces: `compareLexicon(local: object, published: object): string[]`. It lists differing JSON paths, ignoring `$type`. It is used by the script, which resolves each NSID with `DohJsonLexiconAuthorityResolver` (`https://mozilla.cloudflare-dns.com/dns-query`) and `LexiconSchemaResolver`, then exits 1 on any unresolved or differing NSID.

- [ ] **Step 1: Write the failing test.**
  - `compareLexicon` returns `[]` for identical documents and for documents that differ only by `$type`.
  - It returns `['defs.main.record.properties.title.maxLength']` when that value differs.
- [ ] **Step 2: Run** `npm test -- --run scripts/verifyLexicons.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `compareLexicon` and the script, which prints one line per NSID: `✓ <nsid>` or `✗ <nsid>: <reason>`.
- [ ] **Step 4: Run the test.** Expected: PASS. Run `npm run lex:verify`. Expected: all six NSIDs are `✗` (nothing is published yet).
- [ ] **Step 5: Document** the steps in `web/README.md`:
  - install `goat` (`brew install goat`, or `go install github.com/bluesky-social/goat@latest`)
  - create an app password for `@lanyards.app`
  - run `goat lex check-dns --example-did did:plc:ua3d6biqepazbq6mw4ysotfo`
  - add the five TXT records on Cloudflare (Global Constraints)
  - run `GOAT_USERNAME=lanyards.app GOAT_PASSWORD=<app password> goat lex publish --lexicons-dir lexicons/lanyards`, adding `--update` on later changes
  - run `npm run lex:verify`
  - revoke the app password
  - note that bsky.social caches resolution failures for about 5 minutes
- [ ] **Step 6: Commit.** `feat: lexicon publication check and runbook (#102)`.
- [ ] **Step 7: Owner action.** Ask the owner, through a multiple-choice quiz, to follow the runbook. Then run `npm run lex:verify`. Expected: six `✓` lines.
  - If the DNS hasn't propagated, wait and re-run.
  - Task 3's production scope change must not ship before this passes. Every other task can proceed.

---

### Task 3: Granular OAuth scopes, granted-permission checks and the AppView client

**Files:**
- Create: `web/src/lib/atproto/endpoints.ts`, `web/src/lib/atproto/permissions.ts`
- Modify:
  - `web/src/lib/atproto/oauthConfig.ts`: scopes, plus a `PUBLIC_BASE_URL` define
  - `web/plugins/oauthMetadata.ts`
  - `web/src/lib/atproto/session.ts`
  - `web/src/lib/atproto/identity.ts`: imports `PUBLIC_APPVIEW` from `endpoints.ts`
  - `web/src/lib/analytics/events.ts`
  - `web/src/vite-env.d.ts`
- Test: `web/src/lib/atproto/permissions.test.ts`; extend `oauthConfig.test.ts` and `session.test.ts`

**Interfaces:**
- Produces:
  - `GRANULAR_SCOPE: string`, `FALLBACK_SCOPE = 'atproto transition:generic'`, and `CLIENT_SCOPE = \`${GRANULAR_SCOPE} transition:generic\``. These replace `OAUTH_SCOPE`.
  - `import.meta.env.VITE_PUBLIC_BASE_URL`: the resolved base URL, defined by the plugin.
  - `SessionHandle` gains:
    - `scope: string`, taken from atcute's `session.token.scope`
    - `appview: Client`: `new Client({ handler: agent, proxy: BSKY_APPVIEW_AUD })`
  - `parseGrantedScope(scope: string): GrantedPermissions`
  - `canWrite(granted, collection: string, action: 'create' | 'update' | 'delete'): boolean` and `canCall(granted, lxm: string): boolean`
  - `startSignIn(identifier, returnTo)` keeps its signature.
  - `AnalyticsEvent` gains `'oauth_scope_fallback'`.

- [ ] **Step 1: Write the failing tests.**
  - **`permissions.test.ts`:** `canWrite` is true for:
    - `'atproto transition:generic'` on any collection
    - `'repo:*'`
    - `'repo:app.bsky.graph.follow?action=create&action=delete'`, for create and delete, but **false** for update
    - `'repo?collection=app.lanyards.actor.lanyard&collection=app.lanyards.link.web'`, for both collections and every action
    - `'include:app.lanyards.authFull'`, for every `AUTH_FULL_COLLECTIONS` entry
    - false for everything under `'atproto'` alone
  - **`canCall`:** true for:
    - each lxm in `rpc?lxm=A&lxm=B&aud=…`
    - `rpc:A?aud=…`
    - `transition:generic`
  - **Malformed tokens** (`repo:`, `rpc?aud=x`) grant nothing and never throw.
  - **`oauthConfig.test.ts`:**
    - `GRANULAR_SCOPE` equals the four Global Constraints strings joined with spaces
    - the loopback `client_id` and the hosted `metadata.scope` both carry `CLIENT_SCOPE`, byte for byte (assert `%23` survives)
  - **`session.test.ts`:**
    - `startSignIn` requests `GRANULAR_SCOPE`
    - when the PAR step throws `OAuthResponseError` with `error === 'invalid_scope'`, it retries once with `FALLBACK_SCOPE` and tracks `oauth_scope_fallback`
    - any other error is rethrown without a retry
    - `restoreSession` exposes `scope` from the stored token and an `appview` client whose `proxy` is `BSKY_APPVIEW_AUD`
- [ ] **Step 2: Run** `npm test -- --run src/lib/atproto`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.**
  - **`permissions.ts`** parses space-separated tokens:
    - `resource[:positional][?query]`, where repeated keys form arrays
    - `repo` (collection positional or `collection=`, `action=`; no action means all three)
    - `rpc` (lxm positional or `lxm=`)
    - `include:<nsid>`, where only `app.lanyards.authFull` expands, to `AUTH_FULL_COLLECTIONS` with all actions
    - `transition:generic` grants every repo action and every lxm except `chat.bsky.*`
  - **Sign-up:** `startSignUp` requests `GRANULAR_SCOPE` too.
  - **Plugin:** it now passes `CLIENT_SCOPE` to `buildOAuthEnv`.
- [ ] **Step 4: Run** the tests, then `npm run lint && npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: granular OAuth scopes with a transition:generic fallback (#102)`.

---

### Task 4: PDS reads and the source contract

**Files:**
- Create:
  - `web/src/lib/sources/result.ts`, `web/src/lib/sources/request.ts`
  - `web/src/lib/atproto/pds.ts`
  - `web/src/test/handlers.ts` (MSW builders)
- Test: `web/src/lib/sources/request.test.ts`, `web/src/lib/atproto/pds.test.ts`

**Interfaces:**
- Produces:
  - `type SourceName = 'bluesky' | 'sifa' | 'standardSite' | 'orcid' | 'tangled' | 'semble' | 'lanyards'`
  - `type SourceErrorKind = 'notFound' | 'unavailable' | 'network' | 'timeout' | 'rateLimited' | 'server' | 'invalid'`
  - `class SourceError extends Error { source: SourceName; kind: SourceErrorKind; status?: number }`
  - `type Result<T> = { ok: true; value: T } | { ok: false; error: SourceError }`, plus `ok(value)` and `err(source, kind, status?)`
  - `requestJson(source: SourceName, url: string, signal?: AbortSignal): Promise<Result<unknown>>`
    - combines `signal` with `AbortSignal.timeout(REQUEST_TIMEOUT_MS)`
    - maps responses: 404 → `notFound`, 429 → `rateLimited`, ≥ 500 → `server`, `TypeError` → `network`, timeout → `timeout`, a non-JSON body → `invalid`
  - `resolvePds(did: Did, signal?): Promise<Result<string>>`: through `identityResolver`, memoised for one hour
  - `listRecords(source, did, collection, { limit: number; signal? }): Promise<Result<RawRecord[]>>`: follows the cursor until `limit`, with pages of at most 100. It treats `cursor: null` as the end.
  - `getRecord(source, did, collection, rkey, signal?): Promise<Result<RawRecord | null>>`: `RecordNotFound` → `ok(null)`
  - `type RawRecord = { uri: string; cid: string; value: unknown }`
  - test builders: `mockDidDocument(did, pds)`, `mockListRecords(pds, did, collection, records)`, `mockGetRecord(pds, did, collection, rkey, record | null)`, `mockJson(url, body, init?)`

- [ ] **Step 1: Write the failing tests.**
  - `requestJson` maps 404, 429, 500, a network error, a timeout (fake timers) and an HTML body to the kinds above.
  - An aborted caller signal yields `timeout`, never an unhandled rejection.
  - `listRecords` pages until `limit` (fixtures with 2 pages of 100 and `limit: 150` → 150 records, 2 requests), and stops on `cursor: null`.
  - `getRecord` maps `RecordNotFound` to `ok(null)`.
  - `resolvePds` reads the PDS from a PLC document (`mockDidDocument`), and its second call makes no request.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement**, using `@atcute/client` `Client` with `simpleFetchHandler` per PDS and `@atcute/atproto` types.
- [ ] **Step 4: Run** them. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: source result contract and public PDS reads (#102)`.

---

### Task 5: Bluesky adapter

**Files:**
- Create: `web/src/lib/sources/bluesky/bluesky.ts`, `bluesky.types.ts`, `fixtures/` (anonymised `getProfile`, `getAuthorFeed`, `getRelationships` and `getKnownFollowers` responses; base the profile's `links[]` on the captured `mkizka.net` profile)
- Test: `web/src/lib/sources/bluesky/bluesky.test.ts`

**Interfaces:**
- Produces:
  - `type BlueskyProfile = { did: Did; handle: Handle; displayName?: string; description?: string; pronouns?: string; avatar?: string; links: ProfileLink[]; labels: string[] }`
    - `avatar` uses `avatarThumbnail`
    - `labels` holds the label values
  - `type ProfileLink = { key: string; url: string; title?: string; iconUrl?: string }`, where `key` is the link record's AT-URI
  - `type BskyPost = { key: string; url: string; text: string; facets?: Facet[]; createdAt: string }`
    - `key` is the post's AT-URI
    - `url` is `https://bsky.app/profile/<did>/post/<rkey>`
  - `type Relationship = { followUri?: string; followedBy: boolean; blocked: boolean }`
  - `type KnownFollowers = { sample: { did: Did; handle: Handle; displayName?: string }[]; count: number; more: boolean }`
  - adapter functions:
    - `fetchProfile(actor: ActorIdentifier, signal?): Promise<Result<BlueskyProfile>>`
    - `fetchPosts(did: Did, limit: number, signal?): Promise<Result<BskyPost[]>>`
    - `fetchRelationship(appview: Client, viewer: Did, subject: Did, signal?): Promise<Result<Relationship>>`
    - `fetchKnownFollowers(appview: Client, subject: Did, signal?): Promise<Result<KnownFollowers>>`

- [ ] **Step 1: Write the failing tests.**
  - **`fetchProfile`:**
    - maps the fixture, keeping `links` in profile order
    - a `{"error":"InvalidRequest","message":"Profile not found"}` 400 → `notFound`
    - `AccountTakedown` or `AccountDeactivated` → `unavailable`
  - **`fetchPosts`:**
    - requests `filter=posts_no_replies` and `limit=Math.min(limit * 2, 30)`
    - drops reposts (items with `reason`) and posts by other authors
    - returns at most `limit`
  - **`fetchRelationship`:**
    - `blocked` is true when any of `blocking`, `blockedBy`, `blockingByList` or `blockedByList` is set
    - `followUri` is `following`
  - **`fetchKnownFollowers`:**
    - requests `limit=50`
    - `sample` holds the first two followers
    - `count` is the number returned
    - `more` is true when a cursor is present
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** with `publicAppView` (public reads) and the session's `appview` client (authenticated reads).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: Bluesky source adapter (#102)`.

---

### Task 6: Sifa adapter

**Files:**
- Create: `web/src/lib/sources/sifa/sifa.ts`, `sifa.types.ts`, `sifa.fallback.ts`, `fixtures/`
  - fixtures are anonymised: `getProfileView` for a rich profile and for a profile with nulls, plus PDS `listRecords` per collection, all based on the captured profiles
- Test: `web/src/lib/sources/sifa/sifa.test.ts`

**Interfaces:**
- Produces:
  - `type SifaProfile`, with:
    - `handle?: string; displayName?: string; avatar?: string; pronouns?: string; headline?: string; location?: string`
    - `langs: string[]; openTo: OpenToValue[]`
    - `positions: SifaPosition[]; education: SifaEducation[]; skills: SifaSkill[]`
    - `externalAccounts: SifaAccount[]; publications: SifaPublication[]; talks: SifaTalk[]`
  - `SifaPosition = { key; title; company?; startedAt?; endedAt?; isPrimary: boolean }`
  - `SifaEducation = { key; institution; degree?; fieldOfStudy?; startedAt?; endedAt? }`
  - `SifaSkill = { key; name }`
  - `SifaAccount = { key; url; platform: string; label? }`, where `platform` is bare and lower-case
  - `SifaPublication = { key; title; doi?; url?; date?; venue? }`
  - `SifaTalk = { key; title; eventName?; date?; role?; url? }`
  - `key` is always `at://<did>/<collection>/<rkey>`.
  - `type OpenToValue`: the 9 `id.sifa.defs` openTo names without the prefix
  - `fetchSifaProfile(did: Did, signal?): Promise<Result<SifaProfile | null>>`

- [ ] **Step 1: Write the failing tests.**
  - **View request:** it requests `${SIFA_APPVIEW}/xrpc/id.sifa.getProfileView?actor=<did>` and maps the rich fixture.
  - **Field names:** view `primary` maps to `isPrimary`. Talks merge `presentations[].deliveries[]` (title from the presentation) with standalone `presentationDeliveries`, sorted by `date` descending.
  - **Not found:** `{"error":"ProfileNotFound"}` (400) → `ok(null)`, with **no** PDS request (MSW fails on unhandled requests).
  - **Fallback:** a 500, a timeout, a 429 or an invalid body triggers the fallback. It reads `listRecords` for `id.sifa.profile.{self, position, education, skill, externalAccount, publication, presentation, presentationDelivery, location}` and maps the records to the same `SifaProfile`, linking deliveries to presentations by `presentationRef.uri`.
  - **Both fail:** if the fallback also fails, the result is `err('sifa', 'server')`.
  - **Nulls:** a view item containing `onBehalfOf: null` still parses. An item failing its `#…View` schema after `stripNulls` is dropped, and the rest survive.
  - **Normalised values:** `platform` values `'orcid'`, `'id.sifa.defs#platformOrcid'` and `'GitHub'` normalise to `'orcid'`, `'orcid'` and `'github'`. `openTo` tokens lose `id.sifa.defs#`.
  - **Publications:** those whose `rkey` starts with `std-at://` are excluded (Sifa merges standard.site posts into its publications list).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Validate the view's top level against `IdSifaGetProfileView.profileView` (with arrays treated as unknown), then each array item against its own view def.
  - In the fallback, `location` comes from `id.sifa.profile.location` (the `isPrimary` one, else the first), formatted as "locality, region, country" from the address.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: Sifa source adapter with PDS fallback (#102)`.

---

### Task 7: standard.site, Tangled and Semble adapters

**Files:**
- Create: `web/src/lib/sources/{standardSite,tangled,semble}/<name>.ts`, `<name>.types.ts`, `<name>.test.ts`, `fixtures/`
  - fixtures are anonymised, based on the captured `pckt.blog`, `tangled.org` and `cosmik.network` records, and include one standard.site publication with a non-TID rkey and no `name`

**Interfaces:**
- Produces:
  - **standard.site:**
    - `type BlogPost = { key: string; title: string; url: string; publicationName?: string; publishedAt: string }`
    - `fetchBlogPosts(did: Did, limit: number, signal?): Promise<Result<BlogPost[]>>`
  - **Tangled:**
    - `type CodeRepo = { key: string; name: string; description?: string; url: string; createdAt?: string }`
    - `fetchRepos(did: Did, handle: Handle, limit: number, signal?): Promise<Result<CodeRepo[]>>`
  - **Semble:**
    - `type SembleCollection = { key: string; name: string; description?: string; url: string; links: SembleLink[] }`
    - `type SembleLink = { key: string; title: string; url: string; siteName?: string }`
    - `fetchCollections(did: Did, handle: Handle, limit: number, signal?): Promise<Result<SembleCollection[]>>`

- [ ] **Step 1: Write the failing tests.**
  - **standard.site:**
    - lists `site.standard.document` (limit 50) and `site.standard.publication` (limit 20)
    - URL = the publication `url` (trailing slash trimmed) + document `path`, when `site` is the AT-URI of a publication in the same repo
    - URL = `site` + `path` for a loose document whose `site` is `https://…`
    - URL = the publication URL when `path` is missing
    - documents whose URL fails `safeHref` are dropped
    - sorted by `publishedAt` descending; at most `limit`
    - the invalid publication record is skipped without failing
  - **Tangled:**
    - requests `${TANGLED_APPVIEW}/xrpc/org.tangled.repo.listRepos?subject=<did>`
    - `name` = `value.declaration.name`
    - URL `https://tangled.org/<handle>/<name>`
    - sorted by `createdAt` descending
    - on AppView failure, falls back to PDS `org.tangled.repo.declaration`, with name = rkey and no description
    - when both fail → `err('tangled', …)`
  - **Semble:**
    - only collections in the person's repo
    - links come from `collectionLink`s whose `collection.uri` is one of them, resolved to the person's own `URL` cards by `card.uri`
    - `content.url` is used when the top-level `url` is absent
    - links from other repos, `NOTE` cards and unsafe URLs are skipped
    - at most 3 links per collection, newest `addedAt` first
    - collection URL `https://semble.so/profile/<handle>/collections/<rkey>`
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** with `listRecords`, `requestJson` and `validateRecord` (pulled schemas; manifests are validated as `org.tangled.repo.manifest` records).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: standard.site, Tangled and Semble source adapters (#102)`.

---

### Task 8: ORCID adapter

**Files:**
- Create: `web/src/lib/sources/orcid/orcid.ts`, `orcid.types.ts`, `orcid.test.ts`, `fixtures/` (anonymised works and researcher-urls responses based on the public test record `0000-0002-1825-0097`; trim the large captured record to 5 groups)

**Interfaces:**
- Produces:
  - `isValidOrcid(id: string): boolean` (ISO 7064 MOD 11-2):

```ts
let total = 0;
for (const digit of id.replaceAll('-', '').slice(0, 15)) {
  total = (total + Number(digit)) * 2;
}
const remainder = (12 - (total % 11)) % 11;
const check = remainder === 10 ? 'X' : String(remainder);
```

  - `findOrcidId(accounts: SifaAccount[]): string | undefined`: platform `orcid`, or a URL on `orcid.org`; extracts `\d{4}-\d{4}-\d{4}-\d{3}[\dX]`; validates the checksum
  - `type OrcidWork = { key: string; title: string; doi?: string; year?: string; venue?: string; url?: string }`
    - `key` = `orcid:<id>/<put-code>`
    - `doi` is normalised
  - `fetchOrcidWorks(id: string, signal?): Promise<Result<OrcidWork[]>>`
  - `fetchOrcidVerified(id: string, did: Did, signal?): Promise<Result<boolean>>`

- [ ] **Step 1: Write the failing tests.**
  - **`isValidOrcid`:** true for `0000-0002-1825-0097` and for an iD ending in `X` (`0000-0002-9079-593X`); false for a changed digit.
  - **`findOrcidId`:** handles both platform forms and the URL form, and ignores an invalid checksum.
  - **`fetchOrcidWorks`:**
    - sends `Accept: application/json`
    - takes the first `work-summary` of each group
    - DOI from the `external-id-type: 'doi'` entry with relationship `self`, normalised with `normaliseDoi`
    - year from `publication-date.year.value`, which may be null
    - sorted by year descending
  - **`fetchOrcidVerified`:**
    - true when a researcher URL normalises to `https://lanyards.app/d/<did>` or `https://bsky.app/profile/<did>`
    - false otherwise
    - a 404 body `{"response-code":404}` → `notFound`
    - a 503 → `rateLimited`
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** `normaliseDoi` and `normaliseUrl` come from Task 10's `lib/person/normalise.ts`. Create that file now with just those two functions and their tests (see Task 10, Step 1). Task 10 extends it.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: ORCID source adapter with two-way link check (#102)`.

---

### Task 9: Lanyards adapter and lanyard config

**Files:**
- Create:
  - `web/src/lib/sources/lanyards/lanyards.ts`, `lanyards.types.ts`, `lanyards.test.ts`, `fixtures/`
  - `web/src/lib/person/config.ts`, `config.test.ts`

**Interfaces:**
- Produces:
  - `type LanyardRecords = { config: { value: unknown; cid: string } | null; honorific?: 'Dr' | 'Prof'; webLinks: WebLink[]; media: MediaLink[] }`
    - `WebLink = { key; url; title? }`
    - `MediaLink = { key; kind: 'audio' | 'video'; url; platform: string; title?; description?; type?; publishedDate? }`
  - `fetchLanyardRecords(did: Did, signal?): Promise<Result<LanyardRecords>>`
  - `type RenderableBlockType = Exclude<BlockType, 'events'>`, and `DEFAULT_BLOCK_ORDER: RenderableBlockType[]`, in this order: links, talks, openTo, blogPosts, bskyPosts, publications, skills, education, code, collections, media, details
  - `DEFAULT_VISIBLE: ReadonlySet<RenderableBlockType> = new Set(['links', 'talks'])`
  - `type LanyardConfig = { accent: Accent; showJob: boolean; blocks: { type: RenderableBlockType; visible: boolean; limit?: number }[]; hidden: string[] }`
  - `resolveConfig(record: unknown | null): LanyardConfig`
  - `itemLimit(block): number`: links → `limit ?? 20`, capped at 20; other blocks → `limit ?? 3`

- [ ] **Step 1: Write the failing tests.**
  - **`fetchLanyardRecords`:**
    - reads `getRecord` for `app.lanyards.actor.lanyard/self` and `…honorific/self`
    - reads `listRecords` (limit 20) for `link.web`, `link.media.audio` and `link.media.video`
    - honorific `'none'` → `undefined`
    - an invalid web-link record is dropped
    - a missing config → `config: null`
  - **`resolveConfig(null)`:** returns violet, `showJob: true`, the 12 blocks in default order with only links and talks visible, and `hidden: []`.
  - **`resolveConfig` with an owner's record:**
    - keeps their order and visibility
    - drops unknown and duplicate types (first wins)
    - omits `events`
    - appends missing renderable types in default order with default visibility
    - maps an unknown accent to violet
  - **`itemLimit`:** `{ type: 'links' }` → 20; `{ type: 'talks' }` → 3; `{ type: 'talks', limit: 7 }` → 7; `{ type: 'links', limit: 25 }` → 20.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** with `getRecord`, `listRecords` and `validateRecord`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: Lanyards records adapter and config defaults (#102)`.

---

### Task 10: PersonView composer and data hooks

**Files:**
- Create:
  - in `web/src/lib/person/`: `normalise.ts`, `platform.ts`, `format.ts`, `hero.ts`, `blocks.ts`, `personView.types.ts`, `usePersonView.ts`, `useSharedContext.ts`
  - `web/src/lib/query/keys.ts`
- Test: `normalise.test.ts`, `platform.test.ts`, `format.test.ts`, `hero.test.ts`, `blocks.test.ts`, `usePersonView.test.tsx`

**Interfaces:**
- Consumes:
  - the adapters from Tasks 5–9
  - `LanyardConfig` and `itemLimit` (Task 9)
  - `SessionHandle.appview` (Task 3)
- Produces:
  - `normaliseUrl(url: string): string | null`:
    - http(s) only
    - lower-cases the scheme and host, strips `www.`, drops default ports, the hash, a trailing path slash and `utm_*` parameters
  - `normaliseDoi(value: string): string | null`: strips `https://doi.org/`, `http://dx.doi.org/` and `doi:`; lower-cases; requires a leading `10.`
  - `safeHref(url: string): string | undefined`
  - `detectPlatform(url: string, hint?: string): Platform`: a host table for github, gitlab, codeberg, tangled, orcid, linkedin, youtube, bluesky, sifa, x, instagram, googleScholar, substack and semble; then the Sifa `hint` (e.g. `fediverse`); else `website`
  - `formatPartialDate(value: string): string`: `2024` → "2024", `2024-03` → "Mar 2024", `2024-03-07` → "7 Mar 2024", using `en-GB`
  - `currentJob(positions: SifaPosition[]): SifaPosition | undefined`
  - `composeHero(input: { bluesky: BlueskyProfile; sifa?: SifaProfile | null; lanyards?: LanyardRecords; config: LanyardConfig }): BadgeHero`
  - `type BadgeHero = { did; handle; displayName; honorific?: 'Dr' | 'Prof'; avatar?; pronouns?; headline?; job?: { title: string; company?: string } }`
  - `composeBlocks(input: { config: LanyardConfig; sources: SourceSnapshot; mode: 'owner' | 'visitor'; orcidVerified: boolean }): BlockView[]`
  - `type SourceSnapshot = Partial<Record<SourceKey, SourceState<unknown>>>`
    - `SourceKey` = `SourceName` plus `'blueskyPosts'` and `'orcidWorks'`
    - `SourceState<T> = { status: 'loading' } | { status: 'error'; error: SourceError } | { status: 'ready'; value: T }`
  - `type BlockView = { type: RenderableBlockType } & ({ status: 'loading' } | { status: 'error'; sources: SourceName[] } | { status: 'ready'; items: BlockItem[]; failedSources: SourceName[] })`
    - `BlockItem` is the per-block union: `LinkItem`, `TalkItem`, `PostItem`, `BlogPostItem`, `PublicationItem`, `SkillItem`, `EducationItem`, `CodeItem`, `CollectionItem`, `MediaItem`, `OpenToItem`, `DetailsItem`
    - every item has a `key` that is used for `hidden`
  - `usePersonView(did: Did): PersonViewState`, returning:
    - `profile: SourceState<BlueskyProfile>`, `hero?: BadgeHero`
    - `blocks: BlockView[]`, `config: LanyardConfig`
    - `mode: 'owner' | 'visitor'`, `retry(source: SourceKey): void`
  - `useSharedContext(did: Did): { mutual: boolean; knownFollowers?: KnownFollowers; relationship?: Relationship; loading: boolean }`
    - it is enabled only when signed in, not viewing your own lanyard, and `canCall` grants the lxm
  - `queryKeys.source(key: SourceKey, did: Did)`, `queryKeys.relationship(viewer, subject)`, `queryKeys.knownFollowers(viewer, subject)`

- [ ] **Step 1: Write the failing tests.**
  - **`normalise`:** `https://WWW.Example.com:443/a/?utm_source=x#top` and `https://example.com/a` normalise equal. `javascript:alert(1)` → null. `normaliseDoi('https://doi.org/10.1000/ABC')` → `10.1000/abc`. `safeHref('mailto:a@b.test')` passes, `data:` fails.
  - **Hero precedence:**
    - Sifa `displayName`, `avatar` and `pronouns` beat Bluesky's
    - headline = Sifa `headline`, else the first paragraph of the Bluesky `description`, truncated to 200 graphemes with "…"
    - `honorific` comes from Lanyards
    - `job` follows `currentJob` (no `endedAt`; `isPrimary` wins; else the latest `startedAt`), omitted when `showJob` is false
    - a `displayName` of `<script>` stays a plain string (rendering is covered in Task 12)
  - **Links block:**
    - merges Bluesky links, Sifa accounts and Lanyards web links, deduplicated by `normaliseUrl`
    - title preference: Lanyards title > Bluesky title > Sifa label > host
    - `javascript:` URLs are dropped
    - at most `itemLimit`
  - **Publications block:**
    - merges ORCID works and Sifa publications by DOI; ORCID wins the title
    - `orcidVerified` true marks ORCID-backed items with `orcidVerified: true`
  - **Visibility, hiding and order:**
    - `hidden` keys are removed before limits apply
    - invisible blocks are absent
    - blocks follow the config order
  - **Visitor mode:**
    - drops ready blocks with no items
    - drops blocks whose every source failed
    - keeps `loading` blocks
  - **Owner mode:**
    - keeps failed blocks as `status: 'error'`
    - keeps partial failures as `failedSources`
    - also drops empty blocks (spec §7.2: empty blocks never render)
  - **`usePersonView` (MSW):**
    - with default config, it requests only the Bluesky profile, Sifa and Lanyards
    - making `publications` visible in config adds the ORCID requests
    - a Sifa 500 plus a failed fallback leaves the hero rendered from Bluesky alone
    - `mode` is `owner` when the session DID equals `did`
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Queries:** each source query has `enabled` set only when a visible block needs it. The profile, Sifa and Lanyards queries always run, because the hero and config need them.
  - **Dependencies:** ORCID depends on Sifa's accounts. Tangled and Semble need the handle from the profile.
  - **Errors:** report each failure with `captureError(error, { source })`, but not `notFound` or `unavailable`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: PersonView composer and per-source queries (#102)`.

---

### Task 11: Public lanyard routes, page shell and badge hero

**Files:**
- Create:
  - routes: `web/src/routes/@{$handle}.tsx`, `web/src/routes/d.$did.tsx`
  - in `web/src/features/lanyard/components/`: `LanyardPage/`, `BadgeHero/`, `SharedContextStrip/`, `LanyardNotFound/`, `LanyardNotice/`
  - `web/src/hooks/useApplyAccent.ts`
- Modify:
  - `web/src/routes/__root.tsx` (`beforeLoad` normalisation)
  - `web/src/lib/analytics/events.ts` (adds `'lanyard_viewed'`)
- Test: `web/src/app/lanyard.test.tsx`, plus component tests per folder

**Interfaces:**
- Consumes: `usePersonView`, `useSharedContext` (Task 10), `HandleCombobox` (Slice 1a).
- Produces:
  - `<LanyardPage did={did} />`, which Task 13 extends and Task 16 embeds as the preview
  - `useResolveHandle(handle: string): SourceState<Did>`: calls `fetchProfile(handle)` and seeds `queryKeys.source('bluesky', did)` with the result, so the page doesn't fetch the profile twice
  - `useApplyAccent(accent: Accent): void`: sets `data-accent` on mount, restores `DEFAULT_ACCENT` on unmount

- [ ] **Step 1: Write the failing route tests** (`renderRoute` with `useSession` mocked, MSW).
  - **Routes and redirects:**
    - `/@alice.test` renders the hero heading (h1) "Ada Example"
    - `/@Alice.Test` and `/%40alice.test` redirect to `/@alice.test`
    - `/@did:plc:fixturealice000000000000` redirects to `/d/did:plc:fixturealice000000000000`
    - `/d/not-a-did` renders the not-found component
  - **Not found:** an unknown handle shows "We couldn't find @nobody.test" and a search field labelled "Search for someone" that navigates to `/@<chosen handle>`.
  - **Unavailable:** an `AccountDeactivated` profile shows "This account isn't available".
  - **Opt-out:** when the profile is labelled `!no-unauthenticated`:
    - signed-out visitors see only "This person has chosen to show their lanyard only to people who are signed in." and a "Sign in" link to `/?returnTo=%2F%40alice.test`
    - signed-in visitors see the lanyard
  - **Block:** a relationship with `blocked: true` shows only "This lanyard isn't available to you." No actions render.
  - **Hero contents:**
    - "Dr Ada Example"
    - the pronouns
    - the headline
    - "Research Engineer · Example Lab"
    - `@alice.test`
    - an avatar `img` with `alt=""`
  - **Title:** the page title is "Ada Example · Lanyards".
  - **Shared-context strip:**
    - "You follow each other" when mutual
    - "Followed by Bea Example, Cal Example and 3 others you follow"
    - absent when signed out or on your own lanyard
  - **Accent:** the owner's accent `teal` sets `document.documentElement.dataset.accent` to `teal` while mounted.
  - **Accessibility:** axe passes for the ready, not-found and opt-out states.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **Redirects:** the root `beforeLoad` redirects `/%40…` paths. The `@{$handle}` route's `beforeLoad` handles case and DIDs.
  - **Handles:** the handle route renders `LanyardPage` once `useResolveHandle` returns a DID, and shows a hero skeleton until then.
  - **Layout:** the hero renders as soon as the profile query resolves. Blocks (Task 12) render below it in `<section>`s, each behind its own error boundary.
  - **Analytics:** track `lanyard_viewed` with `{ viewer: 'owner' | 'visitor' | 'signedOut' }`.
- [ ] **Step 4: Run.** Expected: PASS, with lint and typecheck clean.
- [ ] **Step 5: Commit.** `feat: public lanyard routes, badge hero and page states (#102)`.

---

### Task 12: Lanyard blocks

**Files:**
- Create:
  - `web/src/components/ExternalLink/`, `web/src/components/RichText/`, `web/src/components/PlatformIcon/`
  - `web/src/features/lanyard/components/BlockSection/`
  - one folder per block under `web/src/features/lanyard/components/blocks/`: `LinksBlock`, `TalksBlock`, `OpenToBlock`, `BlogPostsBlock`, `BskyPostsBlock`, `PublicationsBlock`, `SkillsBlock`, `EducationBlock`, `CodeBlock`, `CollectionsBlock`, `MediaBlock`, `DetailsBlock`
- Modify: `LanyardPage` (renders `BlockView[]` through a `BLOCK_COMPONENTS` map)
- Test: one test per component folder

**Interfaces:**
- Consumes: `BlockView` and the item types (Task 10).
- Produces:
  - `<ExternalLink href>`: renders plain text when `safeHref` rejects the URL
  - `<RichText text facets? />`: uses `@atcute/bluesky-richtext-segmenter`. Links pass through `ExternalLink`; mentions go to `/@<handle>`; tags render as text.
  - `<PlatformIcon platform />`:
    - simple-icons marks for github, gitlab, codeberg, orcid, youtube, bluesky, mastodon (fediverse), x, instagram, googlescholar and substack
    - lucide `Globe` otherwise
    - `aria-hidden`
  - `<BlockSection type heading editUrl? status onRetry?>`: an `h2`, the "Couldn't load {source}" text with a "Retry" button for owners, and a skeleton while loading

- [ ] **Step 1: Write the failing tests.**
  - **Headings:** Links, Talks, Open to, Blog posts, Posts on Bluesky, Publications, Skills, Education, Code, Collections, Podcasts and videos, Details.
  - **Links:** each link shows its icon and title, and opens in a new tab with `rel="noopener noreferrer"` and the "(opens in a new tab)" hint.
  - **Publications:** ORCID-verified items show a ✓ icon with the accessible name "Verified on ORCID".
  - **Open to:** shows "Mentoring others" for `mentoringOthers` (all 9 labels are in `OpenToBlock.constants.ts`).
  - **Details:** shows the location, and languages through `Intl.DisplayNames('en-GB')` (`fr` → "French").
  - **Bluesky posts:** text with a link facet renders a link. A mention renders a link to `/@<handle>`. A `<b>` in the text renders literally.
  - **Talks:** show "Talk title · Event name · 7 Mar 2024".
  - **Owner error state:** shows "Couldn't load Sifa" and a "Retry" button that calls `onRetry`.
  - **Layout:** a 5,000-character title clamps (`line-clamp-3`) and leaves no horizontal overflow at 320 px (assert the class).
  - **Accessibility:** axe passes for each block.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement**, adding `lucide-react@1.61.0` and `simple-icons@16.36.0` (named imports only).
- [ ] **Step 4: Run** the tests, then `npm run build && npm run size`. Expected: PASS, and the size stays under budget (Task 15 adds the route chunk to the count).
- [ ] **Step 5: Commit.** `feat: lanyard blocks with safe links and rich text (#102)`.

---

### Task 13: Visitor actions, Follow and the permission notice

**Files:**
- Create:
  - `web/src/lib/atproto/writes.ts`, `web/src/features/lanyard/hooks/useFollow.ts`
  - components: `web/src/features/lanyard/components/VisitorActions/`, `FollowButton/`, `web/src/features/auth/components/PermissionNotice/`
- Modify:
  - `web/src/lib/atproto/session.ts`: `startSignIn` and `startSignUp` save `returnTo` to `sessionStorage['lanyards:returnTo']`
  - `web/src/features/auth/components/CallbackStatus/`: "Try again" links to `/?returnTo=<saved value>`
  - `LanyardPage`
  - `web/src/lib/analytics/events.ts`: adds `'follow_created'` and `'follow_deleted'`
- Test: `writes.test.ts`, `useFollow.test.tsx`, component tests, and `callback.test.tsx` additions

**Interfaces:**
- Consumes: `SessionHandle` (`rpc`, `scope`), `canWrite`, `validateRecord`, `Relationship`.
- Produces:
  - `class MissingPermissionError extends Error`, `class InvalidRecordError extends Error`
  - `createRecord(session, collection: KnownRecordNsid, record): Promise<{ uri: string; cid: string }>` (rkey = `now()` from `@atcute/tid`)
  - `putRecord(session, collection, rkey, record): Promise<{ uri: string; cid: string }>`
  - `deleteRecord(session, collection, rkey): Promise<void>`
  - all three check `canWrite` first and validate the record, adding `$type`
  - `useFollow(subject: Did): { state: 'unknown' | 'notFollowing' | 'following'; pending: boolean; needsPermission: boolean; follow(): void; unfollow(): void }`
  - `<PermissionNotice returnTo />`:
    - heading "Lanyards needs your permission"
    - text "To follow people and save your lanyard, Lanyards needs permission to write to your account. You'll be asked to approve it."
    - button "Give permission", which calls `startSignIn(did, returnTo)`

- [ ] **Step 1: Write the failing tests.**
  - **Write helpers:**
    - `createRecord` refuses (`MissingPermissionError`) under scope `atproto`, and sends nothing
    - it refuses an invalid record (`InvalidRecordError`)
    - it sends `com.atproto.repo.createRecord` with a 13-character TID rkey and `$type`
  - **Signed-out actions on `/@alice.test`:**
    - "Follow on Bluesky" links to `https://bsky.app/profile/alice.test`
    - "Sign in" links to `/?returnTo=%2F%40alice.test`
    - "Create account" calls `startSignUp('/@alice.test')`
  - **Signed-out actions on `/d/<did>`:** the same three actions, with `returnTo` set to `/d/<did>`.
  - **Signed in:**
    - "Follow" writes `{ $type: 'app.bsky.graph.follow', subject, createdAt }`, shows "Following", and toasts "Followed @alice.test"
    - "Following" deletes the record named by `followUri`, and toasts "Unfollowed @alice.test"
    - failures toast "Failed to follow. Please try again." or "Failed to unfollow. Please try again.", and restore the previous state
  - **Missing permission:** under scope `atproto`, pressing Follow shows `PermissionNotice` and sends no write.
  - **Unknown relationship:** when the relationship query fails, Follow is disabled with the description "Couldn't check whether you already follow them".
  - **Own lanyard:** shows "This is your lanyard" and no Follow.
  - **Callback retry:** "Try again" after a callback error links to `/?returnTo=%2F%40alice.test` when that was saved.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.** The follow is optimistic through `queryClient.setQueryData(queryKeys.relationship(…))`, rolled back on error. Busy buttons set `aria-busy` and are disabled.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: visitor actions and Follow with permission checks (#102)`.

---

### Task 14: Link-preview functions, rewrites and security headers

**Files:**
- Create:
  - functions: `web/api/meta.ts`, `web/api/og.tsx`
  - shared code in `web/server/`: `html.ts`, `profileMeta.ts`, `badgeImage.tsx`, `fonts.ts`
  - tests: `web/server/html.test.ts`, `web/server/profileMeta.test.ts`, `web/scripts/vercelConfig.test.ts`
- Modify:
  - `web/vercel.json`, `web/tsconfig.json`
  - `web/vite.config.ts`: Vitest `include` adds `server/**/*.test.{ts,tsx}`
  - `web/package.json`
- Test: as above, plus a render smoke test, `web/server/badgeImage.test.tsx`

**Interfaces:**
- Produces:
  - `escapeHtml(value: string): string`
  - `injectMeta(indexHtml: string, meta: PageMeta): string`, with `type PageMeta = { title: string; description: string; canonical: string; image: string; imageAlt: string; type: 'profile' | 'website' }`
    - replaces `<title>` and the description meta
    - inserts the canonical link, `og:*` and `twitter:*` tags before `</head>`
  - `fetchProfileMeta(input: { handle?: string; did?: string }, base: string, fetchImpl?: typeof fetch): Promise<PageMeta | null>`
    - `null` when the profile is missing, opted out (`!no-unauthenticated`) or on any error
    - the Bluesky profile and the Sifa headline are fetched in parallel, each with `UPSTREAM_TIMEOUT_MS`
  - `DEFAULT_META(base)`: title "Lanyards", the manifest description, and image `${base}/og/default.png`
  - `renderBadgePng(input: BadgeImageInput | null): Promise<Uint8Array>`, where `type BadgeImageInput = { displayName: string; handle: string; headline?: string; avatarDataUri?: string }`. `null` renders the default Lanyards badge

- [ ] **Step 1: Write the failing tests.**
  - **`escapeHtml`:** escapes `& < > " '`.
  - **`injectMeta`:** with a display name of `"><script>alert(1)</script>`, the output contains no `<script>alert` and exactly one `<title>`.
  - **`fetchProfileMeta`:**
    - title "Ada Example (@alice.test) · Lanyards"
    - description = Sifa headline, else the Bluesky bio truncated to 200 characters
    - canonical `${base}/@alice.test` (for the DID route too)
    - image `${base}/og/p/<did>.png`, alt "Ada Example's lanyard"
    - `null` for `!no-unauthenticated`, for a 400 and for a timeout
  - **Badge image smoke test:** `renderBadgePng(meta)` returns a PNG (magic bytes `89 50 4E 47`) of 1200×630, both with and without an avatar.
  - **`vercelConfig.test.ts`:**
    - rewrites in order: `/@:handle` → `/api/meta?handle=:handle`, `/d/:did` → `/api/meta?did=:did`, `/og/p/:did.png` → `/api/og?did=:did`, `/og/default.png` → `/api/og`, `/((?!api/).*)` → `/index.html`
    - headers for `/(.*)` include `Content-Security-Policy: frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin` and `X-Content-Type-Options: nosniff`
- [ ] **Step 2: Run** `npm test -- --run server scripts/vercelConfig.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **`api/meta.ts`:** `export async function GET(request: Request)`.
    - It reads `handle` or `did` from the query, falling back to the pathname.
    - It reads `dist/index.html` with `readFile(new URL('../dist/index.html', import.meta.url), 'utf8')`.
    - It resolves the base URL from `process.env.PUBLIC_BASE_URL`, else the request origin.
    - On success it responds `cache-control: public, s-maxage=600, stale-while-revalidate=86400`, otherwise `public, s-maxage=60`, with `content-type: text/html; charset=utf-8`.
  - **`api/og.tsx`:** satori and resvg-wasm.
    - Fonts: DM Sans 400 and 700 WOFF2 from `@fontsource/dm-sans/files/`.
    - Initialise WASM and fonts once per instance.
    - Set `boxSizing: 'border-box'` on the root.
    - The avatar is fetched from the `avatar_thumbnail` URL into a data URI; on failure, show initials.
    - It renders the default Lanyards badge when there's no DID, the profile opted out, or anything fails.
    - It responds `cache-control: public, s-maxage=86400, stale-while-revalidate=604800`, setting the header lower-case so it replaces the default.
  - **Config:** add the `vercel.json` rewrites and headers exactly as tested, and set `tsconfig` `rewriteRelativeImportExtensions: true` with `api` and `server` in `include`.
- [ ] **Step 4: Run** the tests, `npm run typecheck`, and `npx vercel build` in `web/` if the CLI is available (expected: `api/meta` and `api/og` listed as functions). Expected: PASS.
- [ ] **Step 5: Commit.** `feat: person-specific link previews and security headers (#102)`.

---

### Task 15: PR 1 verification: signed-in e2e harness, end-to-end tests, budgets and deploy

**Files:**
- Create:
  - `web/src/lib/atproto/e2eSession.ts`
  - e2e: `web/e2e/mocks.ts`, `web/e2e/lanyard.spec.ts`, `web/e2e/perf.spec.ts`
  - `web/scripts/check-no-e2e.ts`
- Modify:
  - `web/src/lib/atproto/session.ts` (`restoreSession` checks the e2e session first, only when `import.meta.env.VITE_E2E === 'true'`)
  - `web/package.json`: `build:e2e` adds `VITE_E2E=true`; a new script `check:prod` (`PUBLIC_BASE_URL=https://ci.lanyards.invalid npm run build && tsx scripts/check-no-e2e.ts`)
  - `web/scripts/bundleSize.ts` and `check-bundle-size.ts`
  - `web/e2e/fixtures.ts`
  - `.github/workflows/web-ci.yml`: adds `check:prod`
- Test: `scripts/bundleSize.test.ts` additions

**Interfaces:**
- Produces:
  - `readE2eSession(): SessionHandle | null`. It reads `localStorage['lanyards:e2e-session']` (`{ did, scope }`) and builds `rpc` and `appview` clients on `https://pds.e2e.test` and `https://appview.e2e.test`, with an `agent` whose `signOut` resolves.
  - `initialJsFiles(manifest, routeKeys: string[] = [])`: also counts the chunks (and static imports) of manifest entries whose key includes any of the `routeKeys`. The CLI passes `['routes/@{$handle}.tsx']`.
  - e2e helpers: `signIn(page, { did, scope })`, `mockPerson(page, fixtureSet)`.

- [ ] **Step 1: Write the failing tests.**
  - **Bundle size:** `initialJsFiles` with a manifest containing a lazy `src/routes/@{$handle}.tsx?tsr-split=component` chunk counts it when the route key is passed.
  - **`lanyard.spec.ts`**, with every third-party host answered from anonymised fixtures and unexpected hosts still failing:
    - signed out: hero, links, and the "Follow on Bluesky" href; axe passes in light and dark
    - signed in: Follow sends `createRecord` with the expected body, then shows "Following"; Unfollow sends `deleteRecord`
    - permission: signed in with scope `atproto`, the permission notice appears and no write is sent
    - not found: shows search
    - redirect: `/%40alice.test` redirects
    - opt-out: the notice appears for signed-out visitors
    - outage: a Sifa 500 with a fallback 500 still shows the hero, and no Sifa block for visitors
  - **`perf.spec.ts`**, on Chromium via CDP: 4× CPU throttling and `Network.emulateNetworkConditions` with 150 ms latency, 1.6 Mbps down and 750 kbps up. Loading `/@alice.test` gives LCP < 2500 ms and CLS < 0.1 (PerformanceObserver, buffered).
- [ ] **Step 2: Run** `npm test -- --run scripts`, then `npm run build:e2e && PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement.** `check-no-e2e.ts` fails if any file in `dist/` contains `pds.e2e.test` or `lanyards:e2e-session`.
- [ ] **Step 4: Run the full CI sequence locally:**
  - `npm run lint && npm run typecheck && npm run lex:check && npm run i18n:check && npm test -- --run && npm run build:e2e && npm run size && npm run e2e && npm run check:prod`
  - Expected: all pass; size ≤ 204800 bytes, including the lanyard route.
- [ ] **Step 5: Commit.** `test: signed-in e2e harness, lanyard e2e and performance budget (#102)`.
- [ ] **Step 6: Open PR 1.**
  - Before opening it, confirm Task 2's `lex:verify` passes.
  - Push, then open the PR "feat: public lanyard, data adapters and link previews (#102)" with `Refs #102` (PR 2 closes it).
  - Verify the PR head SHA matches the local `HEAD`, and subscribe to PR activity.
- [ ] **Step 7: Verify the preview deployment.**
  - `curl -s <preview>/@lanyards.app | grep -c 'og:'` ≥ 6.
  - `curl -sI <preview>/og/p/did:plc:ua3d6biqepazbq6mw4ysotfo.png` → `200` and `image/png`.
  - Previews may sit behind Vercel protection. If so, run these checks on `next.lanyards.app` after merge.
- [ ] **Step 8: Owner check (quiz).** On the preview or beta, the owner signs in, sees the Lanyards permission set on the consent screen, follows and unfollows an account, and opens their own `/@handle`.
- [ ] **Step 9: Check the previews after merge.**
  - Run `curl -s 'https://cardyb.bsky.app/v1/extract?url=https://next.lanyards.app/@lanyards.app'`. Expected: a person-specific title, description and image.
  - Then the owner pastes the link into a Bluesky draft to confirm the card.

---

## PR 2: Customise, QR and ORCID

Start after PR 1 merges. Fast-forward the branch to `main` first (`git fetch origin main && git merge --ff-only origin/main`).

### Task 16: `/lanyard` customiser, config saving, accent and badge toggle

**Files:**
- Create:
  - `web/src/routes/lanyard.tsx`
  - in `web/src/features/lanyard/customise/`: `CustomisePage/`, `AccentPicker/`
  - `web/src/features/lanyard/hooks/useLanyardConfig.ts`
- Modify:
  - `web/src/lib/person/config.ts` (`serialiseConfig`)
  - `LandingPage.constants.ts` (`SIGNED_IN_HOME = '/lanyard'`)
  - `AppHeader` (adds a "My lanyard" link)
  - `web/src/lib/analytics/events.ts` (`'lanyard_updated'`)
- Test: `config.test.ts` additions, `useLanyardConfig.test.tsx`, `web/src/app/customise.test.tsx`, component tests

**Interfaces:**
- Consumes:
  - `LanyardPage` (Task 11)
  - `putRecord`, `PermissionNotice` (Task 13)
  - `resolveConfig` (Task 9)
- Produces:
  - `serialiseConfig(config: LanyardConfig, previous: unknown | null, now: string): Record<string, unknown>`
    - keeps the previous record's `createdAt`, `events`, `connect`, and any block entries of types this slice doesn't render (e.g. `events`), in their positions
    - sets `updatedAt`
  - `useLanyardConfig(): { config: LanyardConfig; update(patch: (c: LanyardConfig) => LanyardConfig): void; saving: boolean; error: boolean; retry(): void }`
    - saves are debounced by 800 ms
    - saves are optimistic
    - a pending save flushes on `pagehide` and on unmount

- [ ] **Step 1: Write the failing tests.**
  - **`serialiseConfig`:** keeps `events`, `connect`, an `events`-type block and `createdAt` from the previous record, and validates as `app.lanyards.actor.lanyard`.
  - **`useLanyardConfig`** (fake timers):
    - three updates within 800 ms send one `putRecord` (rkey `self`)
    - success toasts "Lanyard updated"
    - failure toasts "Failed to save. Please try again." with a "Retry" action, keeps the local state, and retry resends
  - **`/lanyard` route:**
    - signed out, it redirects to `/?returnTo=%2Flanyard`
    - the landing page sends signed-in visitors to `/lanyard`
  - **Customiser:**
    - shows the live preview (`LanyardPage`, owner mode)
    - a "View as visitor" toggle button (`aria-pressed`) switches the preview to visitor mode
  - **Accent:** the picker is a radio group named "Accent colour" with 8 options ("Violet", "Indigo", "Plum", "Rose", "Ember", "Moss", "Teal", "Ocean"); choosing one applies it and saves.
  - **Job toggle:** the "Show current job on your badge" checkbox saves `showJob`.
  - **Permission:** under scope `atproto`, the page shows `PermissionNotice` and the controls are disabled.
  - **Status:** a polite live region announces "Saving…" and then "Saved".
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** with `radix-ui` (`RadioGroup`) for the accent picker, and swatches that show each accent's colour with its name as a visible label.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: lanyard customiser with debounced saving and accents (#102)`.

---

### Task 17: Block editor: order, visibility, limits and per-item hide

**Files:**
- Create in `web/src/features/lanyard/customise/`: `BlockEditor/`, `BlockEditorRow/`, `ItemMenu/`, `HiddenItems/`
- Modify:
  - `CustomisePage`
  - the Task 12 blocks: each item renders `ItemMenu` in owner preview mode
  - `BlockSection`: `editUrl`
- Test: component tests and `customise.test.tsx` additions

**Interfaces:**
- Consumes: `useLanyardConfig`, `BlockView`, `BLOCK_COMPONENTS`.
- Produces:
  - `EDIT_LINKS: Record<RenderableBlockType, (handle: string) => { label: string; url: string } | undefined>`:
    - Sifa-sourced blocks → "Edit on Sifa", `https://sifa.id/p/<handle>?edit=true#<anchor>`, with anchors career, education, skills, publications, presentations and other-profiles
    - `bskyPosts` → "Edit in Bluesky", `https://bsky.app/profile/<handle>`
    - `links` → both

- [ ] **Step 1: Write the failing tests.**
  - **Rows:** each row has a drag handle (`@dnd-kit/sortable` with `KeyboardSensor`), "Move up" and "Move down" buttons (disabled at the ends), a "Show {block}" switch (`radix-ui` `Switch`), and an "Items to show" select of 1–20.
  - **Move:** "Move down" on Links moves it below Talks, saves, and announces "Links moved to position 2 of 12".
  - **Switch:** toggling the switch saves `visible`.
  - **Limit:** choosing 5 saves `limit: 5`.
  - **Empty or failed sources:**
    - a block with no data shows "Nothing to show yet" and its edit link
    - a source error shows "Couldn't load Sifa" with "Retry"
  - **Hiding items:** in owner preview, an item's menu ("More options for {title}") offers "Hide this item", which adds its key to `hidden` and saves. "Hidden items" lists it with "Show again".
  - **Accessibility:** axe passes, and keyboard-only reordering works (Space to lift, arrows, Space to drop).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** the tests, then `npm run build && npm run size`. Expected: PASS. The customiser code sits in the lazy `/lanyard` chunk, outside the lanyard route budget.
- [ ] **Step 5: Commit.** `feat: block editor with keyboard reordering and per-item hide (#102)`.

---

### Task 18: Kept-record forms: honorific, web links, audio and video

**Files:**
- Create in `web/src/features/lanyard/customise/`:
  - `HonorificForm/`, `WebLinkForm/`, `WebLinkList/`, `MediaForm/`, `MediaList/`
  - each form folder adds `X.validation.ts`, with options in `X.constants.ts` read from the lexicon enums
- Modify:
  - `CustomisePage`
  - `web/src/lib/analytics/events.ts` (`'kept_record_saved'` with `{ kind: 'honorific' | 'webLink' | 'audio' | 'video' }`)
- Test: one test per folder, plus `X.validation.test.ts`

**Interfaces:**
- Consumes: `createRecord`, `putRecord`, `deleteRecord`, `fetchLanyardRecords` (query invalidation).

- [ ] **Step 1: Write the failing tests.**
  - **Honorific:** radio buttons "None", "Dr" and "Prof" in a fieldset with legend "Honorific". Saving writes `putRecord(honorific, 'self', { value, createdAt (kept), updatedAt })`. The toast is "Honorific updated".
  - **Web link:** a "Web address" field (`type="url"`, required) and a "Title" field (optional, ≤ 100 characters).
    - On blur and on submit, `ftp://x` gives "Enter a web address starting with https:// or http://". A 101-character title gives "Keep the title to 100 characters or fewer".
    - Errors set `aria-invalid` and `aria-describedby`, and focus moves to the first error. Input is preserved on error.
    - Submit is disabled while submitting. Success clears the form and toasts "Link added".
  - **Link list:** deleting with "Delete {title}" toasts "Link deleted". A failure toasts "Failed to save. Please try again." and keeps the item.
  - **Media:** a "Type of media" radio (Audio or Video) chooses the collection.
    - Fields: "Web address" (required), "Platform" (a select from the lexicon enum, required), "Title" (≤ 200), "Description" (textarea, ≤ 1000), and "Kind of content" (a select from the lexicon `type` enum).
    - Toasts: "Audio added", "Video added", "Audio deleted" and "Video deleted".
  - **Validity:** every written record passes `validateRecord`.
  - **Accessibility:** axe passes for each form, including its error state.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: honorific, web link and media forms (#102)`.

---

### Task 19: QR sheet with Wake Lock, and the Show QR button

**Files:**
- Create:
  - `web/src/components/QrCode/`
  - `web/src/features/qr/components/QrSheet/`, `web/src/features/qr/components/ShowQrButton/`
  - `web/src/hooks/useWakeLock.ts`
- Modify:
  - `AppHeader` (renders `ShowQrButton` when signed in)
  - `web/src/lib/analytics/events.ts` (`'qr_opened'`)
- Test: component tests, `useWakeLock.test.ts`

**Interfaces:**
- Produces:
  - `<QrCode value />`: `lean-qr` `generate(value, { minCorrectionLevel: correction.M, maxCorrectionLevel: correction.M })` and `toSvgPath`
    - `viewBox` = `-4 -4 (size + 8) (size + 8)`
    - always black modules on a white background, in dark mode too
    - `role="img"`, `aria-label="QR code for {url}"`
  - `useWakeLock(active: boolean): { supported: boolean; held: boolean }`
    - re-requests the lock on `visibilitychange` when visible
    - releases it on unmount
    - swallows rejections; there's no UI for a failure, because iOS 16.4–18.3 Home Screen apps reject
  - `qrUrl(did: Did): string` = `${import.meta.env.VITE_PUBLIC_BASE_URL}/d/${did}`

- [ ] **Step 1: Write the failing tests.**
  - **QR code:** the rendered `QrCode` for a known URL decodes back to that URL (decode the module matrix from `generate`; the SVG path is derived from it). The background stays `#ffffff` in dark mode.
  - **Show QR button:** labelled "Show QR", at least 56 px tall in the sheet. It opens a full-screen dialog titled with the display name, showing "Scan to see my lanyard".
  - **Copy link:** writes `qrUrl(did)` to the clipboard and toasts "Link copied".
  - **Dialog behaviour:** Escape closes it and returns focus to the button.
  - **Wake lock:** with a mocked `navigator.wakeLock`, the lock is requested on open, re-requested after a hidden→visible transition, and released on close. An unsupported browser renders normally.
  - **Offline:** the sheet works offline: QR generation makes no network request.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** with the `radix-ui` `Dialog`.
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: QR sheet with wake lock and copy link (#102)`.

---

### Task 20: ORCID verification helper

**Files:**
- Create: `web/src/features/lanyard/customise/OrcidHelper/`
- Modify:
  - `CustomisePage`
  - `web/src/lib/analytics/events.ts` (`'orcid_checked'` with `{ verified: boolean }`)
- Test: `OrcidHelper.test.tsx`

**Interfaces:**
- Consumes: `findOrcidId`, `fetchOrcidVerified` (Task 8), `queryKeys`.

- [ ] **Step 1: Write the failing tests.**
  - **No iD:** shows "Add your ORCID iD on Sifa to show verified publications.", linking to `https://sifa.id/p/<handle>?edit=true#other-profiles`.
  - **Unverified:**
    - heading "Verify your ORCID iD"
    - text "Add this link to the Websites & social links section of your ORCID record:"
    - the read-only URL `https://lanyards.app/d/<did>`
    - "Copy link" (toast "Link copied")
    - "Open ORCID" (`https://orcid.org/my-orcid`, new tab)
    - "Check again"
  - **Check again:** refetches and announces, in a polite live region, either "Verified. Your publications now show the ORCID tick." or "Not verified yet. ORCID can take a few minutes to update."
  - **Verified:** shows "Your ORCID iD is verified".
  - **Accessibility:** axe passes.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit.** `feat: ORCID two-way verification helper (#102)`.

---

### Task 21: PR 2 verification, deploy and the 30-second check

**Files:**
- Create: `web/e2e/customise.spec.ts`, `web/e2e/qr.spec.ts`
- Modify: `web/README.md` (the customiser and the manual accessibility checklist)

- [ ] **Step 1: Write the e2e tests.**
  - **`customise.spec.ts`:**
    - signed in, reorder with the Move buttons and with the keyboard, toggle a block, change the accent and set the honorific
    - assert the `putRecord` bodies
    - fill the web-link form with an invalid URL and see the inline error, then fix it and see the toast
    - hide an item and show it again
    - axe passes in light and dark
  - **`qr.spec.ts`:** open the QR sheet from the header, assert it shows the QR and the name, copy the link, close with Escape. Measure sign-in-to-QR: from `page.goto('/')` with a seeded session to the QR dialog being visible takes < 30 s (the spec's exit criterion; mocked network).
- [ ] **Step 2: Run** the full CI sequence from Task 15, Step 4. Expected: all pass, with the lanyard route still ≤ 204800 bytes.
- [ ] **Step 3: Commit.** `test: customiser and QR end-to-end coverage (#102)`.
- [ ] **Step 4: Open PR 2.** Push, then open "feat: lanyard customiser, kept-record forms, QR and ORCID (#102)" with `Closes #102`. Verify the head SHA and subscribe.
- [ ] **Step 5: Owner checks (quiz).**
  - VoiceOver (iOS or macOS) and TalkBack passes over `/lanyard`, the QR sheet and a public lanyard, using the README checklist.
  - A real sign-in to QR in under 30 s on a phone.
  - QR scanning from another phone opens `/d/<did>`.

---

## Self-review

- **Spec coverage:** every spec section in scope maps to at least one task.

| Spec section | Task(s) |
|---|---|
| §7.1 hero | 10, 11 |
| §7.2 blocks | 7–10, 12 |
| §7.3 shared-context strip | 10, 11 |
| §7.4 customisation | 16–18 |
| §7.6 QR | 19 |
| §7.7 visitor actions | 13 |
| §7.8 ORCID | 8, 20 |
| §10.3–10.6 lexicons, publishing, scopes | 1–3 |
| §12.3 data flow | 10 |
| §12.4 link previews | 14 |
| §13 failure rows for this slice | 4–13 |
| §14 safe rendering, opt-outs and blocks | 11–14 |
| §15 accessibility | each UI task, plus Tasks 15 and 21 |
| §16 tests and budgets | 15, 21 |

- **Out of scope here:**
  - §7.5 event overrides (Slice 2); only the schema ships now
  - offline persistence (Slice 2)
  - §11 migration and legal pages (Slice 1c)
  - the spec's migration table omits `app.lanyards.actor.biography.location`, which 7 accounts use; this is recorded on #103 for Slice 1c
- **Type names:** checked across tasks:
  - `SourceKey`, `SourceState`, `BlockView`, `LanyardConfig`, `RenderableBlockType`
  - `canWrite`, `createRecord`, `putRecord`, `deleteRecord`, `useLanyardConfig`, `serialiseConfig`, `qrUrl`
