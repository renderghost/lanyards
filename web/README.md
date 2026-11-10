# Lanyards web app

The rebuilt Lanyards attendee app: a front-end-only, installable PWA built on
the AT Protocol. Design spec:
`docs/superpowers/specs/2026-11-10-attendee-ux-design.md`.

This folder is self-contained. The legacy Next.js app at the repository root
keeps serving `lanyards.app` until the rebuild's Slice 1c swaps it over.

## Commands

Run everything from `web/`:

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Dev server on `http://127.0.0.1:5173` (never localhost) |
| `npm test`           | Unit and component tests (Vitest)                       |
| `npm run e2e`        | End-to-end tests (Playwright) against a preview build   |
| `npm run lint`       | ESLint, including accessibility rules                   |
| `npm run typecheck`  | TypeScript                                              |
| `npm run build`      | Production build (needs `PUBLIC_BASE_URL`)              |
| `npm run format`     | Prettier                                                |
| `npm run lex:gen`    | Regenerate `src/lexicons` from `lexicons/**/*.json`     |
| `npm run lex:pull`   | Re-pin third-party lexicons into `lexicons/vendor`      |
| `npm run lex:check`  | Fail if `src/lexicons` is out of date (runs in CI)      |
| `npm run lex:verify` | Check our lexicons are published and match `lexicons/`  |

Copy `.env.example` to `.env.local` for local overrides.

`npm run size` checks the initial JavaScript against the 200 KB gzipped
budget after a build. If your environment ships its own Chromium, point the
e2e tests at it with `PW_CHROMIUM_PATH=/path/to/chromium npm run e2e`.

The app, CI and Vercel all run Node 26 (see `.nvmrc`).

## The lanyard customiser (`/lanyard`)

Signed-in people land on `/lanyard`: their lanyard's live preview beside
the controls that change it. "View as visitor" switches the preview to what
other people see.

- **Settings** (accent, current-job line, block order, visibility, item
  limits and hidden items) live in the `app.lanyards.actor.lanyard` record.
  Changes show at once and save 800 ms after the last one, or straight away
  when the page is hidden. Saving keeps everything the customiser doesn't
  edit, such as per-event overrides, and never writes before the stored
  settings have been read.
- **Blocks** move by drag (pointer, or keyboard: Space, arrows, Space) or
  with Move up and Move down. Every move is announced.
- **Kept records** (honorific, web links, podcasts and videos) use forms
  that follow CLAUDE.md's Form Standards and write their own records.
- **Show QR** in the header opens a full-screen QR code for `/d/<did>`. It
  keeps the screen awake and offers Copy link.
- **ORCID**: the helper shows the link to add to the owner's ORCID record,
  so their publications earn the ORCID tick.

An identity-only session sees the permission notice instead of controls.

## Manual accessibility checklist

Automated checks (axe, in light and dark) run in CI. Before a release, also
do these by hand with VoiceOver (iOS or macOS) and TalkBack (Android):

1. **Public lanyard** (`/@handle`): the name is the only level-one heading,
   each block is a labelled region, links say they open in a new tab, and
   Follow announces its result.
2. **Customiser** (`/lanyard`):
   - every control has a name, and switches and radios say their state
   - "Saving…" then "Saved" is announced after a change
   - keyboard reordering announces "Picked up…", each new position, and
     "… moved to position N of 12"
   - Move up and Move down announce the new position
   - item menus are named "More options for …"
3. **Forms**: an invalid submit moves focus to the first problem, which is
   read with its error. Success and failure toasts are announced.
4. **QR sheet**: opening moves focus into the sheet, the name is read as
   its title, Copy link announces "Link copied", and Escape returns focus
   to Show QR.
5. **Layout**: nothing scrolls sideways at 320 px or at 200% zoom, and every
   control is at least 44 px (56 px in the QR sheet).
6. **Timing**: from a signed-in home, Show QR shows a scannable code well
   within 30 seconds, and scanning it from another phone opens `/d/<did>`.

## Lexicons

- `lexicons/lanyards/` holds the `app.lanyards.*` lexicons we publish.
- `lexicons/vendor/` holds third-party lexicons (Sifa, standard.site, Tangled,
  Semble), pinned from their published records with `npm run lex:pull`.
- After editing either, run `npm run lex:gen` and commit `src/lexicons/`.

### Publishing lexicons

