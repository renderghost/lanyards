# Lanyards rebuild: attendee experience design

- **Date:** 2026-11-10
- **Status:** Draft for review
- **Scope:** Attendee experience (v1). Organiser, speaker, exhibitor and super-admin experiences come later.
- **Branch:** `claude/lanyards-rebuild-attendee-ux-vcl1sb`

---

## 1. Summary

Lanyards is being rebuilt from the ground up as a **front-end-only, installable PWA** that helps people network at conferences using data they already have on the AT Protocol.

- **The lanyard:** each attendee gets a conference-ready **lanyard**: a beautiful link-in-bio page with a badge hero and QR code. It is built automatically from their Bluesky, Sifa, standard.site, ORCID and Tangled data, so they never have to fill in forms.
- **Event packs:** every event they attend becomes a **pack** that follows the event lifecycle, from preparing and finding who's going, through meeting people and connecting in one tap, to staying in touch and reminiscing afterwards.

Lanyards prefers widely used community lexicons (`app.bsky.*`, `id.sifa.*`, `community.lexicon.calendar.*`, `site.standard.*`, `at.youandme.*`). It writes its own `app.lanyards.*` records only where nothing else fits.

---

## 2. Goals, non-goals and success criteria

### Goals

1. Make networking at events easier, not a chore.
2. Help attendees discover who's going and follow them, individually or all at once.
3. Make meeting someone in person a one-tap exchange: follow on Bluesky, vouch "we met in person", and remember the event.
4. Give a useful brief intro to anyone you meet, including people who don't use Lanyards.
5. Support the whole event lifecycle: prepare → get there → network → participate → after.
6. Never ask people to re-create content that already exists on their ATProto account.

### Non-goals (v1)

- Organiser, speaker, exhibitor and super-admin features.
- Perks, gifts and vouchers. Their data comes from exhibitors and organisers, so they are deferred until those features exist.
- Our own backend, database, indexer or sessions.

### Success criteria

- A new user goes from sign-in to a usable lanyard and QR in **under 30 seconds** without filling in any form.
- Scanning a QR code and connecting takes **one tap** for a signed-in attendee and works with **no signal** (queued).
- An attendee can see who's going to their event and follow a reviewed selection in **one action**.
- The public lanyard renders a person-specific link preview when shared on Bluesky.
- WCAG 2.2 AA throughout, with AAA where feasible (see §15).
- Initial JS for the public lanyard route is **≤ 200 KB gzipped**, and LCP is **< 2.5 s** on a mid-range phone over 4G.

---

## 3. Principles

1. **Read, don't author.** Show recent, relevant content from the user's existing records. Authoring is limited to the few `app.lanyards.*` records with no equivalent elsewhere.
2. **Community lexicons first.** A new `app.lanyards.*` lexicon needs a written justification in this spec.
3. **Front-end only.** The only server code is one stateless edge function for link previews. It has no database, sessions or secrets.
4. **Public by default, honest about it.** Every write is public on ATProto, and the UI says so at the moment of writing. Anything private stays on the device.
5. **Lightweight.** Fast on bad venue Wi-Fi, usable offline, few screens, no busywork.
6. **Respect people who aren't Lanyards users.** Intros show only public data, and blocks, mutes, labels and opt-outs are honoured everywhere.

---

## 4. Decision log

These decisions were agreed in the 2026-11-10 brainstorming session.

