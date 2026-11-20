# Billboard Badge and Brand Design Language Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task by task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Lanyards its brand design language. Make the hero and the
Show QR screen a billboard badge with accent-coloured pattern covers,
and add Roles from Sifa.

**Architecture:**
- **Tokens:** new values in `web/src/styles/` drive every surface. The
  four owner accents become CSS palettes that also set the cover
  colours, so covers recolour without re-rendering.
- **Covers:** inline SVG React components behind one `CoverPattern`.
- **Badge data:** the hero and the QR badge share `composeHero`, which
  gains the board's data.
- **Roles:** a new block type wired through the existing block
  registries.

**Tech stack:** Vite, React 19, TypeScript, Tailwind CSS v4, Radix,
Lingui, Vitest with Testing Library and MSW, Playwright, and atcute
lexicons.

**Spec:** `docs/superpowers/specs/2026-11-20-billboard-badge-design.md`.
The approved mockups are on the design canvas the spec names.

## Global Constraints

**Code and checks:**
- Every commit passes `npm run lint`, `npm run typecheck` and `npm test`
  in `web/`.
- Every PR also passes `lex:check`, `i18n:check` (re-run
  `npm run i18n:extract` after moving any line with a message), `build:e2e`,
  the size budget (200 KB JS) and e2e:
  `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e -- --trace off --workers=2`.
- Components use the 4-file structure.
- No margin utilities, no inline styles, every text has a `leading-*`,
  and classes go through `cn()`.
- British English, through Lingui.
- WCAG 2.2 AA in light and dark on every accent. Controls' only
  boundaries keep 3:1; text 4.5:1; accent text and ground 7:1;
  on-fill and fill 7:1.

**Design values:**
- **Corners:** 1 px (tags, thumbnails, heading square) or 3 px
  (everything else). Full rounding only for avatars and pattern dots.
- **Font:** Rethink Sans (`@fontsource-variable/rethink-sans`). No DM
  Sans or DM Serif; DM Mono stays.
- **Brand:** black 06011E, gray 04 312D49, gray 03 8F8CA4 (decoration
  only), gray 02 F6F5FF, gray 01 FAF9FD, white. Muted text 5C5873
  (light) and A9A6BD (dark).
- **Accents:**

  | Accent | Fill   | On fill | Text, dark |
  | ------ | ------ | ------- | ---------- |
  | blue   | 4020DF | FFFFFF  | B3A6FF     |
  | mint   | 8BF9BE | 06011E  | 8BF9BE     |
  | lime   | EAFF00 | 06011E  | EAFF00     |
  | pink   | F7879A | 06011E  | F7879A     |

  - **Default:** blue.
  - **Legacy:** violet, indigo, ocean → blue; moss, teal → mint; rose,
    plum, ember → pink.

**Lexicon:** changes to `app.lanyards.actor.lanyard` only add things.
The owner republishes the lexicon after each PR that changes it.

**Git:**
- Commits are authored as Barry Prendergast with the session trailers.
  Each PR gets its own branch from the latest `origin/main`, pushed to
  `claude/lanyards-rebuild-attendee-ux-vcl1sb`.
- Never `--force`, never commit to `main`, and never merge.

## Review Focus

1. **A very long name, or a single long word, in billboard type at
   320 px:** it wraps inside the field, with no horizontal scroll, on
   the page and on the QR badge (Tasks 8 and 10).
2. **Someone with no Sifa profile, or whose Sifa fails:** the hero
   renders within 800 ms of Bluesky, with no board, and the QR badge
   still shows its code (Tasks 9 and 10).
3. **Opening Show QR while viewing someone else's lanyard in another
   accent:** the badge uses the owner's accent, and the page's accent is
   unchanged after Close (Task 10).
4. **A stored record with a legacy accent and no cover, saved by the
   new app:** it writes the mapped accent, writes no `cover` unless one
   was picked, and keeps unknown fields (Tasks 2 and 5).
5. **A hidden current role that is the primary one, and partial dates
   (`2019`, `2019-03`):** the hero takes the next visible current role,
   "+N" counts only visible roles, and the dates read "Mar 2019 – now"
   (Tasks 8 and 12).

---

## PR 1: the design language (#128)

Branch: `feature/issue-128-design-language` from `origin/main`.

### Task 1: Brand tokens, Rethink Sans and depth

**Files:**
- Modify:
  - `web/package.json`
  - `web/src/styles/index.css`
  - `web/src/styles/tokens.css`