Lanyards' lexicons are published from the `@lanyards.app` account
(`did:plc:ua3d6biqepazbq6mw4ysotfo`). OAuth can only request
`include:app.lanyards.authFull` once that permission set resolves.

1. Install Bluesky's `goat` CLI: `brew install goat`, or
   `go install github.com/bluesky-social/goat@latest`.
2. In Bluesky, signed in as `@lanyards.app`, create an app password
   (Settings → Privacy and security → App passwords).
3. Check which DNS records are needed:
   `goat lex check-dns --example-did did:plc:ua3d6biqepazbq6mw4ysotfo`.
4. In Cloudflare DNS for `lanyards.app`, add these TXT records, each with the
   value `did=did:plc:ua3d6biqepazbq6mw4ysotfo`. Resolvers never walk up the
   hierarchy, so each group needs its own record:

   | Name                                    | Covers                                    |
   | --------------------------------------- | ----------------------------------------- |
   | `_lexicon.lanyards.app`                 | `app.lanyards.authFull`                   |
   | `_lexicon.actor.lanyards.app`           | `app.lanyards.actor.lanyard`              |
   | `_lexicon.biography.actor.lanyards.app` | `app.lanyards.actor.biography.honorific`  |
   | `_lexicon.link.lanyards.app`            | `app.lanyards.link.web`                   |
   | `_lexicon.media.link.lanyards.app`      | `app.lanyards.link.media.audio`, `.video` |

5. From `web/`, publish:
   `GOAT_USERNAME=lanyards.app GOAT_PASSWORD=<app password> goat lex publish --lexicons-dir lexicons/lanyards`.
   Add `--update` when republishing a changed lexicon.
6. Run `npm run lex:verify`. Every line should start with ✓.
7. Revoke the app password.

bsky.social caches a failed lexicon lookup for about 5 minutes, so sign-in may
keep falling back to broad permissions for a few minutes after publishing.

## Deploying the beta (`next.lanyards.app`)

The app deploys from a **second** Vercel project. The legacy project keeps
serving `lanyards.app` from the repository root until Slice 1c (#103).

### 1. Create the Vercel project

In the Vercel dashboard (team `renderghost`): **Add New → Project →** import
`renderghost/lanyards`, then set:

| Setting           | Value                                           |
| ----------------- | ----------------------------------------------- |
| Project name      | `lanyards-next`                                 |
| Framework preset  | Vite                                            |
| Root Directory    | `web`                                           |
| Build and output  | leave as detected (`web/vercel.json` sets them) |
| Production branch | `main` (Settings → Git, after creation)         |

Keep **Settings → Environment Variables → "Automatically expose System
Environment Variables"** on, because preview builds use `VERCEL_ENV` and
`VERCEL_BRANCH_URL`.

### 2. Environment variables

| Name                | Environment | Value                       |
| ------------------- | ----------- | --------------------------- |
| `PUBLIC_BASE_URL`   | Production  | `https://next.lanyards.app` |
| `VITE_POSTHOG_KEY`  | —           | leave unset during the beta |
| `VITE_POSTHOG_HOST` | —           | leave unset during the beta |

Production builds fail on purpose without `PUBLIC_BASE_URL`, because the
OAuth client metadata is generated from it.

### 3. Domain

1. In the project: **Settings → Domains → Add** `next.lanyards.app`.
2. `lanyards.app` uses Cloudflare DNS. Add this record in Cloudflare:

   | Type  | Name   | Target                 | Proxy status          |
   | ----- | ------ | ---------------------- | --------------------- |
   | CNAME | `next` | `cname.vercel-dns.com` | DNS only (grey cloud) |

   Keep the proxy off so Vercel can issue the certificate.

### 4. Check the deployment

After the first production deployment from `main`:

```bash
curl -s https://next.lanyards.app/oauth-client-metadata.json
# → JSON whose client_id is https://next.lanyards.app/oauth-client-metadata.json
curl -sI https://next.lanyards.app/oauth-client-metadata.json | grep -i content-type
# → application/json
curl -s -o /dev/null -w '%{http_code}\n' https://next.lanyards.app/settings
# → 200
```

Then sign in with a real account, check your name and handle on `/settings`,
sign out, and install the app on a phone and open it offline.

### Preview deployments

Preview builds work, but Vercel protects previews with Vercel Authentication
by default. Bluesky's servers can't fetch a protected preview's OAuth
metadata, so **sign-in only works on `next.lanyards.app`** (or locally)
unless you relax deployment protection for previews.
