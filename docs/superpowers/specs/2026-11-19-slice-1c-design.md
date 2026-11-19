# Slice 1c design: migration, settings, legal pages and the lanyards.app swap

Issue: #103 (part of #95, Slice 1). Also closes #108's two Slice 1c items.
Builds on the attendee UX spec (`2026-11-10-attendee-ux-design.md`, §11, §12.6,
§14, §17); where this document differs, it wins.

## Intent

Retire the old Lanyards. When Slice 1c is done, `lanyards.app` serves the new
app, the legacy Next.js app is gone from the repository and from Vercel, and
the handful of people with old Lanyards records can move them to Sifa without
losing anything they could see before.

The owner's stated priority is **retiring the old app**. Anything not needed
for a safe, honest swap waits for the slice that needs it.

## Who it serves

- **About seven people with old records.** The network relay
  (`com.atproto.sync.listReposByCollection`, 2026-11-13) shows 5 accounts
  with affiliations, 6 with social links, 3 with events, 4 with publications,
  3 with skills, 5 with qualifications and 7 with locations; most are the
  same few people, and the owner is likely one of them.
- **Everyone else using Lanyards.** They need legal pages, a way to delete
  their Lanyards data, safe defaults (security headers), and a working
  `lanyards.app` after the swap.

## Goals

1. A migration wizard, as the spec describes it (preview, consent, batched
   writes, verify, separate clean-up), that moves retired `app.lanyards.*`
   records to Sifa.
2. `/settings` gains an itemised **Delete my Lanyards data**.
3. `/privacy` and `/terms`, linked from the footer, the sign-in screen and the
   OAuth client metadata (`policy_uri`, `tos_uri`).
4. Security headers: HSTS, a real Content Security Policy and a
   Permissions-Policy.
5. A link preview of someone who opts out of logged-out viewing disappears
   from the CDN **within an hour**.
6. The swap: `lanyards.app` serves the new app, `next.lanyards.app` redirects
   to it, and the legacy app is deleted.
7. The Sifa meeting-token proposal, written for the owner to send.

## Non-goals (moved to later slices, by owner decision)

- **Export/import** of device data: there is no device data to export until
  Slice 2 (notes, shortlist, starred talks). It ships with Slice 2.
- **Connect defaults** in `/settings`: Connect ships in Slice 3, and so do
  its defaults.
- **Flattening `web/` to the repository root.** The new app stays in `web/`
  through the swap; flattening can come later.

## Anti-goals (would make 1c a failure even if it "works")

- An old-records user signs in on the new app and finds details gone with no
  way to bring them across. (Hence: migration ships **before** the swap.)
- The migration writes anything before the person has seen and confirmed an
  item-by-item preview, or deletes old records before the copy is verified.
- The migration's extra Sifa permissions leak into ordinary sign-in.
- The CSP breaks a working feature (Wake Lock QR, link previews, sign-in to
  any PDS, analytics when enabled).

## Release order (owner's choice: migration before swap)

Three PRs, in this order, each complete and releasable on its own:

| PR | Contents | Releases to |
|---|---|---|
| **1. Foundations** | Legal pages and their links; client metadata `policy_uri`/`tos_uri`; security headers; link-preview cache limits; Delete my Lanyards data; the follow log (below); the Sifa proposal document | `next.lanyards.app` |
| **2. Migration** | The wizard, its Sifa scopes and writer, legacy schemas | `next.lanyards.app` |
| **3. Swap** | Code changes for `lanyards.app`, legacy app deletion, docs; the owner's Vercel/Cloudflare steps | `lanyards.app` |

PR 3 merges only after the owner's pre-swap checklist (below) is done.

## PR 1: foundations

### Legal pages

- **Routes:** `/privacy` and `/terms`, static content in the new app, written
  in plain British English, drafted for the owner's review and marked in the
  README as not legal advice.
- **Operator (data controller):** the owner as an individual, by name
  (Barry Prendergast, as on the repository's commits).
- **Contact:** `privacy@lanyards.app`. The owner sets up this mailbox or
  forwarding before PR 1 releases (pre-release checklist item).
- **Privacy content** (spec §14): what Lanyards reads and writes on the
  person's account; what stays on the device; what analytics collect (no
  identifiers); which third-party services the browser contacts (Bluesky,
  Sifa, ORCID, Semble, Tangled, standard.site publications' PDSes, and the
  person's own PDS; Constellation and Smoke Signal are added when Slice 2
  uses them); how to delete data (the Settings flow, plus the fact that
  records on their PDS can also be deleted with other ATProto tools); that
  ATProto data is public; the opt-out of logged-out viewing and how fast it
  reaches link previews (within an hour).
