# Billboard badge and brand design language

- **Status:** design, for the owner's approval
- **Issues:** epic #127 (a sub-issue of #94), with follow-up #131 for
  the link-preview badge. #127 is delivered as three PRs:
  - #128: the design language;
  - #129: the badge (cover patterns, the hero and the Show QR badge);
  - #130: Roles.
- **Mockups:** the owner approved the "Lanyards design language" design
  canvas (claude.ai artifact `9aAbXNFJmSCYygnzgcjr7Q`). Its boards:
  - the profile on desktop, light;
  - the Show QR badge;
  - the profile on a phone, dark;
  - the design language;
  - the cover patterns;
  - the cover component.
- **Supersedes:**
  - the radius rule of `2026-11-19-customiser-redesign-design.md`
    (8–14 px for app chrome);
  - the hero of `2026-11-19-lanyard-layout-design.md`;
  - the pill shape of `2026-11-19-lanyard-layout-design.md`, which
    becomes 3 px chips.

## 1. Intent

The owner finds the lanyard's header "cheap and amateurish". They don't
like the overall design language either. Lanyards is a fun, bold, bright
product for professionals who want to get noticed at conferences. The
look should say so, in two registers:

- **The badge** is what people hold up, show each other and scan at a
  conference. It should be bold, playful and visually stunning, styled
  like a billboard or a high-visibility airport sign.
- **The profile** under it is slicker and quieter: accent colours used
  sparingly, and subtle borders like those on standard.site and
  offprint.app.

The badge appears in two places: the hero at the top of the public page,
and the full-screen Show QR screen. Both share one look.

The owner also wants the current role on the badge, and every role in a
new Roles block.

## 2. Goals

1. **A professional hero** that leads with the headline information:
   - a pattern cover in the owner's accent;
   - an accent field with the avatar, the name in giant type, pronouns
     and handle, and the headline;
   - an ink "departure board" strip: Now (the main current role),
     Based and Open to.
2. **A Show QR screen that is the badge:** brand-blue background,
   lanyard straps, and the badge card with the cover, the name, the
   role and the QR code.
3. **Eight vector cover patterns,** recoloured by the accent, chosen by
   the owner. No photographs: the Bluesky banner isn't used.
4. **One design language everywhere,** in the lanyard and in the app's
   own screens:
   - Rethink Sans;
   - the brand palette;
   - four owner accents;
   - 1 or 3 px corners;
   - hairline borders;
   - soft, layered shadows.
5. **Roles from Sifa:**
   - the main current role on the badge, with "+N more roles";
   - a Roles block listing current roles, then past ones.

## 3. Non-goals

- Redesigning the landing page or the settings pages. They take the new
  tokens, corners and font, but keep their layout.
- Owner-uploaded covers, Bluesky banners and animated covers.
- Organisation logos for roles. Sifa has none, so roles get a monogram
  tile.
- Printing physical badges, and per-event badges.
- New data sources. Everything comes from Bluesky, Sifa and the lanyard
  record we already read.
- **The link-preview image as a billboard badge,** with the owner's
  accent and cover. It needs new server-side reads, so it's follow-up
  issue #131. This epic only restyles it (§8a).

## 4. Anti-goals

These would make the work a failure even if it ships:

- **A QR code that scans worse.** It stays ink on white, with its quiet
  zone, never tinted, and at least 240 px wide on a phone held upright
  (§8).
- **Any text or control below WCAG 2.2 AA,** in light or dark, on any
  accent. That includes the badge's accent field and the cover.
- **An existing lanyard changing family:** a pink lanyard turning
  green, for example. Old accents map to the nearest new one (§5.3).
- **A slower public page:** the 200 KB JS budget holds, and covers add
  no image requests.
- **Layout shift** when the cover, the avatar or Sifa's data arrives.

## 5. The design language (PR 1, #128)

### 5.1 Type

- **Rethink Sans** (`@fontsource-variable/rethink-sans`, self-hosted for
  offline use) replaces DM Sans and DM Serif everywhere. DM Mono stays
  for code-like text.
