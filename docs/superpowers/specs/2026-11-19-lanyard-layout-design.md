# Lanyard layout: bordered blocks, pills and cards

- **Status:** design, for the owner's approval
- **Issues:**
  - Part 1 reworks PR 4 of #118 before it ships.
  - Part 2 is a new issue: the layout pass, a sub-issue of epic #94.
- **Amends:** `2026-11-19-customiser-redesign-design.md`:
  - its "Editing kept records in place" section: own links and the Title
    control are dropped, and podcasts are edited in a modal;
  - its draft section: the honorific leaves the draft.

## Intent

The owner looked at the lanyard after #118's PR 3 and found it shapeless:
- one box wraps the whole lanyard and does nothing;
- blocks have no edges, so it's hard to see where one ends or to move it
  with intent;
- every block lays its items out the same way, whatever they are.

They want:
- structure: each block bordered;
- items shaped by what they are:
  - short labels (links, what they're open to, skills) as wrapping pills;
  - things you open (articles, posts, repositories, collections, podcasts)
    as cards that open with one click;
- less to manage: titles come from Sifa, and links come from Sifa and
  Bluesky only.

## Goals

1. **No outer box.**
   - The lanyard sits on its own ground in the customiser, as it does on the
     public page.
   - Only the header and the style sidebar look like the app.
2. **Every block has a border,** on the public page and in the customiser
   alike.
   - Its header row holds its name.
   - While editing, the same row also holds its controls.
3. **Pills:** Links, Open to and Skills.
   - Pills wrap cleanly and align on one line.
   - Links show their icon on the left.
   - While editing, each pill has its show/hide toggle on its right.
4. **Cards:** Articles, Social posts, Talks, Publications, Code,
   Collections, and Podcasts and videos.
   - On the public page, clicking anywhere on a card opens its one
     destination.
   - Nothing inside a card is a separate link.
   - Education cards open nothing.
5. **Renames:**
   - "Blog posts" becomes "Articles", with a thumbnail;
   - "Posts on Bluesky" becomes "Social posts".
6. **Collections** stop listing the links inside them.
7. **Podcasts and videos** are added with "Add new" under the cards.
   - It opens a modal form; Edit opens the same form, filled in.
   - Changes stay a draft until Save.
8. **The title comes from Sifa:**
   - the honorific prefix (Dr, Prof, Sir) before the name;
   - the suffix (PhD, OBE) after it;
   - both following Sifa's show switch.
9. **Links come only from Sifa and Bluesky.**

## Non-goals

- New blocks, new data sources, or changing what each block contains beyond
  what's listed here.
- Changing the stored lanyard config: block keys stay `blogPosts` and
  `bskyPosts`, so saved orders and hidden items keep working.
- Republishing the `app.lanyards.authFull` permission set (see Owner
  follow-ups).
- Light/dark or accent changes: the tokens stay as they are.

## Anti-goals

These would be failures even if everything else works:
- **Interactive elements nested inside one another.** A link inside a
  link, or a toggle inside a link, breaks keyboards and screen readers.
- **An editor that looks different from the public page,** other than its
  controls.
- **Deleting anyone's data.** Old web-link and honorific records stay in
  people's repositories; Lanyards just stops reading them.
- **Loading images from new third parties.** Article thumbnails come
  through Bluesky's image service, as avatars do.
- **Text below 4.5:1 contrast,** or a target under 44 px.

## Constraints

- **CLAUDE.md rules:**
  - the 4-file component structure;
  - no margin utilities;
  - `leading-*` on all text;
  - Form Standards;
  - British English;
  - lint, typecheck, unit, e2e and axe (light and dark) all green.
- **#118's separation of tokens:**
  - chrome uses `ui-*`; the lanyard uses its own tokens;
  - the style guards in `web/scripts/styleRules.test.ts` stay green;
  - any change to a guard is deliberate and tested.
- **Initial JavaScript budget:** 200 KB gzipped (184.6 KB today).

## Approaches considered

- **Sequencing** (owner chose the first):
  - **Rework PR 4, then a new issue (chosen).**
    - PR 4 drops what the owner has ruled out, then ships and closes #118.
    - The layout follows as its own issue.
    - Nothing ships only to be removed.
  - **All in #118.** It would grow well past its spec, and stay open
    longer.
  - **Ship PR 4 as it is.** It would ship a link editor and a Title
    control already decided against.
- **Customiser canvas** (owner chose A, after mockups):
  - **A: the lanyard's own ground.** The editor is the page; the sidebar is
    the edge between app and lanyard.
  - **B: the app's grey canvas.** Clearer separation, but the badge sits on
    grey and the editor no longer looks like the public page.
- **Block header** (owner chose the first):
  - **One header row inside the border (chosen):** the name once, with the
    controls on the same row.
  - **A control bar above the block's own heading:** the name appears
    twice.
- **Own links** (owner chose the second):
  - add or edit them in a modal;
  - **none at all (chosen);**
  - keep PR 4's inline editor.
- **Clickable cards** (my call): the stretched-link pattern.
  - The card's title is its one `<a>`, and the link's `::after` covers the
    whole card.
  - Rejected: wrapping the whole card in `<a>`. Its name would be every
    word on the card, and in the editor it would contain buttons.
  - Rejected: a click handler on a `div`. Keyboards can't reach it, and it
    isn't announced as a link.

## Decided by the owner

- The approaches above: sequencing, canvas A, one header row, no own links.
- Borders on every block, public page included.
- The title comes only from Sifa; the Lanyards Title control and record go.
- Pills for Links, Open to and Skills, with their alignment fixed.
- Cards for Articles, Social posts, Education, Code, Collections, and
  Podcasts and videos.
  - All except Education open their one destination; podcasts and videos
    open in a new tab.
- No internal links in cards.
- Collections don't list their items.
- Podcasts and videos: "Add new" under the cards opens a modal form, and the
  form further down the page goes.
- The "Your links" section goes.

## The design

### Part 1: PR 4 reworked (#118)

PR 4 keeps:
- one Save for settings and records;
- `applyWrites` in atomic batches;
- the permission check before anything is written;
- the ORCID helper in Publications;
- the removal of "More settings".

It changes as follows.

- **No own links.**
  - Remove from the records draft and the UI:
    - `LinkEditor`;
    - `addLink`, `updateLink` and `removeLink`;
    - `LinkFields`;
    - `mergeLinks`' `ownKey`.
  - The Lanyards source stops listing `app.lanyards.link.web`.
  - The Links block merges only Bluesky's links and Sifa's external
    accounts.
  - `WebLinkForm` and its validation go.
  - Hidden entries for links that came only from own records become orphans.
    The editor's existing "no longer on your lanyard" line and Clear handle
    them.
- **No Lanyards title.**
  - Remove from the records draft and the UI:
    - `HonorificControl`;
    - `setHonorific`;
    - the honorific change in `diff`/`save`.
  - The Lanyards source stops reading
    `app.lanyards.actor.biography.honorific`.
- **Sifa's honorifics:**
  - Re-vendor `id.sifa.profile.self` and `id.sifa.getProfileView` from
    `singi-labs/sifa-lexicons`. Their `profileView` now carries:
    - `honorificPrefix` and `honorificSuffix` (strings, up to 128 graphemes
      in the view);
    - `showHonorifics` (absent means true).
  - The Sifa adapter maps the three, and `composeHero` puts them on the
    hero.
  - `BadgeHero` shows them only when `showHonorifics` isn't false, as:
    - prefix, a space, then the name;
    - then a comma, a space and the suffix.
  - They're shown exactly as typed, so "Dr." keeps its full stop.
  - The badge's level-2 heading is the whole string.
- **Permissions:**
  - The records check needs create, update and delete on audio and video
    only.
  - The honorific and web-link scopes are no longer required.
  - A session that lacks them is no longer told it needs more permission.
- **Podcasts and videos in a modal:**
  - **Add new** sits under the cards, as a secondary button: "Add a podcast
    or video".
  - It opens a modal dialog, titled "Add a podcast or video", containing
    `MediaForm`.
  - Each card's **Edit** opens the same dialog, titled "Edit {title}", with
    the form filled in.
  - **Delete** stays an icon button on the card.
  - Submitting a valid form closes the dialog and puts the change in the
    draft, where it shows on the lanyard at once.
  - Cancel, Escape and the close button discard the form's input.
  - A click outside the dialog doesn't close it, so typed input isn't lost
    by accident.
  - **Focus:**
    - on open, the first field;
    - on close, back to the button that opened it: Add, or that card's
      Edit;
    - after a delete, Add.
  - Each change is announced, as now.
  - **Dialog primitive:** a new `Dialog` in `web/src/components/` (4 files,
    chrome tokens), built on `radix-ui`'s Dialog, as `Sheet` is. Its corner
    radius is 8–14 px, per the guard.
- **Spec amendment:** a short "Amended by
  2026-11-19-lanyard-layout-design.md" note goes at the top of the #118
  spec's records section.

### Part 2: the layout (new issue)

#### Canvas

- `LanyardSurface`'s `card` variant goes.
- The customiser's canvas uses the lanyard's ground (the `page` variant's
  background and text colours).
- The intro ("Customise your lanyard") and the notices stay where they are:
  - the intro uses the lanyard's text colours;
  - the notices stay chrome panels.
- The badge sits directly on the ground, as on the public page.

#### Block frame and header row

- **The frame:** every shown block is a bordered container:
  - the lanyard's `border` token, 1 px;
  - a radius of about 16 px;
  - its own padding;
  - a gap between blocks.
- **The header row** is the frame's first row.
- **On the public page,** the row holds the block's name (its `h2`). For
  the owner it also holds the "Edit on Sifa" / "Edit in Bluesky" links, as
  today.
- **In the customiser,** the same row holds, in order:
  - the drag handle;
  - the name, which is the `h2`, with "Hidden from visitors" under it while
    hidden;
  - the Edit-on links;
  - the count select (counted blocks only);
  - Move up and Move down;
  - the show switch.

  `BlockBar` and `BlockSection`'s heading merge into this one row, so the
  name appears once.
  - The controls keep their current names, behaviour, focus handling and
    announcements.
  - At narrow widths the row wraps, as `BlockBar` does today: the name on
    one line, the controls on the next.
- **A hidden block** shows only its header row, in a dashed frame.
- **Below the header row** comes the block's content: pills, cards, or (for
  Details) what it shows today.