- Restyle (serif → sans 650): the `.styles.ts` of `BadgeHero`,
  `BlockSection`, `LanyardNotFound` and `LanyardNotice`
- Test:
  - `web/src/design/uiTokens.test.ts`
  - `web/src/design/accents.test.ts` (its "base tokens" block)
  - `web/scripts/styleRules.test.ts`

**Interfaces:**
- **Produces CSS variables:** lanyard tokens `--background`,
  `--foreground`, `--muted-foreground`, `--surface`, `--subtle` (new),
  `--border`, `--border-strong` (new) and `--focus-ring`; the `--ui-*`
  tokens with new values.
- **Produces theme keys:** `--shadow-block` and `--shadow-badge` (the
  classes `shadow-block` and `shadow-badge`), and `--radius-xs: 1px`
  and `--radius-sm: 3px` (the classes `rounded-xs` and `rounded-sm`).
  `--font-sans` becomes Rethink Sans and `--font-serif` is removed.

- [ ] **Step 1: Write the failing tests.**
  - In `uiTokens.test.ts` and the "base tokens" block of
    `accents.test.ts`, assert the new values from the spec, §5.2:

    | Token                    | Light                 | Dark                  |
    | ------------------------ | --------------------- | --------------------- |
    | `--background`           | `#FAF9FD`             | `#06011E`             |
    | `--surface`              | `#FFFFFF`             | `#0E0A26`             |
    | `--muted-foreground`     | `#5C5873`             | `#A9A6BD`             |
    | `--ui-text`              | `#06011E`             |                       |
    | `--ui-primary`           | `#06011E`             | `#F6F5FF`             |
    | `--border`               | `rgb(6 1 30 / 0.09)`  | `rgb(246 245 255 / 0.10)` |

    Add contrast assertions:
    - muted text against ground and surface ≥ 4.5 in both modes;
    - `--border-strong` and `--ui-border-strong` against ground and
      surface ≥ 3, in both modes.
  - In `styleRules.test.ts`, add `it('uses no serif font')`: no class
    string contains `font-serif`.
- [ ] **Step 2: Run them to watch them fail.** Run:
  `npx vitest run src/design scripts/styleRules.test.ts`. Expected:
  FAIL on the old values and on four `font-serif` uses.