- **Terms content:** acceptable use, that ATProto data is public and
  persists on the person's PDS, no warranty, the operator and contact.
- **Links:** a footer (new; the app has none today) on every page, the
  sign-in screen, and the OAuth client metadata (`policy_uri`, `tos_uri`,
  absolute URLs from `PUBLIC_BASE_URL`).

### Security headers (from #108)

Served for every path from `web/vercel.json`:

- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  (no `preload`; that is an owner decision for later).
- `Content-Security-Policy` replacing today's `frame-ancestors 'none'`:
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self' 'unsafe-inline'` (Radix, sonner and dnd-kit set inline
    styles)
  - `img-src 'self' data: https://cdn.bsky.app` (the third-party image rule)
  - `connect-src 'self' https:` (a person's PDS can be any HTTPS host)
  - `font-src 'self'`, `manifest-src 'self'`, `worker-src 'self'`
  - `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`
- `Permissions-Policy`: deny camera, microphone, geolocation, payment and
  USB; allow `screen-wake-lock=(self)` (the QR sheet) and
  `clipboard-write=(self)` (Copy link).
- **Verification:** the e2e preview server sends the same headers (read from
  `vercel.json`, not duplicated), and the e2e suite fails on any CSP
  violation report or console error, so a CSP that breaks a feature fails CI.

### Link-preview caching (from #108)

When someone opts out of logged-out viewing, their name and badge must leave
the CDN within an hour:

- Badge images (`api/og`): `s-maxage=3600`, no long stale period (today:
  a day plus a week stale).
- Preview HTML (`api/meta`): `s-maxage=600, stale-while-revalidate` short
  enough that the total stays under an hour (today: up to a day stale).

### Delete my Lanyards data (`/settings`)

An itemised, confirmed deletion (spec §14), scoped to what exists in Slice 1:

- **Always deleted:** every record in every `app.lanyards.*` collection in the
  person's repository, current and retired (the old app's too), and all
  Lanyards data on the device (session, caches, the follow log), followed by
  sign-out.
- **Optional, unticked:** follows Lanyards created **from this device**, as
  recorded by the follow log.
- **Confirmation** shows exact counts per record type before anything is
  deleted. Deletion uses batched writes; partial failure is reported per item
  with Retry. The toast reads "Lanyards data deleted".