#### Pills: Links, Open to, Skills

- A wrapping row with a small gap. Each pill:
  - is a rounded-full bordered shape, at least 44 px tall;
  - is vertically centred;
  - is one line long, at most the row's width;
  - truncates a long label with an ellipsis, keeping the full label as its
    accessible name.
- **Links:**
  - the icon (favicon or platform icon) sits on the left;
  - on the public page the whole pill is the link.
- **Open to and Skills** have no icon and aren't links.
- **In the customiser:**
  - each pill holds its show/hide toggle on the right;
  - the link and the toggle are siblings inside the pill, never nested;
  - a hidden pill gets a dashed border and its eye-off toggle;
  - a visually hidden "(hidden)" follows its label, and the faded icon rule
    from #118 applies.

#### Cards

- **Every card** is a bordered, rounded container:
  - content on the left, the owner's controls on the right;
  - at least 44 px tall.
- **The public page** uses the stretched link:
  - the title is the card's one link;
  - its `::after` covers the card;
  - the card shows a visible focus ring when its link has focus;
  - links open as `ExternalLink` does today;
  - any other text on the card is plain.
- **In the customiser,** the title stays a plain link but doesn't stretch,
  so clicking elsewhere on the card does nothing. Its controls (toggle,
  Edit, Delete) are siblings of the link, never inside it.