| # | Topic | Decision |
|---|---|---|
| 1 | Audience | Design for all attendee types equally; per-person toggles decide what shows |
| 2 | Front-end only | Static app plus one stateless edge function (link previews only) |
| 3 | Form factor | Installable, mobile-first PWA with an offline-capable pack and QR |
| 4 | Existing users | One-click migration of old `app.lanyards.*` records (§11) |
| 5 | Sifa writes | Read-only, with "Edit on Sifa" links; the migration is the single exception |
| 6 | Visitor without account | Offer account creation through the PDS OAuth sign-up flow |
| 7 | First run | Instant lanyard built automatically; tweak later |
| 8 | Default visibility | Smart defaults: basics, current job and links on; posts, publications and education opt-in (§7.3) |
| 9 | QR target | Event-aware URL while a pack is active, otherwise the plain profile URL |
| 10 | Customisation | Accent theme, block order, block and per-item toggles |
| 11 | Per-event lanyard | One base lanyard plus per-event overrides |
| 12 | Settings storage | One consolidated `app.lanyards.actor.lanyard` record |
| 13 | Scan flow | Native camera → web page; actions shown when signed in |
| 14 | Meeting record | Bluesky follow + `at.youandme.connection` + a "People I met at X" Bluesky starter pack; Sifa meetings later |
| 15 | Sifa meetings | Ship without; draft a proposal to Sifa for a third-party token endpoint |
| 16 | Vouch | The youandme connection is the "met in person" vouch; no new lexicon |
| 17 | Connect action | One tap writes everything, with an undo toast; behaviour configurable in settings |
| 18 | Reciprocity | Connect-back inbox built from backlinks |
| 19 | Adding packs | Auto from my RSVPs, RSVP in Lanyards, paste a link, scan an event QR |
| 20 | Who's going | RSVP "going", RSVP "interested", organiser starter packs |
| 21 | Follow-all | Review list (pre-ticked), then follow in batches |
| 22 | Met list | A Bluesky starter pack, so others can follow everyone you met |
| 23 | Intro card | Job, blog posts, publications, links, plus all the extras in §7.2 |
| 24 | Card order | Owner's order, with a Lanyards-supplied shared-context strip on top |
| 25 | List tools | Smart sort, role badges and filters, search, hide already-followed |
| 26 | Links | Bluesky profile links + Sifa external accounts + Lanyards web links, merged |
| 27 | ORCID trust | Two-way link check only; no ORCID sign-in |
| 28 | Publications | ORCID works + Sifa publications, deduplicated by DOI |
| 29 | Blogs | standard.site only |
| 30 | Pack shape | Time-aware home (Before / During / After); multiple upcoming packs supported |
| 31 | Prepare | Shortlist, event lanyard set-up, add to calendar, pre-event intro post |
| 32 | Get there | Offline download, venue and directions, ticket / RSVP status |
| 33 | Programme | Sifa talks linked to the event, plus a link to the official schedule; star talks privately |
| 34 | App home | Now/next hero plus a pack wallet |
| 35 | Side events | Out of scope; each event is its own pack |
| 36 | During | "Show my QR" is the primary action |
| 37 | Perks | Deferred |
| 38 | Stay in touch | People met with intros, unreciprocated nudge, thank-you post prompt |
| 39 | Reminisce | Recap screen, my posts from the event, talk resources, shareable recap card |
| 40 | Safety | Blocks always; plus mutes and labels, and removing a connection |
| 41 | Notifications | In-app only, with an app badge where supported |
| 42 | Private notes | Device only (IndexedDB), with export/import |
| 43 | Online visitors | Follow only; Connect (and therefore the vouch) only from a QR scan |
| 44 | URLs | QR encodes a stable DID URL; shareable links use the handle |
| 45 | Pack = RSVP | Adding a pack always writes a standard RSVP |
| 46 | Public event page | Yes, at `/e/<did>/<rkey>` |
| 47 | Unmappable old data | Keep as `app.lanyards.*` records (§11) |
| 48 | Old records after migration | Offer deletion as a separate, explicit step |
| 49 | Lanyard look | Badge hero + link-in-bio blocks |
| 50 | Theming | System light/dark plus 8 accessible accent palettes |
| 51 | Build order | Lanyard → Packs → Meet → After |
| 52 | Launch | Beta on `next.lanyards.app`, then swap `lanyards.app` after Slice 1 |
| 53 | Organiser packs | Taken from starter-pack links in the event's `uris[]` |
| 54 | Analytics | Privacy-first and cookieless |
| 55 | Dependencies | Constellation, Sifa AppView, Smoke Signal search, Bluesky public AppView |
| 56 | Language | British English, i18n-ready |
| 57 | Accessibility | WCAG 2.2 AA + AAA where feasible |
| 58 | Leaving | Itemised deletion: Lanyards records always; shared-lexicon records opt-in |
| 59 | Architecture | Vite + React SPA (TanStack Router/Query), PWA, one Vercel Edge Function |
| 60 | Semble (#75) | Optional, default-off Collections block in Slice 1, read-only from `network.cosmik.*` |
| 61 | Legal pages | `/privacy` and `/terms` in Slice 1, linked from the OAuth client metadata |
| 62 | Content reporting (#80) | Deferred to the super-admin phase; no in-app reporting in v1 |

---

## 5. Users and roles (v1)

- **Attendee (primary):** signs in with ATProto OAuth and has a lanyard and packs.
- **Visitor (signed out):** views public lanyards and event pages. Can follow on Bluesky via a deep link, or sign in or create an account to connect or RSVP.
- **Non-Lanyards attendee:** appears in attendee lists and intros using only their public data. They never need to sign up to be useful to others.

Speakers, organisers and exhibitors appear in v1 only as **role badges** derived from organiser starter packs (§8.3). Their own experiences are out of scope.

---

## 6. Information architecture

### 6.1 Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page and sign-in |
| `/@:handle` | Public | Shareable lanyard. Visitors get **Follow** only |
| `/d/:did` | Public | QR target (stable across handle changes). Optional `?e=<event-did>/<event-rkey>` adds event context. Signed-in scanners get **Connect** |
| `/e/:did/:rkey` | Public | Public event page for `at://<did>/community.lexicon.calendar.event/<rkey>` (info, venue, who's going, talks). Signed in and RSVP'd, it renders as **my pack** |
| `/home` | Signed in | Now/next hero and pack wallet |
| `/people` | Signed in | Everyone met, connect-back inbox, shortlist |
| `/lanyard` | Signed in | Preview and customise; kept-record forms |
| `/settings` | Signed in | Connect behaviour, export/import, migration, delete data |
| `/migrate` | Signed in | Migration wizard (shown only when old records exist) |
| `/oauth/callback` | — | OAuth redirect target |
| `/privacy` | Public | Privacy notice (§14) |
| `/terms` | Public | Terms of use (§14) |

### 6.2 Navigation (signed in)

- **Bottom navigation:** **Home · People · My lanyard**.
- **Show QR** is a global button on every signed-in screen. It opens a full-screen QR sheet that is event-aware when a pack is active.
- **Settings** sit behind the avatar.

### 6.3 Home: now/next hero and pack wallet

- **Hero priority:**
  1. events happening now (a carousel if several overlap)
  2. otherwise the next upcoming event within 30 days
  3. otherwise the most recent past event within 14 days (its After state)
  4. otherwise an **Add an event** call to action next to your QR
- **Wallet:** a stack of pack cards below the hero, upcoming by start date, then past by recency. Archived packs ("not going") sit in a collapsed group.
- **Connect-back:** a count badge appears on the hero and on the People tab.

### 6.4 Pack: time-aware states

Time boundaries use the event's `timezone` field when present, otherwise the device time zone.

| State | Window | Emphasis |
|---|---|---|
| Before | RSVP → `startsAt` | Set up your event lanyard, who's going and follow-all, shortlist, add to calendar, intro post, venue and directions, ticket status, download for offline |
| During | `startsAt` → `endsAt` | Big QR, recently met, connect-back inbox, now and next talks (starred first), "who's here" from the shortlist |
| After | After `endsAt` | People met, unreciprocated nudge, thank-you post, recap, my posts from the event, talk resources, recap card |

- **Missing dates:** if `endsAt` is missing, During ends at midnight of the start day in the event time zone. If `startsAt` is missing, the pack is **undated**: it shows the Overview only and sorts last.
- **Tabs:** every pack has **Overview · People · Programme · Me**, so all sections stay reachable in every state.
- **Cancelled or postponed:** an event with `status` cancelled or postponed shows a prominent banner in every state.

---

## 7. The lanyard

### 7.1 Badge hero (top, fixed position)

- **Contents:** avatar, honorific + display name, headline, current job (title · company), pronouns, and the event role badge when in an event context.
- **QR:** the QR button on the owner's own view.
- **Precedence:** Sifa `profile.self` fields override Bluesky profile fields where present (display name, avatar, pronouns).
- **Current job:** the Sifa `position` with no `endedAt`. If there are several, the most recent `startedAt` wins, and `isPrimary` is preferred where present.

### 7.2 Block catalogue

| Block `type` | Content | Source | Default |
|---|---|---|---|
| `links` | Important links with platform icons | `app.bsky.actor.link`, Sifa `externalAccount`, `app.lanyards.link.web.web` (deduplicated by normalised URL) | On |
| `talks` | Talks (at this event first when in event context) | Sifa `presentation` / `presentationDelivery` | On |
| `openTo` | Open to / here for | Sifa `openTo`, plus the event override `hereFor` | Off |
| `blogPosts` | Latest blog posts | `site.standard.document` (+ `publication` for site name/icon) | Off |
| `bskyPosts` | Latest Bluesky posts (no replies) | Bluesky `getAuthorFeed` (`posts_no_replies`) | Off |
| `publications` | Latest publications, with ORCID ✓ | ORCID works + Sifa `publication` (deduplicated by DOI) | Off |
| `skills` | Skills | Sifa `skill` | Off |
| `education` | Education | Sifa `education` | Off |
| `code` | Recent repositories | `sh.tangled.repo` | Off |
| `collections` | Curated collections and recent links | Semble `network.cosmik.collection`, `collectionLink` → `card` (URL cards, with title/site/image metadata) | Off |
| `media` | Podcasts, videos, interviews | `app.lanyards.link.media.audio` / `.video` | Off |
| `events` | Other events they're attending | Their upcoming `community.lexicon.calendar.rsvp` (going) | Off |
| `details` | Location, languages | Sifa `profile.self` (`location`, `langs`) | Off |

- **Empty blocks** never render. This applies to both owners and visitors; owners instead see a hint in the customiser.
- **Item limits:** default 3 items per list block; links default to all (at most 20). Owners can set 1–20.

### 7.3 Shared-context strip (viewer-specific, not owner-controlled)

The strip shows at the top of someone else's lanyard when you're signed in:
- "You're both at X" (a shared pack)
- "Followed by N people you follow"
- "You follow each other"
- "You connected at X · date"

It is computed by Lanyards from `getRelationships`, `getKnownFollowers` and my packs and connections. It is never stored.

### 7.4 Customisation (`/lanyard`)

- Live preview with a **View as visitor** toggle.
- **Accent:** 8 palettes, shown as swatches: `violet` (brand default), `indigo`, `plum`, `rose`, `ember`, `moss`, `teal`, `ocean`. Each palette is defined for light and dark mode and validated for the contrast in §15.
- **Blocks:**
  - drag to reorder, with **Move up / Move down** buttons for keyboard and screen-reader users
  - a visibility switch per block
  - a per-block item limit
- **Per-item hide:** the overflow menu on any item hides it (the AT-URI or URL is stored in `hidden`).
- **Badge:** a toggle for the current-job line.
- **Kept-record forms** follow CLAUDE.md's Form Standards and 4-file form structure:
  - honorific: radio buttons Dr, Prof, Mx, Mr, Ms, Mrs, Rev, plus "Other" (free text, maximum 20 characters)
  - web link: URL with validation, plus title
  - audio and video: URL, platform, title, description, type, using the existing lexicon enums
- **Saving:** changes are debounced (800 ms) to the config record via `putRecord`, with a toast: "Lanyard updated" on success, "Failed to save. Please try again." on failure.
- **Edit elsewhere:** Sifa and Bluesky-sourced blocks show **Edit on Sifa** / **Edit in Bluesky** deep links.

### 7.5 Per-event overrides (pack → Me tab)

- **Fields:** `headline` (up to 100 graphemes), `hereFor` (up to 200 graphemes) and `emphasise` (block types moved to the top for this event).
- **When they apply:** on `/d/:did?e=` and on the owner's pack views for that event.

### 7.6 QR

- **What it encodes:** `https://lanyards.app/d/<did>`, with `?e=<event-did>/<event-rkey>` while a pack is in its During state, or when the owner chose that pack in the QR sheet.
- **Overlapping events:** if several packs are in their During state, the QR sheet shows a pack picker. It defaults to the pack that started most recently. "No event" is always an option.
- **Rendering:** SVG at error-correction level M, always dark-on-light with a full quiet zone, even in dark mode, for scanner reliability.
- **QR sheet:**
  - shows the QR full-screen with name and event
  - holds a Screen Wake Lock while open (browsers cannot raise brightness)
  - offers **Copy link** as a text alternative
- **Offline:** the QR works offline; it is generated locally.

### 7.7 Visitor actions

| Visitor state | `/@:handle` | `/d/:did` |
|---|---|---|
| Signed out | **Follow on Bluesky** (deep link to bsky.app), **Sign in**, **Create account** | **Sign in to connect** (the intent survives OAuth), **Create account**, **Follow on Bluesky** |
| Signed in | **Follow** / **Following** | **Connect** (§9.1) / **Connected** |
| Blocked (either direction) | No actions; minimal page | No actions; minimal page |

The QR-only Connect rule is honest by default but not tamper-proof, since a QR URL can be shared. That is acceptable for v1 and documented on the About page.

### 7.8 ORCID verification (two-way link)

- **Finding the iD:** from a Sifa `externalAccount` with platform `id.sifa.defs#platformOrcid`.
- **The ✓ condition:** a ✓ shows when the public ORCID record's researcher URLs include `https://lanyards.app/d/<did>` or `https://bsky.app/profile/<did>`.
- **Helper:** the owner gets a **Verify your ORCID** helper. It shows the exact URL to add and deep-links to ORCID's edit page, then re-checks.
- **Unverified iDs:** publications still show, without the ✓.

---

## 8. Event packs

### 8.1 Getting a pack

1. **Auto from RSVPs:** on sign-in and on app focus, list my `community.lexicon.calendar.rsvp` records. Status `going` or `interested` creates a pack.
2. **Paste a link:** accepts Smoke Signal and Atmo event URLs, `bsky.app`-style links containing an AT-URI, and raw AT-URIs. It resolves to `/e/:did/:rkey`.
3. **Scan an event QR:** any QR resolving to an event URL opens `/e/:did/:rkey`.
4. **Search:** Smoke Signal `community.lexicon.calendar.searchEvents`.

The event page shows **Going / Interested**, and choosing one writes the RSVP (§10.2). Changing the RSVP to `notgoing` archives the pack while keeping device data.

### 8.2 Public event page and Overview

- **Details:** name, dates (shown in the event time zone, with "your time" where it differs), mode, status banner, description (plain text with facets), media thumbnail if present, and links (`uris[]`).
- **Venue:** address or coordinates with an **Open in Maps** link (a geo URI, or an Apple/Google Maps fallback).
- **RSVP:** going and interested counts.

### 8.3 Who's going

- **Sources:**
  - Constellation backlinks to the event URI, collection `community.lexicon.calendar.rsvp`, path `.subject.uri`. Records are hydrated to read `status`, and match by URI regardless of CID.
  - Organiser starter packs: entries in the event's `uris[]` that are Bluesky starter-pack URLs or AT-URIs, resolved through `getStarterPack` and `getList`.
- **Role badges:** the starter-pack name with the event name removed ("Speakers at X" → "Speakers"); fallback "Featured".
- **Sections:** **Going**, **Interested**, plus one chip per organiser role.
- **Smart sort:** mutuals → people I follow → people who follow me → everyone else. Within a tier: shortlisted, then `going` before `interested`, then alphabetical.
- **Filters:** role chips, RSVP status, **Hide people I follow**.
- **Search:**
  - covers display name, handle, headline, job title, company and skills
  - Sifa-derived fields are indexed progressively in the background (concurrency-limited), and fully indexed once the pack has been downloaded for offline use
- **Moderation:** people blocked by or blocking me are excluded. Muted people are hidden. Labels are applied according to my Bluesky moderation preferences.

### 8.4 Follow-all

- **Entry points:** the current filtered list, or a specific organiser pack.
- **Review sheet:**
  - everyone is pre-ticked
  - already-followed people are shown greyed out and unticked
  - blocked and muted people are excluded
  - the button reads **Follow 142**
- **Writes:**
  - follows go in batches of up to 200 creates per `applyWrites`
  - `via` is set to the starter pack's strongRef when following from a starter pack
  - progress is shown, and the queue is persisted in IndexedDB so it resumes on next open
- **Rate limit:** pause near 1,500 follow creates per rolling hour (the PDS limit is 5,000 points/hour at 3 points per create), and show when it will continue. A 429 response also triggers a pause.
- **Toast:** "Followed 142 people".

### 8.5 Prepare

- **Shortlist:** a star on any attendee, stored on the device. Starred people are highlighted during the event ("who's here").
- **Event lanyard set-up:** §7.5.
- **Add to calendar:** `.ics` download for the event (with the event time zone), plus a separate `.ics` of starred talks.
- **Pre-event intro post:** a prefilled, editable Bluesky post, for example "Going to X! Here's my lanyard → https://lanyards.app/@handle". It is posted only when the user taps **Post**.

### 8.6 Get there

- **Venue and directions:** §8.2.
- **Ticket / RSVP status:** RSVP status, plus an "accepted by organiser" badge where a Smoke Signal `events.smokesignal.calendar.acceptance` record references the RSVP. A "signed ticket" badge shows where the RSVP carries `signatures[]`.
- **Download for offline:** one tap prefetches the event, the attendee list, every attendee's `PersonView` and avatars, the programme, and my QR.
  - The UI shows progress and storage used. An "Available offline · updated 09:14" chip appears on the pack.

### 8.7 Programme (Participate)

- **Talks:**
  - Sifa `presentationDelivery` records whose `eventRef` points at the event, found via Constellation backlinks
  - each is hydrated with its `presentation` (title, description, links, cover image)
  - speakers, co-speakers and role are shown
- **Official schedule:** a prominent **Official schedule** link, from the event `uris[]` entry named like "schedule", "programme", "agenda" or "talks", otherwise the first event URL.
- **Starring:** star talks into a private personal agenda (device). The During state shows **Now / Next** with starred talks first.

### 8.8 During

The During state is centred on **Show my QR**, followed by:
- **recently met:** the last 5 connections at this event
- **connect-back inbox:** for this event
- **now and next:** talks
- **who's here:** shortlisted people who are going

### 8.9 After

- **People met:** everyone connected at this event, with intro cards, your private note and their latest posts.
- **Unreciprocated nudge:** "4 people connected with you at X that you haven't connected back with", which opens the inbox.
- **Thank-you post prompt:** prefilled, editable, for example "Great to meet @a @b @c at X". Mentions become facets. Text is limited to 300 graphemes; if the mentions don't fit, the most recent connections are used, with "+N more".
- **Recap screen:** people met, talks starred, the event, and dates.
- **My posts from the event:** my Bluesky posts between `startsAt` and `endsAt` + 24 h.
- **Talk resources:** links from Sifa `presentation.links` and `presentationDelivery.links` (slides, recordings, write-ups).
- **Shareable recap card:**
  - a 1200×630 image ("I met 23 people at X") generated in the browser, with alt text
  - it can be posted to Bluesky as an editable post, or saved

---

## 9. Meeting and connecting

### 9.1 Connect: one atomic batch

Scanning `/d/<A>?e=<event>` while signed in as B shows A's lanyard, the shared-context strip and **Connect**.

Tapping **Connect** sends a single `com.atproto.repo.applyWrites` to B's repo. The operations depend on B's connect defaults (§10.3, all on by default) and on current state:

1. **Follow:** create `app.bsky.graph.follow { subject: A }`, unless B already follows A.
2. **Vouch:** create `at.youandme.connection { subject: A }`, unless B already has one for A.
3. **Met pack:** if the URL carries an event and B has RSVP'd to it:
   1. If B has no met pack for that event yet, create `app.bsky.graph.list { purpose: referencelist, name }`. Then create `app.bsky.graph.starterpack { name, list, description: "People I met at X · via Lanyards" }`. Then create or update B's `app.lanyards.actor.lanyard`, adding the pack to `events[].metPacks`. The record is created with smart defaults if it doesn't exist yet.
   2. Create `app.bsky.graph.listitem { list, subject: A }`, unless A has opted out of reference lists or is already in the pack.
   3. The name is "People I met at {event name}", truncated to 50 graphemes.
4. **Not RSVP'd:** if B hasn't RSVP'd to the event, steps 1–2 run, and B is offered **I'm at X too**. That writes a `going` RSVP and then performs step 3.

Afterwards:
- **Undo:** an **Undo** toast (8 s) deletes exactly the records created. Record keys are generated client-side, and a pack created by this action is deleted only if it is empty again.
- **Note:** an optional **Add a private note** sheet opens (device only).
- **Offline:** offline connects are queued (§12.5) and show "Saved — will connect when you're back online".
- **Pack rollover:** a met pack that would exceed 150 members rolls over to "People I met at X (2)".

### 9.2 Connect-back inbox

- **Query:** Constellation backlinks on target = my DID, collection `at.youandme.connection`, path `.subject`.
- **Filtering:** excludes DIDs I already have a youandme connection for, DIDs I've dismissed, and anyone blocked, blocking me or muted.
- **Event attribution:**
  - **Precise:** read the connector's `app.lanyards.actor.lanyard` and check which `events[].metPacks` list contains me.
  - **Fallback:** the connection's `createdAt` falls within one of my packs' event windows.
  - **Otherwise:** "Connected with you".
- **Item:** "Sam connected with you · X · 2 h ago", with **Connect back** (the same batch as §9.1, with event context) and **Dismiss**.
- **Polling:** on app open and focus; every 2 minutes while visible during an active event; otherwise on open only.
- **Badge:** the count is shown on the People tab and the Home hero, and via the Badging API where supported.

### 9.3 Private notes

- **Storage:** per person, optionally per event, in IndexedDB. Notes are never synced or published.
- **Export/import:** a single JSON file (`lanyards-device-data-YYYY-MM-DD.json`) containing notes, shortlist and starred talks.
- **Clearing:** clearing site data warns that unexported notes will be lost.

### 9.4 Remove a connection

From a person's card, **Remove connection** opens a confirmation sheet with ticked options:
- delete the youandme connection
- remove them from the met pack(s)
- unfollow (unticked by default)

The chosen records are deleted in one batch, with the toast "Connection removed".

### 9.5 Sifa meetings (later)

`id.sifa.meeting` needs a `meetingToken` signed by Sifa's server, and Sifa publishes no procedure for third parties to obtain one.

- **v1:** does not write Sifa meetings.
- **Proposal to Sifa:** a written proposal will ask Sifa for an endpoint that issues meeting tokens to authenticated third-party apps. Authentication would use ATProto service auth (`com.atproto.server.getServiceAuth`).
- **Connect batch:** §9.1 has an explicit extension point for adding it once that exists.

---

## 10. Data model

### 10.1 Reads

All reads come from the browser, and all are public unless noted.

| Data | Lexicon / endpoint | Via |
|---|---|---|
| Profile basics | `app.bsky.actor.profile` | Bluesky AppView `getProfile(s)` |
| Profile links | `app.bsky.actor.link` | PDS `getRecord` (refs in `profile.links[]`) |
| Posts | `app.bsky.feed.post` | AppView `getAuthorFeed` |
| Relationships | `getRelationships`, `getKnownFollowers` (auth) | AppView via PDS proxy |
| Moderation prefs, mutes, blocks | `getPreferences`, `getMutes`, `getBlocks` (auth) | AppView via PDS proxy |
| Starter packs and lists | `getStarterPack(s)`, `getList` | AppView |
| Professional profile | `id.sifa.profile.*` | Sifa `id.sifa.getProfileView`; PDS `listRecords` fallback |
| Talks | `id.sifa.profile.presentation`, `presentationDelivery` | Sifa view / PDS; Constellation for event backlinks |
| Blog posts | `site.standard.document`, `site.standard.publication` | PDS `listRecords` |
| Publications | ORCID `/v3.0/{id}/works`, `/researcher-urls` | `pub.orcid.org` (CORS `*`) |
| Code | `sh.tangled.repo` | PDS `listRecords` |
| Collections and links | `network.cosmik.collection`, `network.cosmik.collectionLink`, `network.cosmik.card` | PDS `listRecords` |
| Events | `community.lexicon.calendar.event` | PDS `getRecord` |
| RSVPs | `community.lexicon.calendar.rsvp` | Own PDS `listRecords`; Constellation backlinks for attendees |
| Ticket acceptance | `events.smokesignal.calendar.acceptance` | Constellation backlinks / PDS |
| Event search | `community.lexicon.calendar.searchEvents` | `smokesignal.events` XRPC (CORS `*`) |
| Connections to me | `at.youandme.connection` | Constellation backlinks |
| Lanyards data | `app.lanyards.*` | PDS |

### 10.2 Writes

| Record | When | Slice |
|---|---|---|
| `app.lanyards.actor.lanyard` | Customisation, event overrides, met-pack refs | 1 |
| `app.lanyards.actor.biography.honorific` | Honorific form | 1 |
| `app.lanyards.link.web.web` | Web link form | 1 |
| `app.lanyards.link.media.audio` / `.video` | Media forms | 1 |
| `id.sifa.profile.*` | Migration only | 1 |
| Deleting old `app.lanyards.*` records | Migration clean-up, data deletion | 1 |
| `community.lexicon.calendar.rsvp` | Going / Interested / Not going | 2 |
| `app.bsky.graph.follow` | Follow, follow-all, connect | 1 (visitor follow), 2, 3 |
| `app.bsky.feed.post` + image blobs | Intro, thank-you and recap posts | 2, 4 |
| `at.youandme.connection` | Connect | 3 |
| `app.bsky.graph.list` / `listitem` / `starterpack` | Met pack | 3 |

### 10.3 New lexicon: `app.lanyards.actor.lanyard`

- **Justification:** presentation settings, event overrides and met-pack references have no equivalent in any community lexicon.
- **Key:** `literal:self`.

| Field | Type | Notes |
|---|---|---|
| `accent` | string, knownValues `violet`, `indigo`, `plum`, `rose`, `ember`, `moss`, `teal`, `ocean` | Default `violet` |
| `showJob` | boolean | Badge current-job line; default true |
| `blocks` | array of `#block` (maximum 20) | Ordered |
| `#block.type` | string, knownValues per §7.2 | Required |
| `#block.visible` | boolean | Required |
| `#block.limit` | integer 1–20 | Optional |
| `hidden` | array of string (AT-URI or URI), maximum 500 | Per-item hides |
| `connect` | `#connectPrefs { follow, vouch, metPack }` (booleans) | Defaults all true |
| `events` | array of `#eventOverride` (maximum 200) | |
| `#eventOverride.event` | string, format `at-uri` | Required; matched by URI |
| `#eventOverride.headline` | string, up to 100 graphemes | |
| `#eventOverride.hereFor` | string, up to 200 graphemes | |
| `#eventOverride.emphasise` | array of block types | |
| `#eventOverride.metPacks` | array of `at-uri` (starter packs) | Supports 150-member rollover |
| `createdAt`, `updatedAt` | datetime | `createdAt` required |

When the record is absent, Lanyards uses the smart defaults in §7.2. The first customisation creates the record.

### 10.4 Kept lexicons (unchanged NSIDs and schemas)

The following stay exactly as they are today, so existing records remain valid, and are available to new users:
- `app.lanyards.actor.biography.honorific`
- `app.lanyards.link.web.web`
- `app.lanyards.link.media.audio`
- `app.lanyards.link.media.video`

All other `app.lanyards.*` lexicons are retired. They are read only by the migration wizard.

### 10.5 Lexicon publishing

- **Records:** publish every active `app.lanyards.*` lexicon, plus a permission set `app.lanyards.authFull` (repo access to those collections), as `com.atproto.lexicon.schema` records in a `lanyards.app` ATProto account.
- **DNS:** add `_lexicon.lanyards.app TXT "did=<did>"`.
- **Why:** this lets OAuth request `include:app.lanyards.authFull`. bsky.social currently rejects it because the schema can't be resolved.

### 10.6 OAuth scopes

- **Requested at sign-in (Slice 1):** `atproto`, `include:app.lanyards.authFull`, `repo:app.bsky.graph.follow`, plus `rpc` scopes for the authenticated AppView reads in §10.1.
- **Later slices:** each adds its scopes to the client metadata as it ships. Existing sessions get a just-in-time consent prompt the first time a feature needs a new scope.
  - **Slice 2:** `repo:community.lexicon.calendar.rsvp`, `repo:app.bsky.feed.post?action=create`, `blob:image/*`
  - **Slice 3:** `repo:at.youandme.connection`, `repo:app.bsky.graph.list`, `repo:app.bsky.graph.listitem`, `repo:app.bsky.graph.starterpack`
- **Migration only:** `include:id.sifa.authProfile`, requested on the migration screen.
- **Fallback:** for PDSes that don't support granular scopes, fall back to `transition:generic` and log it to analytics, without any identifiers.

### 10.7 Device data (IndexedDB via Dexie)

| Store | Contents |
|---|---|
| `notes` | `{ did, eventUri?, text, updatedAt }` |
| `shortlist` | `{ did, eventUri, addedAt }` |
| `starredTalks` | `{ deliveryUri, eventUri, addedAt }` |
| `dismissed` | Connect-back and nudge dismissals |
| `writeQueue` | Pending offline batches (connect, RSVP) and follow-all progress |
| `queryCache` | Persisted TanStack Query cache (offline packs) |

---

## 11. Migration from the current Lanyards

- **Trigger:** shown when the signed-in user has any retired `app.lanyards.*` record.
- **Preview first:** the wizard writes nothing until the user confirms a full, item-by-item preview.

| Old record | Destination | Notes |
|---|---|---|
| `actor.biography.affiliation` | `id.sifa.profile.position` | role → title, organizationName → company, dates. Lost: organizationType, isPrimary, location, website (listed in preview) |
| `actor.biography.qualification` | `id.sifa.profile.education` (degree types) or `id.sifa.profile.certification` (certificate types) | yearAwarded → endedAt |
| `actor.biography.skill` | `id.sifa.profile.skill` | Lost: proficiency, yearsOfExperience |
| `link.social.social` | `id.sifa.profile.externalAccount` | platform mapped to Sifa platform values |
| `link.work.work` (+ `link.work.publication` venue) | `id.sifa.profile.publication` | DOI and venue kept |
| `link.event.event` | `id.sifa.profile.presentation` + `presentationDelivery` | eventName, date, location, role, links (relatedWorks → links) |
| `link.media.code` | `id.sifa.profile.project` | name, url, description |
| `actor.biography.honorific` | Kept as is | |
| `link.web.web` | Kept as is | |
| `link.media.audio` / `.video` | Kept as is | |
| `actor.biography.identity`, `actor.profile.content`, `pinned`, `visible`, `theme`, `collection` | Not carried over | New defaults apply |

**Flow:**
1. **Preview:** three groups: **Moves to Sifa** (with field-loss notes; items already in Sifa are skipped, matched by DOI, URL, or title + organisation), **Stays in Lanyards**, and **Not carried over**.
2. **Consent and write:** confirming requests the Sifa scope, then writes in batches through `applyWrites`.
3. **Verify:** re-read the written records and compare them with the preview. Any mismatch is reported item by item with Retry.
4. **Clean up:** a separate **Clean up old records** step lists the retired records, all ticked, to delete. This is offered only after verification.
5. **Toasts:** "Profile moved to Sifa", "Old records cleaned up".

---

## 12. Architecture

### 12.1 Stack

- **Core:** Vite + React + TypeScript (strict).
- **Routing and data:** TanStack Router (file-based, type-safe) and TanStack Query.
- **UI:** Tailwind CSS v4 with the existing brand tokens (`#4020DF` purple scales, DM Sans / DM Serif Text / DM Mono), and Radix primitives through shadcn components.
- **ATProto:** `@atcute/client` and `@atcute/oauth-browser-client` (v5, which uses PKCE, PAR and DPoP). Lexicon types come from `@atcute/lex-cli`, with third-party schemas pinned from their published records.
- **Device and offline:** Dexie (IndexedDB), and `vite-plugin-pwa` (Workbox).
- **Utilities:** `qrcode` (SVG) and Lingui (i18n, `en-GB` catalogue).
- **Analytics:** PostHog in cookieless mode (`persistence: 'memory'`, `person_profiles: 'never'`, autocapture off, explicit event list, exception capture), respecting Do Not Track.

### 12.2 Units

| Unit | Responsibility | Depends on |
|---|---|---|
| `lib/atproto` | XRPC clients per PDS, DID/handle resolution (cached), OAuth session, and the **write builder** (typed `applyWrites` operations, client-side record keys, optimistic cache updates, undo handles) | atcute |
| `lib/sources/<name>` | One adapter per source: `bluesky`, `sifa`, `standardSite`, `orcid`, `tangled`, `semble`, `calendar`, `constellation`, `smokesignal`, `lanyards`. Contract: `(did \| uri) → Promise<Result<NormalisedType, SourceError>>`. Adapters never import each other | `lib/atproto` |
| `lib/person` | Composes adapters into `PersonView`; deduplication (URL normalisation, DOI); applies owner config (order, visibility, limits, hidden, event overrides); shared-context computation | `lib/sources` |
| `lib/events` | Pack model, Before/During/After state machine, attendee aggregation, smart sort, programme assembly | `lib/sources` |
| `lib/device` | Dexie stores, export/import, write queue | Dexie |
| `lib/query` | Query client, key factory, IndexedDB persister, offline prefetch | TanStack Query |
| `features/*` | `auth`, `lanyard`, `connect`, `packs`, `people`, `recap`, `migration`, `settings`: routes, forms and feature components | `lib/*`, `components` |
| `components/` | Design system (4-file structure), accent palettes, icons | Tailwind, Radix |
| `api/meta` | Vercel Edge Function (§12.4) | Public HTTP only |

### 12.3 Data flow: opening a lanyard

1. The router loader starts `personView(did)`.
2. The adapters run in parallel.
3. Each block renders progressively behind its own boundary, with a skeleton. A slow or failed source never blocks the badge hero.
4. The context strip queries run independently.
5. The results are cached and persisted.

### 12.4 Edge function (`api/meta`)

Vercel rewrites `/@:handle`, `/d/:did` and `/e/:did/:rkey` to the function.

- **Fetches:** public profile data (Bluesky + Sifa headline) or the event record.
- **Injects:** `<title>`, description, canonical, and Open Graph and Twitter tags into the built `index.html`, then returns it.
- **Images:** `/og/p/:did.png` and `/og/e/:did/:rkey.png` render 1200×630 badge-style images with Satori.
- **Caching and constraints:** responses use `s-maxage=600, stale-while-revalidate=86400`. No secrets, no storage.
- **Failure:** on any failure, the plain `index.html` is served with default meta.

### 12.5 Offline

- **Caching:**
  - the app shell is precached
  - avatars and blobs are cache-first (capped at 2,000 entries / 200 MB, oldest first)
  - data comes from the persisted query cache
- **Write queue:** offline writes (Connect, Connect back, RSVP) are queued as complete batches in `writeQueue`. They replay in order when signal returns, with idempotency checks (skip anything that now exists). The UI shows a pending state until each batch is confirmed.
- **Follow-all** uses the same queue, so its progress survives reloads.

### 12.6 Environments and hosting

| Environment | URL | OAuth client |
|---|---|---|
| Local | `http://127.0.0.1:5173` | Loopback client (`http://localhost?redirect_uri=http://127.0.0.1:5173/oauth/callback&scope=…`); redirect URIs always use `127.0.0.1` |
| Beta | `https://next.lanyards.app` | `https://next.lanyards.app/oauth-client-metadata.json` |
| Production | `https://lanyards.app` | `https://lanyards.app/oauth-client-metadata.json` |

- **Client metadata:** generated at build time per environment. It includes `client_name`, `logo_uri`, `policy_uri` (`/privacy`) and `tos_uri` (`/terms`).
- **Hosting:** Vercel static hosting plus `api/meta`.
- **Housekeeping:** the stale Hugo Pages workflow is removed, and CLAUDE.md's Tech Stack and OAuth sections are updated for the new stack in Slice 1. The project conventions are unchanged.

### 12.7 Public client session limit

Browser-only ATProto OAuth sessions last about 2 weeks.

- **Refresh:** Lanyards refreshes silently while the session is valid.
- **Expiry:** after expiry it asks the user to sign in again and returns to the same route with any pending intent.
- **Before an event:** packs in their Before state within 3 days of the start show "Sign in again before the event" if the session expires before `endsAt`.

---

## 13. Error handling

| Failure | Behaviour |
|---|---|
| A single source fails (Sifa, ORCID, standard.site, Tangled) | The block is hidden for visitors. Owners see "Couldn't load {source} · Retry". The rest of the page renders |
| Bluesky AppView unavailable | Full-page error with Retry. Cached data is shown if available, marked "Offline copy" |
| Constellation unavailable | Who's going shows organiser packs only, with "Attendee list unavailable right now". The inbox shows its cached state with "Last checked HH:MM" |
| Smoke Signal search unavailable | "Search is unavailable right now — paste an event link instead" |
| Write fails online | `applyWrites` is atomic, so nothing is partially written. Toast: "Failed to connect. Please try again." with Retry |
| Write while offline | Queued; toast "Saved — will connect when you're back online" |
| Validation (kept-record forms) | Inline errors under fields, `aria-invalid`, `aria-describedby`, focus moves to the first error, input preserved |
| Rate limit (429) | Exponential backoff; follow-all pauses and shows when it will resume |
| Session expired or refresh failed | Sign in again, preserving the route and intent |
| Missing scope | Just-in-time consent prompt explaining why it's needed |
| Handle not found at `/@:handle` | "We couldn't find @handle" with search. QR links are unaffected (DID) |
| Event cancelled or postponed | Prominent banner; pack kept |
| Met pack full (150) | Roll over to "(2)" |
| Person has opted out of reference lists | Skip the met-pack step; follow and vouch still happen |
| Edge function failure | Default meta served; the app works normally |

All caught errors are reported to analytics with their error class and source name, and no identifiers. Nothing is swallowed silently.

---

## 14. Privacy, safety and data deletion

- **Public by default:** every public write is labelled at the point of action, for example "Connections are public on your ATProto account".
- **Private data stays local:** private data (notes, shortlist, starred talks) never leaves the device unless exported.
- **Blocks:** honoured in both directions on every surface; blocked users never appear and can't be connected to.
- **Mutes and labels:** muted accounts are hidden from lists. Moderation labels and labeller preferences come from `getPreferences` and are applied to cards and lists.
- **Safe rendering:**
  - record text is rendered as text with facets, never as HTML
  - URLs pass a scheme allowlist (`https`, `http`, `mailto`)
  - external links use `rel="noopener noreferrer"`
- **Analytics:** contain no DIDs, handles, names or URLs.
- **Legal pages:**
  - `/privacy` explains, in plain English:
    - what Lanyards reads and writes on the user's account
    - what stays on the device
    - what analytics collect
    - which third-party services the browser contacts (Bluesky, Sifa, Constellation, Smoke Signal, ORCID, Semble)
    - how to delete data
  - `/terms` covers acceptable use and the fact that ATProto data is public.
  - Both are linked from the footer, the sign-in screen and the OAuth client metadata.
  - Text is drafted for the owner's review and is not legal advice.
- **Delete my Lanyards data** (Settings) is itemised:
  - Always deleted: all `app.lanyards.*` records and all device data.
  - Optional, unticked by default: youandme connections, met starter packs (and their lists and list items), RSVPs written by Lanyards, and follows created through Lanyards. Lanyards keeps a device-side log of records it created to support this. When the log is gone, it falls back to youandme connections and met packs, which can be identified by collection and name.
  - The confirmation lists exact counts per record type, and the toast reads "Lanyards data deleted".

---

## 15. Accessibility

- **Target:** WCAG 2.2 AA, plus AAA where feasible.
- **Contrast:**
  - body text and essential UI meet **7:1** in every accent palette, in light and dark mode
  - all other text meets 4.5:1 minimum, and non-text UI meets 3:1
- **Touch targets:** at least 44×44 px; Connect and the QR controls are at least 56 px tall.
- **Keyboard:** full keyboard operation. Drag-to-reorder has Move up / Move down equivalents. Focus is always visible (the brand focus ring, yellow in dark mode), and focus is managed on sheets and dialogs.
- **Screen readers:**
  - every input has a visible label
  - live regions announce connect results, follow-all progress, loading and save states
  - the QR has a text alternative (link plus copy button)
  - generated images have alt text
- **Motion:** `prefers-reduced-motion` is respected; no essential information is conveyed by motion.
- **Text:** all text sets `leading-*`, and the layout holds at 200% zoom and 320 px width.
- **Testing:** axe in component and end-to-end tests; manual passes with VoiceOver (iOS/macOS) and TalkBack (Android) before each slice ships.

---

## 16. Testing and quality

- **TDD:** red-green-refactor for all logic.
- **Unit (Vitest):**
  - every source adapter against fixtures captured from real public records
  - `PersonView` composition, deduplication and ordering
  - the write builder and undo
  - every migration mapping and its field-loss report
  - the pack state machine (time zones, missing dates, overlaps)
  - smart sort
  - rate-limit pacing
  - write-queue replay and idempotency
- **Contract:** fixtures and every record Lanyards writes are validated against the pinned published lexicons (ours and third-party).
- **Component (Testing Library + axe):** forms, blocks, sheets, the QR sheet and the inbox.
- **End-to-end (Playwright, network mocked with MSW, `--trace off`):**
  - first run
  - public lanyard (signed out and in)
  - scan → connect → undo
  - offline connect and replay
  - follow-all batching and pause
  - add pack → RSVP
  - migration preview → write → verify → clean-up
- **Staging smoke:** a scripted run against a dedicated test account on bsky.social before each beta release.
- **Budgets (CI):**
  - public lanyard initial JS ≤ 200 KB gzipped
  - Lighthouse mobile: LCP < 2.5 s, CLS < 0.1, PWA installable
  - no lint or type errors
- **Definition of done** follows CLAUDE.md's Quality Checklist, adapted to the new commands.

---

## 17. Delivery slices

Each slice is complete, tested and shippable to `next.lanyards.app`, and gets its own implementation plan.

### Slice 1: Lanyard (with foundations and migration)

- **Foundations:**
  - scaffold, brand tokens, accent palettes, design-system primitives
  - PWA shell, i18n, analytics, CI with budgets
  - environments and the Vercel project
  - lexicon publishing and `app.lanyards.authFull`
  - OAuth (sign-in, sign-up via the PDS, scopes, session handling)
- **Adapters and model:** `bluesky`, `sifa`, `standardSite`, `orcid`, `tangled`, `semble` (#75), `lanyards`; `PersonView`.
- **Public pages:** `/@:handle` and `/d/:did` (without event context), and the `api/meta` edge function with OG images. In this slice, `/d/:did` offers **Follow** to signed-in scanners; **Connect** replaces it in Slice 3.
- **Navigation:** the signed-in landing page is `/lanyard`, with Settings behind the avatar. The Home tab arrives in Slice 2 and the People tab in Slice 3.
- **Lanyard:**
  - `/lanyard` customisation and kept-record forms
  - the plain QR sheet with Wake Lock
  - visitor Follow / Sign in / Create account
  - the ORCID verify helper
- **Migration and settings:** the migration wizard and clean-up; `/settings` (connect defaults stored for later slices, export/import, itemised delete).
- **Housekeeping:** update CLAUDE.md; remove the stale Hugo workflow.
- **Legal pages:** `/privacy` and `/terms` (§14), with `policy_uri` and `tos_uri` in the OAuth client metadata.
- **Partner deliverable (not code):** the Sifa meeting-token proposal (§9.5), sent early because of partner lead time.
- **Exit:** `lanyards.app` swaps over to the new app, and the old app is retired.

### Slice 2: Packs (prepare and get there)

- **Adapters:** `calendar`, `constellation`, `smokesignal`.
- **Packs:**
  - packs from RSVPs; adding by link, QR or search; RSVP writes
  - the `/e/:did/:rkey` public page
  - `/home` hero and wallet, and the Before state
- **Who's going:** sources, role badges, smart sort, filters, search, and follow-all with its queue.
- **Preparation:**
  - shortlist, event overrides, `.ics`, intro post
  - venue and directions, ticket status
  - programme (Sifa talks, official schedule link, starring)
  - download for offline

### Slice 3: Meet (during)

- Event-aware QR, Connect batch with undo, met starter packs with rollover and opt-out, "I'm at X too".
- Connect-back inbox with attribution and badge, the `/people` tab, private notes, remove connection.
- The offline write queue for connects, and the During state.

### Slice 4: After

- After state, people met, unreciprocated nudge, thank-you post.
- Recap screen, my posts from the event, talk resources, shareable recap card.

---

## 18. Out of scope (later)

- **Other experiences:** organiser, speaker, exhibitor and super-admin experiences (including formalising organiser starter packs and a programme/schedule lexicon).
- **Content reporting and moderation (#80):** deferred to the super-admin phase. The ATProto-native route is reporting via `com.atproto.moderation.createReport` plus a Lanyards labeller (Ozone). Until then, Bluesky blocks, mutes and labels apply (§14).
- **Data-dependent features:** perks, gifts and vouchers; side events and event grouping; Sifa meetings (pending the Sifa proposal).
- **Platform extras:** push notifications, native wrapper, NFC, Wallet passes, lock-screen QR.
- **Smaller deferrals:** contact export (vCard/CSV), languages other than British English, and private "watching" packs without an RSVP.

---

## 19. Dependencies and risks

| Dependency / risk | Impact | Mitigation |
|---|---|---|
| Constellation (microcosm) availability | Attendee lists, inbox, programme | Graceful fallbacks (§13); adapter isolation lets us switch indexes later |
| Sifa lexicons are alpha and may change | Profile blocks, migration | Pinned schemas, contract tests, `listRecords` fallback |
| Sifa AppView availability | Profile blocks | PDS `listRecords` fallback |
| Smoke Signal search availability | Event search only | Paste a link / QR still work |
| `at.youandme.connection` is owned by a third party | Vouch semantics | Pinned schema; minimal fields (`subject`, `createdAt`); revisit if it changes |
| Granular OAuth scopes not supported by every PDS | Sign-in on smaller PDSes | `transition:generic` fallback |
| Two-week browser sessions | Signed out mid-event | Pre-event re-sign-in prompt (§12.7) |
| Starter packs list people without asking | Social friction | Respect `referencelistoptout`; one-tap removal; clear naming |
| Attendee hydration cost on large events | Slow lists | Progressive loading, concurrency limits, caching, offline prefetch |

---

## 20. Verification tasks for the Slice 1–2 plans

These are facts to confirm during planning. Each has a defined fallback, so no requirement depends on the outcome.

| # | Verify | Fallback |
|---|---|---|
| 1 | Exact `rpc:`/`repo:`/`include:` scope strings accepted by bsky.social for §10.6 | `transition:generic` |
| 2 | Constellation path for `presentationDelivery.eventRef` (expected `.eventRef.uri`) | Read speakers' records from the Sifa view of each attendee |
| 3 | How to detect `app.bsky.graph.referencelistoptout` for a subject | Check the subject's repo with `listRecords` |
| 4 | Mapping Smoke Signal `searchEvents` results to AT-URIs (the result has `url`, no `uri`) | Parse the AT-URI from `url`, or resolve it with `calendar.getEvent` |
| 5 | Current Bluesky starter-pack membership cap (expected 150) | Use the cap the AppView enforces, read from the error |
| 6 | `id.sifa.getProfileView` coverage (presentations, projects, external accounts) | Per-collection `listRecords` for anything missing |
| 7 | Record hydration for large RSVP sets: direct PDS reads vs microcosm Slingshot cache | Direct PDS reads with concurrency limits (Slingshot needs explicit approval as an extra dependency) |
| 8 | That `include:id.sifa.authProfile` covers every migration target collection (§11) | Request `repo:` scopes per collection |
| 9 | How to find the Smoke Signal `acceptance` record for an RSVP (it references a CID, which may not be backlink-indexed) | Show RSVP status only, with no "accepted" badge |
| 10 | Semble's public profile and collection URL format, for "View on Semble" links | Link each card to its own URL and omit the Semble link |

---

## 21. Sources

- Sifa lexicons: `tangled.org/gui.do/sifa-lexicons`; published on `did:plc:2f2ahswozqy4v5lvu676375y`.
- Lexicon Community calendar and location: `tangled.org/lexicon.community/lexicons`.
- youandme.at: `_lexicon.youandme.at` → `did:plc:zfgfhm7mpslcdc3mk3z6sebw`, schema `at.youandme.connection`.
- standard.site: published on `did:plc:re3ebnp5v7ffagz6rb6xfei4`.
- Semble: `_lexicon.cosmik.network` → `did:plc:b2p6rujcgpenbtcjposmjuc3` (`network.cosmik.card`, `collection`, `collectionLink`; about 1,100 accounts).
- Bluesky lexicons: `github.com/bluesky-social/bsky`; PDS rate limits from the PDS source.
- Constellation: `constellation.microcosm.blue`. Verified 2026-11-10: 30 RSVP backlinks returned for a live Atmo event, CORS `*`.
- Smoke Signal search: `smokesignal.events/xrpc/community.lexicon.calendar.searchEvents` (CORS `*`).
- ORCID public API: `pub.orcid.org/v3.0` (CORS `*`; anonymous limit 25k reads/day per IP).
- Usage figures: `ufos-api.microcosm.blue` (12-month estimates).