- **Scale,** from the approved Language board:

  | Use       | Size and weight                                    |
  | --------- | -------------------------------------------------- |
  | Billboard | the name: 104 px desktop, 52 px phone, 800, line-height 0.92, tracking −0.035em |
  | Statement | the headline: 28/36 desktop, 20/28 phone, 500      |
  | Heading   | 18/24, 650                                         |
  | Body      | 16/24                                              |
  | Meta      | 14/20                                              |
  | Label     | 12/16, 750, uppercase, tracking 0.14em             |

  Fields stay 16 px so iOS doesn't zoom.

### 5.2 Colour

**Brand neutrals:**

| Name    | Hex    | Use                                     |
| ------- | ------ | --------------------------------------- |
| Black   | 06011E | ink, the dark ground, the departure board |
| Gray 04 | 312D49 | dark fills                              |
| Gray 03 | 8F8CA4 | decoration only (3.3:1 on white)        |
| Gray 02 | F6F5FF | subtle fills                            |
| Gray 01 | FAF9FD | the light ground                        |
| White   | FFFFFF | surfaces                                |

Muted text is a derived **5C5873** (6.8:1 on white) in light mode, and
**A9A6BD** in dark.

**Lanyard tokens:**

| Token      | Light       | Dark        |
| ---------- | ----------- | ----------- |
| ground     | FAF9FD      | 06011E      |
| surface    | FFFFFF      | 0E0A26      |
| subtle     | F6F5FF      | 17122F      |
| text       | 06011E      | F6F5FF      |
| muted text | 5C5873      | A9A6BD      |
| border     | ink at 9%   | white at 10% |

**App (UI) tokens** move onto the same neutrals. The primary action is
ink in light mode and F6F5FF in dark, with brand blue for selection and
links.

**Control borders:** borders that are a control's only boundary (fields,
checkboxes, switches) keep 3:1 against their ground (WCAG 1.4.11). This
is a stronger "border-strong" token, not the hairline.

### 5.3 Owner accents

Four accents replace the eight. Each defines the following, in light and
dark:

- **fill:** the badge field, tags and the heading square;
- **on-fill:** text on the fill;
- **accent text:** links and small marks on the page;
- **accent subtle:** the Open to chip fill.

| Accent | Fill   | On fill | Accent text, light       | Accent text, dark |
| ------ | ------ | ------- | ------------------------ | ----------------- |
| Blue   | 4020DF | FFFFFF  | 4020DF                   | B3A6FF            |
| Mint   | 8BF9BE | 06011E  | a deep green, ≥ 7:1      | 8BF9BE            |
| Lime   | EAFF00 | 06011E  | a deep olive, ≥ 7:1      | EAFF00            |
| Pink   | F7879A | 06011E  | a deep raspberry, ≥ 7:1  | F7879A            |

The mockups' light-mode text shades (0B6B40, 5A6300, A8203C) reach
about 6.5:1. The builder deepens them until they pass the existing 7:1
test, for example 075A35, 4A5200 and 96193A.

The existing contrast tests change:
- **Kept:** on-fill/fill ≥ 7:1; accent text/ground ≥ 7:1; accent
  text/accent subtle ≥ 4.5:1.
- **Dropped:** "accent/background ≥ 3:1". Light fills never carry
  meaning against the page on their own; anything drawn in the fill
  carries ink text or an ink edge.
- **Added:** the focus ring against every accent fill (§5.5).

**Old accents:**
- Absent or unknown → blue (brand blue, as violet was before).
- Stored values map: violet, indigo, ocean → blue; moss, teal → mint;
  rose, plum, ember → pink.
- The mapping happens on read. The owner's next save writes the new
  value.

The lexicon's `accent` gains the four new `knownValues` and keeps the
old eight, documented as legacy values that map.

### 5.4 Shape and depth

- **Corners:**
  - 3 px for everything: blocks, cards, chips, buttons, fields, dialogs,
    sheets, toasts, tooltips and the switch's track and thumb.
  - 1 px for small things: tags, thumbnails and the heading square.
  - Avatars, and the dots in patterns, stay round.