- **Needs permission** to delete retired `app.lanyards.*` collections. The
  current granted scopes cover only the five current collections, so deleting
  retired ones asks for the extra permission just in time (the same consent
  screen as the migration's, below).

### The follow log

Lanyards starts recording, on the device, the AT-URIs of follows it creates
(Follow button), so "Delete my data" can offer them. It is a small list in
`localStorage` (not IndexedDB/Dexie, which would add to the public lanyard's
bundle; Slice 2 moves it into Dexie with the rest of device data). Follows
made before 1c can't be identified and aren't offered; the page says so.

### Sifa meeting-token proposal

A document (spec §9.5) asking Sifa for an endpoint that issues meeting tokens
to authenticated third-party apps, using ATProto service auth
(`com.atproto.server.getServiceAuth`). Written as Markdown in
`docs/partners/`, for the owner to review and send. Not code.

## PR 2: the migration wizard

As spec §11, with these settled details:

- **Trigger:** a notice on `/lanyard` when the signed-in person has any
  retired `app.lanyards.*` record: "Move your old Lanyards profile to Sifa".
  It links to `/migrate`. Dismissable per device; always reachable from
  Settings while retired records exist.
- **Mapping:** spec §11's table, plus the row the spec lacks:
  `actor.biography.location` → `id.sifa.profile.location` (or `profile.self`
  location, whichever Sifa's own app writes; the planner confirms). Platform
  values for `link.social` are written as the bare strings Sifa's app writes
  (`#103` notes). Collection names are the real legacy NSIDs
  (`app.lanyards.link.social`, `link.work`, `link.event`, `link.web`).
- **Schemas:** the retired collections' lexicons are copied from the legacy
  `lexicons/` folder into `web/lexicons/legacy/` before PR 3 deletes the old
  app, so the wizard can validate what it reads. Sifa's `certification` and
  `project` schemas (not yet vendored) are pulled with `npm run lex:pull`.
- **Permissions:** the client metadata's scope gains the migration scopes
  (`include:id.sifa.authProfile`, plus `repo:` scopes for
  `id.sifa.profile.presentation`, `presentationDelivery` and `location`, and
  delete on the retired `app.lanyards.*` collections). Ordinary sign-in still
  requests only today's scopes; the wizard's consent step re-authorises with
  the extra ones and returns to `/migrate`.
- **Writer:** a migration-only writer with its own allow-list (Sifa targets:
  create; retired `app.lanyards.*`: delete), separate from the app's narrowed
  write helpers, using `com.atproto.repo.applyWrites` in batches within the
  PDS limit.
- **Flow:** preview in three groups (Moves to Sifa, with what each item loses;
  Stays in Lanyards; Not carried over) → consent → write → verify by
  re-reading and comparing with the preview, item by item with Retry → a
  separate Clean up old records step (all ticked) only after verification.
  Items already in Sifa are skipped (matched by DOI, URL, or title +
  organisation) and shown as such. Toasts: "Profile moved to Sifa", "Old
  records cleaned up".
- **Interrupted runs:** re-opening `/migrate` recomputes the preview from
  what is in the repository now, so a half-finished run resumes without
  duplicating (already-moved items match as "already in Sifa").

## PR 3: the swap

**Code (in the PR):**

- `PUBLIC_BASE_URL` for production becomes `https://lanyards.app`; the client
  metadata, `policy_uri`/`tos_uri` and canonical links follow from it.
- Delete the legacy Next.js app from the repository root (its `src/`,
  `lexicons/`, config and dependencies), after PR 2 has copied the legacy
  schemas it needs.
- Update CLAUDE.md (drop the legacy app, its paths and its lexicon workflow;
  describe `web/` as the app) and the README (deployment now targets
  `lanyards.app`).
- Close #88 (legacy-app bug) as no longer applicable.

**Owner steps (listed in the PR, done in order at release):**

1. In Vercel, move `lanyards.app` (and `www`) from the legacy project to
   `lanyards-next`; set `PUBLIC_BASE_URL=https://lanyards.app` for
   Production; redeploy.
2. Make `next.lanyards.app` a permanent redirect to `lanyards.app` (Vercel
   domain redirect), keeping the path.
3. Check `https://lanyards.app/oauth-client-metadata.json`, sign in, and run
   the smoke checks.
4. Delete the legacy Vercel project.

**What people will notice:** everyone signs in again once (sessions belong
to the old origin), and the old app's sessions end. Old beta links keep
working through the redirect.

## Pre-swap checklist (owner)

PR 3 merges only when these are done:

- [ ] Lexicons published (so sign-in can ask for the granular permissions)
- [ ] `privacy@lanyards.app` receives mail
- [ ] Legal page text reviewed and accepted
- [ ] Manual checks from Slices 1b and 1c done on `next.lanyards.app`
  (screen reader, phone QR, Sifa edit links, a real migration on the owner's
  own account)

## Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| **Migration before swap** (three PRs: foundations, migration, swap) | Old app runs one or two PRs longer; nobody loses visible data at the swap | **Chosen** by the owner |
| Swap first, migration after | Old app gone soonest; the ~7 old-record users see details missing until the wizard ships | Rejected: fails the "nobody loses what they could see" anti-goal |
| One large PR | One review, but a very large change with all the risk at once | Rejected: slow to review, risky |

Migration scope: the owner chose the **full wizard as specced** over a
simpler one-screen version or a by-hand migration, despite the small number
of people affected.

## Decided by the owner

- Why: retire the old app; anything not needed for the swap waits.
- Release order: migration before swap, three PRs.
- Migration: the full wizard.
- Settings: Delete my data only; export/import and connect defaults wait.
- `next.lanyards.app`: permanent redirect to `lanyards.app`.
- Repository layout: keep `web/`.
- Legal: operator is the owner as an individual; contact
  `privacy@lanyards.app`.
- Opted-out previews leave the CDN within an hour.

## My calls (correctable)

- The exact CSP and Permissions-Policy above, and testing them in e2e.
- No HSTS `preload` for now.
- The follow log in `localStorage` until Slice 2's Dexie.
- Delete-my-data asks for the retired-collection permission just in time.
- The migration notice on `/lanyard` plus `/migrate`, and a migration-only
  writer.
- The Sifa proposal as Markdown in `docs/partners/`.
- Legal pages as static routes in the app, with a new footer.

## Left to the builder

- Component structure, copy details within the tone above, and test design.
- Batch sizes for `applyWrites` (within the PDS limit).
- How the e2e preview reads headers from `vercel.json`.
- Whether `location` goes to `id.sifa.profile.location` or `profile.self`
  (confirm what Sifa's own app writes).