- [ ] **Step 3: Implement.**
  - Install the font: `npm i @fontsource-variable/rethink-sans`, and
    remove `@fontsource-variable/dm-sans` and `@fontsource/dm-serif-text`.
  - In `index.css`, import Rethink Sans and set
    `--font-sans: 'Rethink Sans Variable', …`. Add the shadow and radius
    theme keys:
    - `--shadow-block`: `0 1px 2px rgb(6 1 30 / 0.04), 0 4px 12px rgb(6 1 30 / 0.04), 0 16px 32px rgb(6 1 30 / 0.03)`;
    - `--shadow-badge`: `0 1px 2px rgb(6 1 30 / 0.06), 0 8px 24px rgb(6 1 30 / 0.08), 0 32px 64px rgb(6 1 30 / 0.08)`;
    - in dark: `0 1px 0 rgb(246 245 255 / 0.04) inset, 0 8px 24px rgb(0 0 0 / 0.35)`
      for blocks, and `0 2px 4px rgb(0 0 0 / 0.3), 0 24px 64px rgb(0 0 0 / 0.45)`
      for the badge.
  - Set the token values in `tokens.css`.
  - Replace the four `font-serif` headings with `font-sans font-[650]`.
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`.
  Expected: PASS.
- [ ] **Step 5: Commit:**
  `feat: brand tokens, Rethink Sans and soft shadows (#128)`.

### Task 2: The four accents, legacy mapping and focus rings

**Files:**
- Modify:
  - `web/src/design/accents.ts`
  - `web/src/styles/accents.css`
  - `web/src/lib/person/config.ts`
  - `web/src/features/lanyard/customise/AccentPicker/AccentPicker.constants.ts`
    and `.tsx` (its doc comment: "four")
  - `web/lexicons/lanyards/app/lanyards/actor/lanyard.json`
  - the generated `web/src/lexicons/**` (run `npm run lex:gen`)
  - the e2e fixtures and mocks that set an accent
- Test:
  - `web/src/design/accents.test.ts`
  - `web/src/lib/person/config.test.ts`

**Interfaces:**
- **Produces** in `accents.ts`:
  - `ACCENTS = ['blue', 'mint', 'lime', 'pink'] as const`;
  - `type Accent`;
  - `DEFAULT_ACCENT: Accent = 'blue'`;
  - `LEGACY_ACCENTS: Record<string, Accent>`;
  - `resolveAccent(value: string | undefined): Accent`.
- **Produces CSS variables,** per accent in light and dark: `--accent`,
  `--on-accent`, `--accent-text`, `--accent-subtle`,
  `--focus-ring-on-accent` (ink, or white for blue), `--cover-ground`,
  `--cover-mark` and `--cover-partner` (from spec §6.2).
- **Page focus ring:** `--focus-ring` is `#4020DF` in light and
  `#EAFF00` in dark.

- [ ] **Step 1: Write the failing tests.**
  - In `accents.test.ts`, check every accent in light and dark:
    - on-accent/accent ≥ 7;
    - accent-text/background ≥ 7;
    - accent-text/accent-subtle ≥ 4.5;
    - focus-ring-on-accent/accent ≥ 3;
    - focus-ring/background ≥ 3.

    Remove the old "accent/background ≥ 3" test. Also assert
    `resolveAccent('violet') === 'blue'`,
    `resolveAccent('teal') === 'mint'`,
    `resolveAccent('plum') === 'pink'`,
    `resolveAccent(undefined) === 'blue'`, and
    `resolveAccent('nonsense') === 'blue'`.
  - In `config.test.ts`, add `it('maps a legacy accent and writes the
    new value on save')`: `resolveConfig({ …record, accent: 'rose' })`
    gives `accent: 'pink'`, and `serialiseConfig` of that writes
    `accent: 'pink'`.
- [ ] **Step 2: Run them to watch them fail.** Run:
  `npx vitest run src/design/accents.test.ts src/lib/person/config.test.ts`.
  Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Write the four palettes. The light accent text for mint, lime and
    pink is deepened until it passes 7:1 (start from 075A35, 4A5200
    and 96193A).
  - `resolveConfig` uses `resolveAccent`.
  - In the lexicon, `accent.knownValues` lists blue, mint, lime and
    pink first, then the old eight, with the description
    "Accent palette; blue when absent or unknown. violet, indigo,
    ocean, moss, teal, rose, plum and ember are legacy values, read as
    blue, mint or pink".
  - Run `npm run lex:gen`.
  - Name the accents in `ACCENT_NAMES`: Blue, Mint, Lime, Pink.
  - Update the fixtures that set old accents.
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`
  and `npm run lex:check`. Expected: PASS.
- [ ] **Step 5: Commit:**
  `feat: four brand accents, mapping the old eight (#128)`.

### Task 3: Corners of 1 and 3 px everywhere

**Files:**
- Modify: every `.styles.ts` that uses `rounded-*` (38 files, listed by
  `grep -rl "rounded-" web/src --include=*.ts`)
- Test: `web/scripts/styleRules.test.ts`

**Interfaces:** consumes `rounded-xs` and `rounded-sm` from Task 1.

- [ ] **Step 1: Write the failing test.** Replace
  `it('chrome corners are 8–14px')` with
  `it('corners are 1px, 3px or full')`:
  - every `rounded*` class across all scopes is `rounded-xs`,
    `rounded-sm` or `rounded-full`, or one of their side variants
    (`rounded-l-sm`, …);
  - `rounded-full` appears only in an allow-list of class-string
    exports: avatars, pattern dots, the Open to chip's dot, and the
    toggle thumb if it stays round.
- [ ] **Step 2: Run it to watch it fail.** Run:
  `npx vitest run scripts/styleRules.test.ts`. Expected: FAIL, listing
  each offending class.
- [ ] **Step 3: Implement.** Map `rounded-md/lg/xl/2xl/rounded` →
  `rounded-sm`, and `rounded-sm` (thumbnails, tags) → `rounded-xs`.
  - Pills become 3 px chips; drop PillItem's `rounded-l-full`.
  - The Switch's track and thumb get 3 px corners.
  - Avatars stay `rounded-full`.
- [ ] **Step 4: Run it to watch it pass,** then run `npm test`.
  Expected: PASS.
- [ ] **Step 5: Commit:** `feat: corners of 1 and 3 px everywhere (#128)`.

### Task 4: The profile in the quiet register, and PR 1

**Files:**
- Modify the `.styles.ts` and `.tsx` of:
  - `BlockSection` (the heading square);
  - `PillItem`, `LinksBlock` (favicon tile), `OpenToBlock`, `SkillsBlock`
    and `CardItem`, plus the card thumbnails in `BlogPostsBlock`,
    `MediaBlock` and `CollectionsBlock`;
  - `ItemFrame`, `BlockHandle`, `BlockControls` and `EditableBlock`.
- Test:
  - `web/src/features/lanyard/components/BlockSection/BlockSection.test.tsx`
  - `web/e2e/lanyard.spec.ts` (axe)

**Interfaces:** consumes `shadow-block` and the `--subtle` token. The
heading square is a decorative `span` (`aria-hidden`, `size-2
rounded-xs bg-accent ring-1 ring-border-strong`).

- [ ] **Step 1: Write the failing tests.**
  - In `BlockSection.test.tsx`, add `it('marks its heading with a
    decorative accent square')`: the heading's first child has
    `aria-hidden="true"`, and the accessible name is still the heading
    text alone.
  - In `lanyard.spec.ts`, axe runs in light and dark with the mint and
    blue accents (`accent: 'mint'` in the fixture record), with no
    violations.
- [ ] **Step 2: Run them to watch them fail.** Run:
  `npx vitest run src/features/lanyard/components/BlockSection`.
  Expected: FAIL.
- [ ] **Step 3: Implement the spec's §5.6 values.**
  - **Blocks:** `bg-surface border border-border rounded-sm
    shadow-block p-4 md:p-6`, with the heading at `text-[18px]
    leading-6 font-[650]`.
  - **Link chips:** `h-10` with an 18 px favicon tile; the hit area
    stays at least 44 px through the existing `::before`.
  - **Open to chips:** `bg-accent-subtle`, with a 6 px `bg-accent-text`
    square.
  - **Skills chips:** `bg-subtle`.
  - **Cards:** hairline borders, `rounded-sm`, and `rounded-xs`
    thumbnails.
- [ ] **Step 4: Run all the checks,** including the full e2e
  run. Expected: PASS. Then screenshot the public lanyard (light and
  dark, 1280 px and 390 px) against the canvas's Profile boards. Fix
  any visible differences before the commit.
- [ ] **Step 5: Commit** `feat: the profile in the quiet register
  (#128)`, then push and open PR 1 with "Closes #128".

---

## PR 2: the badge (#129)

Branch: `feature/issue-129-billboard-badge` from `origin/main` once PR 1
has merged, or stacked on PR 1's branch if it hasn't.

### Task 5: The lexicon and config gain the cover and badge settings

**Files:**
- Modify:
  - `web/lexicons/lanyards/app/lanyards/actor/lanyard.json`
  - the generated lexicon types
  - `web/src/lib/person/config.ts`
  - `web/src/features/lanyard/hooks/useLanyardDraft.ts`
- Create: `web/src/design/covers.ts` and `covers.test.ts`
- Test: `web/src/lib/person/config.test.ts`

**Interfaces:**
- **Produces** in `covers.ts`:
  - `COVERS = ['dots', 'stripes', 'pixels', 'orb', 'symbols', 'hazard', 'arrows', 'monogram'] as const`;
  - `type CoverPattern`;
  - `isCover(value: unknown): value is CoverPattern`;
  - `coverFor(did: string): CoverPattern`: a stable hash of the DID,
    mod 8;
  - `initialsOf(name: string): string`: the first grapheme of the
    first and last words, upper-cased, at most 2.
- **Produces** on `LanyardConfig`: `cover: CoverPattern | null` (null
  means not chosen), `showLocation: boolean` and `showOpenTo: boolean`.
  `CONFIG_FIELDS` and the draft's change count include all three.

- [ ] **Step 1: Write the failing tests.**
  - `covers.test.ts`:
    - `coverFor` returns the same pattern for the same DID, and covers
      at least 6 of the 8 patterns across 50 sample DIDs;
    - `initialsOf('B. Prendergast') === 'BP'`,
      `initialsOf('Ada') === 'A'`, and
      `initialsOf('Ada Lovelace King') === 'AK'`.
  - `config.test.ts`:
    - an absent `cover` gives `null`, and an unknown one gives `null`;
    - `cover: 'orb'` round-trips;
    - `showLocation` and `showOpenTo` default to `true`;
    - `serialiseConfig` writes no `cover` key when it is `null`;
    - `mergeConfig` takes our `cover` when only we changed it.
- [ ] **Step 2: Run them to watch them fail.** Run:
  `npx vitest run src/design/covers.test.ts src/lib/person/config.test.ts`.
  Expected: FAIL.
- [ ] **Step 3: Implement.** The lexicon gains:
  - `cover` (string, maxLength 32, the eight as `knownValues`,
    description "Badge cover pattern; derived from the DID when
    absent");
  - `showLocation` and `showOpenTo` (boolean, default true, described
    as "Show the location on the badge" and "Show what the owner is
    open to on the badge");
  - for `showJob`, the description "Show the current role on the
    badge".

  Then run `npm run lex:gen`.
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`
  and `lex:check`. Expected: PASS.
- [ ] **Step 5: Commit:**
  `feat: the lanyard record keeps a cover and badge settings (#129)`.

### Task 6: The eight cover patterns

**Files:**
- Create: `web/src/components/CoverPattern/` (4 files plus a test),
  with one internal SVG component per pattern in
  `CoverPattern.patterns.tsx`

**Interfaces:**
- **Consumes:** `CoverPattern`, `initialsOf` (Task 5) and the
  `--cover-*` variables (Task 2).
- **Produces:**
  `<CoverPattern pattern={CoverPattern} initials={string} className? />`.
  It fills its parent (absolutely positioned SVG at 100% × 100%), is
  `aria-hidden`, draws only with `fill`/`stroke` from `var(--cover-*)`,
  and needs no network.

- [ ] **Step 1: Write the failing test,** `CoverPattern.test.tsx`:
  - for each of `COVERS`, it renders one `svg` with
    `aria-hidden="true"` and no `img` or `image` element;
  - `monogram` renders the initials text;
  - `hazard` sets its ground from `var(--accent)`.
- [ ] **Step 2: Run it to watch it fail.** Run:
  `npx vitest run src/components/CoverPattern`. Expected: FAIL.
- [ ] **Step 3: Implement the patterns** in the geometry of the
  canvas's Cover component (`Cover.dc.html`):
  - **dots:** a 24 px tile with a 7 px dot;
  - **stripes:** 135°, 20 px bands;
  - **pixels:** fixed cluster data, with a partner shadow at +5 px;
  - **orb:** a striped circle 1.7 × the height, a partner ring and a
    partner dot;
  - **symbols:** `& % @ / * + #`, alternating mark and partner;
  - **hazard:** a 115° fill and tint split, and an ink trefoil and
    ring;
  - **arrows:** a 64 px wayfinding tile at −45°;
  - **monogram:** initials at 1.55 × the height, with an outlined
    partner echo.

  Tiled patterns use `<pattern patternUnits="userSpaceOnUse">` with ids
  from `useId()`. The composed patterns use `viewBox` with
  `preserveAspectRatio="xMidYMid slice"`.
- [ ] **Step 4: Run it to watch it pass,** then run
  `npm run build && npm run size`. Expected: PASS, within the budget.
- [ ] **Step 5: Commit:** `feat: eight vector cover patterns (#129)`.

### Task 7: Choosing a cover, and the badge settings, in Style

**Files:**
- Create: `web/src/features/lanyard/customise/CoverPicker/` (4 files
  plus a test)
- Modify: `StylePanel.tsx` and `StylePanel.constants.ts`
- Test:
  - `StylePanel.test.tsx` (or the customise route test)
  - `web/e2e/customise.spec.ts`

**Interfaces:**
- **Consumes:** `CoverPattern`, `coverFor`, `initialsOf` and
  `<CoverPattern>`.
- **Produces:**
  `<CoverPicker value={CoverPattern} onChange={(c: CoverPattern) => void} initials disabled? />`,
  a Radix RadioGroup with "Cover" as its name. Each option is a 96×48
  live preview with the pattern's name in text.
- **The Style panel:**
  - **Cover** sits between Accent colour and Badge. Its value is
    `config.cover ?? coverFor(did)`.
  - **Badge** holds three checkboxes: "Show current role" (`showJob`),
    "Show location" and "Show what you're open to".
  - Analytics: `track('cover_changed', { cover })` and
    `track('badge_setting_changed', { setting, on })`.

- [ ] **Step 1: Write the failing tests.**
  - Unit tests:
    - choosing "Orb" calls `onChange` with `cover: 'orb'`;
    - the three checkboxes toggle `showJob`, `showLocation` and
      `showOpenTo`;
    - the derived cover shows as checked when `config.cover` is null.
  - e2e: the owner picks Pixels, saves, reloads, and Pixels is still
    checked, with the record written with `cover: 'pixels'`.
- [ ] **Step 2: Run them to watch them fail.** Run:
  `npx vitest run src/features/lanyard/customise`. Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`.
  Expected: PASS.
- [ ] **Step 5: Commit:** `feat: choose a cover and badge settings in
  Style (#129)`.

### Task 8: The billboard hero

**Files:**
- Modify:
  - `web/src/lib/person/hero.ts` and `personView.types.ts`
  - `BadgeHero/*` (rewritten)
  - `LanyardPage.tsx` and `.styles.ts`
  - `LanyardSkeleton/*`
  - `AppHeader.tsx` and `.styles.ts`
  - `LanyardEditor.tsx`
- Create:
  - `web/src/features/lanyard/components/HeroActions/` (4 files plus a
    test), replacing `VisitorActions`, which is deleted
  - `web/src/features/lanyard/components/DepartureBoard/` (4 files
    plus a test)
- Test:
  - `hero.test.ts`
  - `BadgeHero.test.tsx`
  - `HeroActions.test.tsx`
  - `DepartureBoard.test.tsx`
  - `web/e2e/lanyard.spec.ts`

**Interfaces:**
- **Consumes:** the config's `cover`, `showLocation`, `showOpenTo` and
  `hidden`; `coverFor`; `initialsOf`; `<CoverPattern>`.
- **Produces** on `BadgeHero` (the hero data):
  - `cover: CoverPattern`;
  - `initials: string`;
  - `role?: { title: string; company?: string; others: number }`;
  - `location?: string`;
  - `openTo: OpenToValue[]`.

  `composeHero` gains `did` and `hidden` inputs:
  - the role is `currentJob(positions minus hidden)`;
  - `others` counts the other visible current positions;
  - `openTo` is the Open to values not hidden.

  The badge settings gate the role, location and Open to.
- **Produces**
  `<BadgeHero hero headingLevel actions?={ReactNode} rolesHref?={string} />`.
  The "+N more roles" link renders only when `rolesHref` is given and
  `role.others > 0`; PR 3 wires it.
- **Produces** `<DepartureBoard role? location? openTo />` as a `<dl>`.
  It renders nothing when it is empty, and Open to shows up to two
  labels, then "+N".
- **Produces** `<HeroActions did handle mode />`:
  - owner: "Edit lanyard" (link to `/lanyard`) and `<ShowQrButton
    tone="badge" />`;
  - signed-in visitor: `FollowButton`;
  - signed-out visitor: "Follow on Bluesky".
- **AppHeader:** when signed out, it shows "Sign in" (link to `/` with
  `returnTo`) and "Make your lanyard" (`startSignUp`).

- [ ] **Step 1: Write the failing tests.**
  - `hero.test.ts`:
    - a hidden primary current role gives the next visible current
      role;
    - `others` counts only the visible current roles;
    - `showLocation: false` drops `location`, and `showOpenTo: false`
      empties `openTo`;
    - a hidden Open to value is left out;
    - with no cover chosen, `cover` is `coverFor(did)`.
  - `DepartureBoard.test.tsx`:
    - the cells are a `dl` with Now, Based and Open to;
    - three Open to values show two labels and "+1";
    - with nothing to show, it renders nothing.
  - `BadgeHero.test.tsx`:
    - the name is an `h1` (or `h2` in preview);
    - a 60-character single word stays within the hero (the class
      includes `[overflow-wrap:anywhere]`);
    - initials show when there is no avatar;
    - the cover is `aria-hidden`.
  - `HeroActions.test.tsx`: the three viewer cases.
  - `lanyard.spec.ts` at 320 px: no horizontal scroll with a very long
    name, the board shows Now, Based and Open to, and axe passes on
    the hero for each accent.
- [ ] **Step 2: Run them to watch them fail.** Run:
  `npx vitest run src/lib/person/hero.test.ts src/features/lanyard/components`.
  Expected: FAIL.
- [ ] **Step 3: Implement the spec's §7** with container queries
  (`@container` on the hero):
  - **Cover:** `h-60`, or `h-30` under 640 px, with the decorative slot
    span.
  - **Field:** `bg-accent text-on-accent`, with the focus ring set to
    `--focus-ring-on-accent` inside it.
  - **Avatar:** 136 px (96 px), with `-translate-y-1/2` overlap in a
    grid, not a margin.
  - **The name:** `font-extrabold leading-[0.92]
    tracking-[-0.035em] text-[clamp(44px,9cqi,104px)]`.
  - **The board:** ink, with labels in `--accent-text` dark.

  The `LanyardPage` hero is up to 1,120 px and the blocks up to 760 px.
  The skeleton mirrors the hero. `VisitorActions` is deleted, and its
  messages move into `HeroActions`.
- [ ] **Step 4: Run all the checks,** including the full e2e run.
  Then screenshot against the canvas's Profile boards, in light and
  dark, at 1280 px and 390 px. Expected: PASS, with the look matching.
- [ ] **Step 5: Commit:** `feat: the billboard hero (#129)`.

### Task 9: The hero waits up to 800 ms for Sifa and the record

**Files:**
- Modify:
  - `web/src/lib/person/usePersonView.ts`
  - `LanyardPage.tsx`
  - `DepartureBoard` (reserved height)
- Test:
  - `web/src/lib/person/usePersonView.test.tsx`
  - `web/e2e/perf.spec.ts` (unchanged budgets)

**Interfaces:** produces `heroReady: boolean` on `PersonViewState`.

`heroReady` is true once Bluesky is ready and either:
- the lanyard record and Sifa have settled (succeeded or failed); or
- 800 ms have passed since Bluesky became ready (`HERO_WAIT_MS = 800`).

`sifaPending: boolean` lets the board reserve its height.

- [ ] **Step 1: Write the failing tests** in
  `usePersonView.test.tsx`, with fake timers:
  - with Bluesky ready and Sifa pending, `heroReady` is false at
    799 ms and true at 800 ms;
  - with both settled at 100 ms, it is true at 100 ms;
  - with Sifa failed, it is true at once.
- [ ] **Step 2: Run them to watch them fail.** Expected: FAIL.
- [ ] **Step 3: Implement.** `LanyardPage` shows the skeleton until
  `heroReady`.
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`
  and `perf.spec.ts`. Expected: PASS, with LCP under 2.5 s and CLS
  under 0.1.
- [ ] **Step 5: Commit:** `feat: the hero waits briefly for its data
  (#129)`.

### Task 10: The Show QR badge

**Files:**
- Modify: `QrSheet/*` (rewritten) and `ShowQrButton/*` (its `tone`)
- Create:
  - `web/src/features/qr/useOwnerBadge.ts` and its test
  - `web/src/features/qr/components/LanyardStraps/` (4 files)
- Test:
  - `QrSheet.test.tsx`
  - `web/e2e/qr.spec.ts`

**Interfaces:**
- **Produces** `useOwnerBadge(did): { hero: BadgeHero | null; accent:
  Accent }`. It uses the same source queries and `composeHero`, and
  returns the fallbacks while they load or fail.
- **The sheet:**
  - it sets `data-accent={accent}` on its content and never calls
    `applyAccent`;
  - its background is `bg-[#4020DF]`, or ink when the accent is blue;
  - the card: `CoverPattern` at `h-24`, the name at 46 px, the role,
    pronouns and handle, the QR at ≥ 240 px on white,
    "Scan to see my lanyard", and the ink strip;
  - give-way order, through `@media (max-height: …)`: the straps, then
    the cover (`h-14`, then none), then the handle line, then the strip;
  - landscape keeps today's grid with the card's details.

- [ ] **Step 1: Write the failing tests.**
  - `useOwnerBadge.test.ts`: it falls back to the Bluesky name when
    Sifa fails, and to "Your lanyard" when everything fails.
  - `QrSheet.test.tsx`:
    - the content has `data-accent` set to the owner's accent;
    - `document.documentElement.dataset.accent` is unchanged after
      open and close;
    - the QR `svg` is present while the hero is loading.
  - `qr.spec.ts` at 320×640: the code's box is ≥ 240 px wide and fully
    in the viewport with no scroll. Opening from another person's mint
    lanyard while the owner is pink: the card's computed background is
    the pink fill, and the page is mint again after Close. Axe passes.
- [ ] **Step 2: Run them to watch them fail.** Expected: FAIL.
- [ ] **Step 3: Implement.** Wake lock, Copy link, Close and return
  focus stay as today.
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`
  and `qr.spec.ts`. Expected: PASS. Then screenshot against the
  canvas's Show QR board.
- [ ] **Step 5: Commit:** `feat: Show QR becomes the badge (#129)`.

### Task 11: Restyle the link-preview image, and PR 2

**Files:**
- Modify: `web/server/badgeImage.ts` and `web/server/fonts.ts`
- Test: `web/server/badgeImage.test.ts`

- [ ] **Step 1: Write the failing test.** The rendered tree uses font
  family `Rethink Sans`, the ink `#06011E` (not `#1F1638`), and corners
  of 1 or 3 px only.
- [ ] **Step 2: Run it to watch it fail.** Expected: FAIL.
- [ ] **Step 3: Implement.** Load Rethink Sans for satori, from the
  fontsource files at the weights used.
- [ ] **Step 4: Run all the checks,** including the full e2e run.
  Expected: PASS.
- [ ] **Step 5: Commit** `feat: restyle the link-preview image
  (#129)`, then push and open PR 2 with "Closes #129". The PR names the
  lexicon republish.

---

## PR 3: Roles (#130)

Branch: `feature/issue-130-roles`.

### Task 12: The Roles block's data

**Files:**
- Modify:
  - `web/src/lib/lexicons/nsids.ts` (`BLOCK_TYPES` gains `'roles'`)
  - `lanyard.json` (the block type's `knownValues`) and the generated
    types
  - `config.ts`:
    - `DEFAULT_BLOCK_ORDER` puts `roles` after `links`;
    - `DEFAULT_VISIBLE` gains it;
    - `resolveConfig` inserts a block the record doesn't mention after
      its nearest preceding block in the default order, or first.
  - `blocks.ts`:
    - `BLOCK_SOURCES.roles = ['sifa']`;
    - an item getter that sorts the roles;
    - `COLLECTION_BLOCKS['id.sifa.profile.position'] = 'roles'`.
  - `personView.types.ts` (`BlockItems.roles: SifaPosition`)
  - `editLinks.ts` (`roles: sifa('career')`)
  - `itemTitle.ts` (`roles: (item) => item.title`)
- Test: `config.test.ts` and `blocks.test.ts`

**Interfaces:** produces `sortRoles(positions: SifaPosition[]):
SifaPosition[]`. It puts current roles first (the primary, then the
newest `startedAt`), then past roles (the newest `endedAt`), with
undated roles last.

- [ ] **Step 1: Write the failing tests.**
  - `config.test.ts`:
    - a stored config `[links, talks]` resolves to `[links, roles,
      talks, …]` with roles visible;
    - `[talks]` resolves to `[roles, talks, …]`;
    - the stored order otherwise holds.
  - `blocks.test.ts`:
    - `sortRoles` orders a mixed set exactly as described;
    - a position's AT-URI maps to the `roles` block for hiding.
- [ ] **Step 2: Run them to watch them fail.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run them to watch them pass,** then run `npm test`
  and `lex:check`. Expected: PASS.
- [ ] **Step 5: Commit:** `feat: the Roles block's data (#130)`.

### Task 13: The Roles block, "+N more roles", and PR 3

**Files:**
- Create: `web/src/features/lanyard/components/blocks/RolesBlock/`
  (4 files plus a test)
- Modify:
  - `LanyardBlocks.constants.ts` (heading "Roles" and the component)
  - `BlockSection` (an optional `id` on the section; the heading takes
    `tabIndex={-1}` for the link)
  - `LanyardPage.tsx` (passes `rolesHref="#roles"` when the Roles block
    is visible)
- Test:
  - `RolesBlock.test.tsx`
  - `BadgeHero.test.tsx`
  - `web/e2e/lanyard.spec.ts` and `customise.spec.ts`

**Interfaces:** consumes `sortRoles` and `formatPartialDate`.

Each row has:
- a monogram tile (the company's first grapheme, else "·");
- the title;
- the company;
- the dates, "Mar 2019 – now" or "2015 – 2019";
- a "Now" tag on current roles.

Rows use the shared `ItemFrame`, so they can be hidden.

- [ ] **Step 1: Write the failing tests.**
  - `RolesBlock.test.tsx`:
    - rows in the given order;
    - "Now" only on current roles;
    - `startedAt: '2019-03'` and no end reads "Mar 2019 – now";
    - no company gives "·".
  - `BadgeHero.test.tsx`: with `rolesHref` and `others: 2`, a link
    "+2 more roles" points to `#roles`, and with `others: 0` there is
    no link.
  - e2e: the Roles block shows the fixture's positions. Hiding one in
    the customiser and saving removes it from the public page, and from
    the hero's count.
- [ ] **Step 2: Run them to watch them fail.** Expected: FAIL.
- [ ] **Step 3: Implement.** Activating the "+N more roles" link
  scrolls to the Roles block and focuses its heading.
- [ ] **Step 4: Run all the checks,** including the full e2e run.
  Expected: PASS.
- [ ] **Step 5: Commit** `feat: the Roles block (#130)`, then push and
  open PR 3 with "Closes #130". The PR names the lexicon republish.