- **Per block:**

  | Block | Card shows | Opens |
  | --- | --- | --- |
  | Articles (was Blog posts) | Thumbnail on the left (cover image), title, publication · date | The article |
  | Social posts (was Posts on Bluesky) | The post's text as plain text (facets not linked), date | The post on Bluesky (the date is the card's link, named "Post on Bluesky, {date}") |
  | Talks | Title, event, date · role | The talk's page, when it has one; otherwise nothing |
  | Publications | Title, venue · year, the ORCID tick | The DOI or URL |
  | Education | Institution, qualification, years | Nothing |
  | Code | Repository name, description | The repository |
  | Collections | Name, description (no list of its links) | The collection on Semble |
  | Podcasts and videos | Title, type · platform | The media, in a new tab |

- **Article thumbnails:**
  - the `site.standard.document` `coverImage` blob, through
    `cdnImage(...)`, as avatars are;
  - about 64 × 48 px, cropped to cover, with `alt=""` (the title names the
    card) and lazy loading;
  - posts without a cover show a plain document icon on a subtle tile, so
    every card lines up;
  - the Standard.site adapter reads `coverImage` into `BlogPost`.

#### Renames

`BLOCK_HEADINGS`:
- `blogPosts` becomes "Articles";
- `bskyPosts` becomes "Social posts".

Every place that names those blocks follows: bars, announcements, switches,
"Show N" labels, tests and the en-GB catalogue.

## Release order

1. **PR 4, reworked (#118, Closes #118):** Part 1.
2. **Layout PR A (new issue):**
   - the canvas;
   - the block frame and header row;
   - pills (Links, Open to, Skills);
   - the renames.
3. **Layout PR B (same issue, closes it):**
   - cards for every card block;
   - Article thumbnails;
   - Collections without their links.

## My calls (correctable)

- **Talks and Publications become cards too,** so every non-pill block
  looks the same.
- **Block names are in sentence case:** "Articles", "Social posts".
- **The suffix follows the name after a comma:** "Ada Example, PhD".
- **Honorifics are shown exactly as typed in Sifa.**
- **In the customiser, cards don't open when clicked;** only their titles
  are links. An owner arranging blocks shouldn't be sent away by a stray
  click.
- **Media changes made in the modal are draft changes,** like every other
  edit; the modal doesn't save on its own.
- **A hidden pill** gets a dashed border and a visually hidden "(hidden)",
  not a visible "Hidden" tag, which would make pills uneven.
- **Old `link.web` and honorific records** are left in people's
  repositories, unread.
- **Hidden cards keep #118's visible "Hidden" tag;** only pills drop it.
- **The app's own controls (`ui-*`) stay as they are on the lanyard's
  ground.** They meet contrast there in light and dark: border-strong
  3.2:1 and 4.2:1, muted text 6.9:1 and 8.3:1.

## Left to the builder

- Exact spacing, radii, icon choices and text sizes, within the tokens and
  guards.
- How the header row wraps between phone and desktop, provided it stays one
  row on wide screens.
- Line clamps for long post text and descriptions.
- Component boundaries: shared `Pill` and `Card` pieces, and how
  `BlockBar` and `BlockSection` merge. The 4-file rule applies.
- Test names and fixtures, as long as each behaviour above has a test that
  failed first.

## Owner follow-ups

- **Optional:** republish `app.lanyards.authFull` without `link.web` and the
  honorific. Sign-in would then stop asking for scopes Lanyards no longer
  uses.
- **Manual check** on a phone and with a screen reader:
  - pills;
  - stretched-link cards;
  - the media modal.