- **Borders:** 1 px hairlines (§5.2).
- **Shadows:** three stacked layers at 3–8% ink. In dark, an inset
  top highlight and deep black layers:
  - block: `0 1px 2px / 4%, 0 4px 12px / 4%, 0 16px 32px / 3%`;
  - badge: `0 1px 2px / 6%, 0 8px 24px / 8%, 0 32px 64px / 8%`.
- **The style guard:** "chrome corners are 8–14px" becomes "corners are
  1 px, 3 px or full". Full is allowed only for avatars and
  pattern dots.

### 5.5 Focus

- **Page:** the focus ring is brand blue in light mode and lime in dark
  (both ≥ 7:1 on their ground).
- **Accent field:** the ring is ink on mint, lime and pink, and white on
  blue.
- **Test:** every pairing is at least 3:1.

### 5.6 The profile, restyled

These look as on the Profile boards:

- **Blocks:**
  - surface, hairline, 3 px corners and the block shadow;
  - 24 px padding (16 px on phones);
  - the heading is 18/24 sans at 650, after an 8 px accent square with
    1 px corners;
  - a hidden block, in the editor, keeps its dashed border.
- **Chips** (Links, Open to, Skills), with 3 px corners:
  - **Links:** 40 px tall, with an 18 px favicon tile. The hit area
    stays 44 px.
  - **Open to:** an accent-subtle fill with a small accent-text square.
  - **Skills:** a gray 02 fill.
- **Cards:** a hairline border with 3 px corners, a thumbnail with 1 px
  corners and a muted arrow.
- **The editor's controls** follow the same corners and tokens: handle,
  block controls and record toggles.

The current hero takes only the tokens in PR 1; PR 2 replaces it.

## 6. Cover patterns (PR 2, #129)

### 6.1 The eight

These come from the owner's inspiration image, as on the Cover patterns
board:

| Key        | Name     | From                                           |
| ---------- | -------- | ---------------------------------------------- |
| `dots`     | Dots     | the dot-grid badge                             |
| `stripes`  | Stripes  | hazard tape                                    |
| `pixels`   | Pixels   | the pixel badge                                |
| `orb`      | Orb      | the striped circle                             |
| `symbols`  | Symbols  | the & % badge (& % @ / * + #)                  |
| `hazard`   | Hazard   | the trefoil badge: a diagonal two-tone field and an ink trefoil |
| `arrows`   | Arrows   | airport wayfinding                             |
| `monogram` | Monogram | the 360° badge: the owner's initials, huge     |

### 6.2 Colour

Each accent sets three cover colours: ground, mark and partner.

| Accent | Ground | Mark   | Partner |
| ------ | ------ | ------ | ------- |
| Lime   | 06011E | EAFF00 | F7879A  |
| Mint   | 06011E | 8BF9BE | F6F5FF  |
| Pink   | 06011E | F7879A | EAFF00  |
| Blue   | F6F5FF | 4020DF | 06011E  |

Hazard is the exception. It fills the cover with the accent, with a
lighter tint on the diagonal, and draws the trefoil in ink.

Covers look the same in light and dark: they carry their own ground.

### 6.3 Building them

- **Components:** inline SVG React components, one per pattern, behind
  one `CoverPattern` component (`pattern`, `initials`).
- **Colours:** come from CSS variables that the accent palettes set
  (`--cover-ground`, `--cover-mark`, `--cover-partner`). Changing the
  accent recolours the cover with no re-render.
- **Sizing:** the covers are scale-free.
  - Tiled patterns (dots, stripes, pixels, arrows) keep their tile size.
  - Composed patterns (orb, symbols, hazard, monogram) scale with the
    cover's height.
- **Requests:** none. No images and no randomness at render: Pixels'
  shapes are fixed data.
- **Accessibility:** decorative, so `aria-hidden`. The lanyard slot
  (a small cut-out at the top centre) is part of the cover frame, not
  of a pattern.

### 6.4 Choosing

- **The lexicon:** gains `cover` (string, max 32, with the eight
  `knownValues`).
- **Absent or unknown:**
  - The cover is derived from the owner's DID: a stable hash, mod 8.
    Lanyards differ from the start, and the same person always gets the
    same cover.
  - The derived cover is not written to the record until the owner saves
    one.
- **The Style panel:**
  - gains a **Cover** section beside Accent colour;
  - the section is a radio group of eight small live previews in the
    current accent;
  - covers save with Save, like the accent.
- **The draft:** `cover` joins the draft, the change count, the
  three-way merge and serialisation, like `accent`.

## 7. The hero (PR 2, #129)

As on the Profile boards. From top to bottom:

1. **Cover:**
   - 240 px tall, or 120 px when the hero is under 640 px wide (a
     container query, so the customiser's narrower canvas gets it too);
   - the lanyard slot at the top centre.
2. **Accent field:**
   - **Avatar:** 136 px (96 px when narrow), overlapping the cover by
     half, with a ring in the fill colour. With no avatar it shows the
     initials on ink, in the fill colour.
   - **The name:** in billboard type, `clamp()`ed to the container
     (min 44 px). It is never truncated, and long words break anywhere.
     Honorifics stay as today (`heroName`).
   - **Pronouns and handle** on one line: `he/him · @handle`.
   - **The headline:** Sifa's, or the first paragraph of the Bluesky
     bio, as today. At most 30 characters a line on desktop.
   - **Actions** sit at the right on desktop and below on narrow
     screens:
     - signed-in visitor: Follow (today's `FollowButton`);
     - signed-out visitor: **Follow on Bluesky**;
     - owner: **Edit lanyard** (to `/lanyard`) and **Show QR**;
     - in the customiser's preview: none.
3. **Departure board:**
   - An ink strip of up to three cells, separated by 1 px lines. Each
     cell is a label in the fill colour (the lighter blue B3A6FF for the
     blue accent) above a value in F6F5FF. It is a `<dl>`.
   - **Now:** the main role, `Title · Company`. When the Roles block is
     shown and there are other current roles, it adds a link, "+N more
     roles", to that block (§8).
   - **Based:** Sifa's location.
   - **Open to:** the visible Open to items, up to two, then "+N".
   - Each cell shows only when it has a value, and the owner's badge
     settings allow it. The strip is left out when no cell has a value.

**The main role** is the current position that is not hidden: the
primary one if marked, otherwise the latest started. It is today's
`currentJob()`, minus hidden positions.

**Badge settings** (Style → Badge), each defaulting to on:
- **Show current role:** today's `showJob`, renamed in the interface;
- **Show location:** a new `showLocation`;
- **Show what you're open to:** a new `showOpenTo`.

All three join the lexicon, the draft and the merge.

**Around the hero:**
- **Signed-out visitors:** Sign in and Create account move from under
  the hero to the app header's right side: "Sign in" and "Make your
  lanyard".
- **The shared-context strip** stays under the hero as one quiet line.

**Width and loading:**
- **Width:** the hero is up to 1,120 px wide; the blocks column stays
  narrower (up to 760 px), both centred.
- **The skeleton** mirrors the hero's shape: cover, field and strip.

**Loading.** Today the hero renders as soon as Bluesky answers, and Sifa
and the lanyard record fill in later. With the badge, that would flash
the default accent and cover, and make the board and the name jump.
- **The wait:**
  - After Bluesky answers, the hero waits for the lanyard record and
    Sifa to settle (answered or failed), for at most **800 ms**.
  - Meanwhile the skeleton shows, already in the hero's shape.
- **After the cap:**
  - The hero renders with fallbacks: Bluesky's name, avatar and bio
    headline, the default accent and the derived cover.
  - Late data then swaps in place. The board's height is reserved while
    Sifa is pending, so only a Sifa answer with no board cells collapses
    it.
- **Supersedes:** this amends the 2026-11-10 spec's §12.3 ("a slow or
  failed source never blocks the hero"). A slow source can delay the
  hero by up to 800 ms, never longer. A failed source never blocks it.
- **Performance:** the perf e2e budgets hold (LCP under 2.5 s, CLS
  under 0.1).
- **Blocks:** they keep loading independently, as today.

## 8. The Show QR badge (PR 2, #129)

As on the Show QR board. The full-screen dialog stays: Radix Dialog,
wake lock, Copy link, Close, and focus returning to the opener.

- **Background:** brand blue (4020DF); ink when the owner's accent is
  blue. Two ink lanyard straps meet at a clip above the card (gray 04 on
  the ink background). The badge looks the same in light and dark.
- **The card,** in the owner's accent:
  - the cover, 96 px tall, with the slot;
  - the name in billboard type, 46 px, stepping down for long names;
  - the main role, when shown;
  - pronouns and handle;
  - the QR code on white, ink on white with its quiet zone:
    - at least 240 px wide, or the card's full inner width on screens
      too narrow for that;
    - on screens up to 360 px wide, the card runs edge to edge so the
      code keeps its size;
  - "Scan to see my lanyard";
  - an ink strip with Based and `lanyards.app`.
- **Actions** below the card: **Copy link** (white) and **Close** (ink).
- **Short screens, upright:**
  - The whole code is visible when the sheet opens, without scrolling.
  - When the card doesn't fit, these give way, in this order:
    1. the straps;
    2. the cover, shrinking to 56 px, then going;
    3. the pronouns and handle line;
    4. the ink strip.
  - The name, the code and the two actions never go.
  - On the 320×640 e2e viewport the code is at least 240 px, fully on
    screen.
- **Landscape:** the QR code as large as the screen allows, with the
  card's details beside it. No straps.
- **Data:**
  - It reads the owner's hero the way the lanyard does: Bluesky, Sifa
    and the lanyard record, through the same query cache.
  - Offline, or when Sifa fails, it falls back to the Bluesky name, then
    "Your lanyard", with the derived cover and the default accent.
  - The QR code never waits on any of it.
- **Accent:** the badge is scoped to the owner's accent with
  `data-accent` on the sheet. It never touches `:root`, because the
  owner may open it while viewing someone else's lanyard.

## 8a. The link-preview image (PR 2, #129)

This is the image that `server/badgeImage.ts` draws behind `api/og` for
every shared lanyard link. PR 2 restyles it, keeping today's layout and
data:
- **Font:** Rethink Sans in place of DM Sans.
- **Colours:** the brand palette (ink 06011E, brand blue, the grays) in
  place of the old ink (1F1638).
- **Corners:** the same 1–3 px rule as everywhere else.

It still doesn't read the owner's accent or cover. Making it the full
billboard badge is #131 (§3).

## 9. Roles (PR 3, #130)

**The block:**
- A new block type, `roles`, with Sifa as its source. Its items are
  `SifaPosition`s, keyed by AT-URI, and each can be hidden.
- It is uncounted: it shows every role.
- **Default:** shown, second in the default order, after Links.
- **Existing lanyards:** a stored config without it gets it after Links
  (or first when there is no Links block). This replaces "append at the
  end" for blocks that a config doesn't mention.
- **Order:**
  - current roles first: the primary one, then the newest start;
  - then past roles: the newest end first, undated last.

**Each row** (rows divided by hairlines, not cards: a role opens
nothing):
- a 40 px monogram tile with the company's first letter;
- the title (16/22, 650);
- the company (muted);
- dates, using `formatPartialDate`: "Mar 2021 – now" or "2019 – 2023";
- a "Now" tag (fill and on-fill, 1 px corners) on current roles.

**Around the block:**
- **Empty and failure states** are the shared ones, with a Sifa edit
  link to positions.
- **The heading** is "Roles". The section is the target of the hero's
  "+N more roles" link, which moves focus to its heading.
- **The lexicon:** `roles` joins the block type's `knownValues`.

## 10. Approaches considered

1. **Foundation first, in three PRs (chosen):** the language, then the
   badge, then Roles. Each ships on its own, and the badge is built once,
   on the final tokens.
2. **Badge first:** the wow arrives sooner, but the hero would be built
   on the old tokens and reworked when the language lands.
3. **One PR:** one review, but a diff touching nearly every component.
   That's hard to review and hard to roll back.

For the covers: inline SVG components coloured by CSS variables. Image
files recoloured with CSS masks were rejected, because masks give one
colour and the patterns need three. Raster images were rejected, because
they cost requests and can't recolour.

## 11. Decided by the owner

- The badge look applies to the hero **and** to Show QR.
- **Roles:** the hero shows the main role with "+N more", plus a new
  Roles block.
- **Covers:** vector pattern covers in the owner's accent instead of the
  Bluesky banner ("it can clash with the overall style").
- **Accents:** the brand set of four replaces the eight.
- **Language:** Rethink Sans, the brand colours, subtle borders like
  standard.site and offprint.app, soft modern shadows, and corners of
  1–3 px.
- The mockups as approved ("Let's go").
- **The link-preview image:** restyle it now (§8a), and turn it into the
  billboard badge in #131.

## 12. My calls (correctable)

- **Corners everywhere:** 1–3 px applies to the app's own screens and to
  the chips, not only the lanyard. Avatars stay round.
- **Default accent:** blue, because the old default (violet) maps
  there. Lime goes unused by the mapping.
- **Default cover:** derived from the DID, so lanyards differ without
  setup.
- **Two new badge settings,** Show location and Show what you're open
  to, beside Show current role. A conference badge is more public than
  a profile.
- **Roles visibility:** Roles is shown by default, also on existing
  lanyards, second after Links. The positions are already public on
  Sifa.
- **Hidden roles:** a hidden role never appears on the badge either.
- **Hero actions:**
  - the owner gets Edit lanyard and Show QR in place of "This is your
    lanyard";
  - signed-out Sign in and Create account move to the header.
- **The Show QR badge** looks the same in light and dark.
- **The hero waits** up to 800 ms for Sifa and the lanyard record, so
  the badge doesn't flash the wrong accent or jump (§7, Loading).
- **The QR code floor** is 240 px, not "today's size":
  - Today's code is the screen width minus the gutters (288 px on a
    320 px phone), and the card frame can't keep that on narrow phones.
  - The approved mockup showed 192 px.
  - On short screens, the decoration gives way before the code (§8).
- **The primary button** is ink, not violet.

## 13. Left to the builder

- **Pattern geometry and tile sizes,** within §6 and the Patterns
  board.
- **Exact light-mode accent text shades and dark surface values** that
  pass the contrast tests.
- **Container query breakpoints** and the name's `clamp()`.
- **Badge data:** how the QR sheet reads the owner's hero; it may share
  `composeHero` and the source queries.
- **The legacy accent mapping,** in `resolveConfig`, and the DID hash
  for the default cover.
- **The style guard rewrite,** and new guards: no `font-serif`, and the
  allowed corners.
- **Analytics:** `cover_changed` and `badge_setting_changed`, named to
  match the existing events.

## 14. Release order and checks

1. **PR 1 (#128):** tokens, font, accents (with the lexicon values and
   the mapping), corners and shadows, plus the restyled blocks, chips,
   cards and chrome.
   - Unit tests: contrast and the mapping.
   - e2e: axe in light and dark, on two accents.
2. **PR 2 (#129):** the cover patterns and the cover setting (lexicon),
   the hero (with its loading rule), the badge settings, the header
   actions for signed-out visitors, the Show QR badge, and the
   link-preview restyle.
   - Unit tests: the board cells, hidden roles and cover derivation.
   - e2e: the hero for the owner, a visitor and a signed-out visitor;
     choosing a cover and saving it; Show QR showing the badge and a
     scannable code; axe on the badge.
3. **PR 3 (#130):** the Roles block (lexicon), its insertion into
   existing configs, and the "+N more roles" link.
   - e2e: the Roles block and hiding a role.

Each PR passes lint, typecheck, `lex:check`, `i18n:check`, unit tests,
the bundle budget and e2e.

## 15. Owner follow-ups

- **Publish the lexicon changes** to the PDS, as before:
  - `accent` and `cover` values;
  - `showLocation` and `showOpenTo`;
  - the `roles` block type.
- **Check on a phone at a real distance:** the badge's legibility and
  QR scanning, with a phone held up.
