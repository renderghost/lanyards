# Lanyard Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework #118's PR 4 so that:
- titles come from Sifa;
- links come from Sifa and Bluesky only;
- podcasts and videos are edited in a dialog.

Then give the lanyard:
- bordered blocks with one header row;
- pills for Links, Open to and Skills;
- cards that open their one destination.

**Architecture:**
- **Part 1** reworks the unpushed PR 4 commits on
  `feature/issue-118-records-in-place`. It closes #118.
- **Part 2** is a new issue, built in two PRs on a branch stacked on PR 4:
  - PR A: the canvas, the block frame and header row, pills, and the
    renames;
  - PR B: cards.
- **Shared pieces:**
  - pills and cards are new item components beside `ItemFrame` (which
    Details keeps);
  - `BlockSection` gains the header-row slots that `BlockBar` filled.

**Tech Stack:** Vite, React 19, TypeScript, Tailwind v4, `radix-ui`,
@dnd-kit, TanStack Query, Lingui, Vitest with MSW and axe, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-19-lanyard-layout-design.md`.
It amends `docs/superpowers/specs/2026-11-19-customiser-redesign-design.md`.

## Global Constraints

- **CLAUDE.md:**
  - the 4-file component structure;
  - no margin utilities;
  - `leading-*` on all text;
  - `cn()` for conditional classes;
  - no inline styles, except dnd-kit's transform, which is already
    documented;
  - single quotes;
  - British English through Lingui.
- **Every commit** passes `npm run lint`, `npm run typecheck` and
  `npx vitest run`, all run from `web/`.
- **Chrome and lanyard tokens stay apart:**
  - chrome uses `ui-*`, the lanyard its own tokens;
  - `web/scripts/styleRules.test.ts` stays green;
  - chrome radii are 8–14 px.
- **Images** load only from `cdn.bsky.app`, through `cdnImage` or the new
  `blobThumbnail`.
- **Targets** are at least 44 px. Text contrast is at least 4.5:1, with
  axe passing in light and dark.
- **Never delete or rewrite people's records.** Old `app.lanyards.link.web`
  and `app.lanyards.actor.biography.honorific` records are left unread.
- **Stored config keys** stay `blogPosts` and `bskyPosts`.
- **Initial JS budget:** 200 KB gzipped
  (`PUBLIC_BASE_URL=https://ci.lanyards.invalid npm run build && npm run size`).
- **e2e** is run as
  `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e -- --trace off`.

## Review Focus

1. **Sifa honorifics at the edges:**
   - `showHonorifics: false`, a suffix with no prefix, or Sifa
     unavailable give a clean name;
   - there's never a stray space or a dangling comma.

   Tests: Task 1, `heroName` cases.
2. **A hidden entry for a URL only an own web-link record supplied**
   becomes an orphan.
   - It shows in the "no longer on your lanyard" line, and Clear removes
     it.
   - It never throws or hides a Sifa link by accident.

   Test: Task 2.
3. **Saving with the media dialog open:**
   - while the records draft isn't ready, or a Save is in flight, Add and
     Edit are unavailable;
   - an open dialog's submit is disabled, so nothing lands in a draft
     that is being replaced.

   Test: Task 4.
4. **Long labels in pills at 320 px:**
   - a 100-character link title, or a skill with no spaces, truncates
     inside its pill;
   - the page never scrolls sideways.

   Test: Task 7, e2e.
5. **Keyboard and screen readers on cards:**
   - Tab reaches exactly one link per card on the public page, and the
     card shows its focus ring;
   - a card with no destination (a talk without a page, Education) has
     no link and no pointer cursor.

   Tests: Tasks 9 and 10.

---

## Part 1: PR 4 reworked (#118)

Branch: `feature/issue-118-records-in-place`, already rebased onto `main`
(`d8c2fe2`). Pushes go to `claude/lanyards-rebuild-attendee-ux-vcl1sb`.

### Task 1: Titles from Sifa

**Files:**
- Modify:
  - `web/lexicons/vendor/id/sifa/profile/self.json` and
    `web/lexicons/vendor/id/sifa/getProfileView.json` (`npm run lex:pull`),
    then the generated `web/src/lexicons/` (`npm run lex:gen`);
  - `web/src/lib/sources/sifa/sifa.ts` and `sifa.types.ts`;
  - `web/src/lib/sources/sifa/fixtures/getProfileView.json`: add
    `"honorificPrefix": "Dr"`;
  - `web/src/lib/person/hero.ts` and `personView.types.ts`;
  - `web/src/features/lanyard/components/BadgeHero/BadgeHero.tsx`;
  - every other reader of `hero.honorific`. Find them with
    `grep -rn "honorific" web/src web/api` and skip the lexicon files.
- Test:
  - `web/src/lib/sources/sifa/sifa.test.ts`;
  - `web/src/lib/person/hero.test.ts`;
  - `web/src/features/lanyard/components/BadgeHero/BadgeHero.test.tsx`.

**Interfaces:**
- Produces:
  - `SifaProfile` gains `honorificPrefix?: string`,
    `honorificSuffix?: string` and `showHonorifics: boolean` (absent in the
    view means `true`).
  - `BadgeHero` loses `honorific`, and gains `honorificPrefix?: string` and
    `honorificSuffix?: string`, set only when `showHonorifics` is true.
  - `heroName(hero: Pick<BadgeHero, 'displayName' | 'honorificPrefix' | 'honorificSuffix'>): string`,
    in `hero.ts`.
  - `composeHero`'s input loses `lanyards`.

- [ ] **Step 1: Write the failing tests.**
  - `sifa.test.ts`, "maps honorifics and their show switch": a view with
    `honorificPrefix: 'Prof.', honorificSuffix: 'OBE', showHonorifics: false`
    gives exactly those three fields. A view without `showHonorifics` gives
    `showHonorifics: true`.
  - `hero.test.ts`, "takes the title from Sifa, honouring its switch":
    - with Sifa's prefix `'Dr'`, the hero has `honorificPrefix: 'Dr'`;
    - with `showHonorifics: false`, neither field is set;
    - with `sifa: null`, neither field is set.
  - `hero.test.ts`, "heroName":

    ```ts
    expect(heroName({ displayName: 'Ada Example', honorificPrefix: 'Dr' })).toBe('Dr Ada Example');
    expect(heroName({ displayName: 'Ada Example', honorificSuffix: 'PhD' })).toBe('Ada Example, PhD');
    expect(heroName({ displayName: 'Ada Example', honorificPrefix: 'Dr.', honorificSuffix: 'PhD' })).toBe('Dr. Ada Example, PhD');
    expect(heroName({ displayName: 'Ada Example' })).toBe('Ada Example');
    ```
  - `BadgeHero.test.tsx`: the level-2 heading reads
    `'Prof Ada Example, OBE'` for a hero with that prefix and suffix.
- [ ] **Step 2: Run** `npx vitest run src/lib/sources/sifa src/lib/person/hero src/features/lanyard/components/BadgeHero`.
  Expected: FAIL. The fields are missing, and `heroName` isn't defined.
- [ ] **Step 3: Implement.**
  - Run `npm run lex:pull` then `npm run lex:gen`. `lex:check` must stay
    clean.
  - Map the three fields in the Sifa adapter.
  - Set them in `composeHero`, from Sifa only.
  - Give the badge heading `heroName(hero)`.
  - Replace every other reader of `hero.honorific` with `heroName`.
- [ ] **Step 4: Run** the same tests, then the full check.
  Expected: PASS. The headings "Dr Ada Example" in other tests still pass,
  because the fixture's prefix is "Dr".
- [ ] **Step 5: Commit**
  `feat: take the title from Sifa (#118)`.

### Task 2: Links from Sifa and Bluesky only; no Lanyards title

**Files:**
- Modify:
  - `web/src/lib/sources/lanyards/lanyards.ts`, `lanyards.types.ts` and
    the fixtures;
  - `web/src/lib/person/blocks.ts` (`mergeLinks`) and
    `personView.types.ts` (`LinkItem`);
  - `web/src/features/lanyard/hooks/useKeptRecordsDraft.ts` and
    `useCustomiserDraft.ts`;
  - `web/src/features/lanyard/customise/LanyardEditor/LanyardEditor.tsx`;
  - `web/src/features/lanyard/customise/CustomisePage/CustomisePage.tsx`;
  - `web/src/test/person.ts`: drop the `webLinks` option and the honorific
    mock;
  - `web/e2e/mocks.ts`.
- Delete:
  - `web/src/features/lanyard/customise/LinkEditor/`;
  - `HonorificControl/`;
  - `WebLinkForm/`.
- Test:
  - `lanyards.test.ts`;
  - `blocks.test.ts`;
  - `useKeptRecordsDraft.test.tsx`;
  - `useCustomiserDraft.test.tsx`;
  - `LanyardEditor.test.tsx`;
  - `web/src/app/customise.test.tsx`;
  - `web/e2e/customise.spec.ts`.

**Interfaces:**
- Consumes: Task 1's hero, which no longer reads `lanyards`.
- Produces:
  - `LanyardRecords = { media: MediaLink[] }`.
  - `fetchLanyardRecords(did, signal)` lists only audio and video.
  - `LinkItem` without `ownKey`.
  - `UseKeptRecordsDraft = { records, ready, dirty, changes, addMedia, updateMedia, removeMedia, save, discard }`.
  - `KEPT_LISTS = [LANYARDS_NSID.audio, LANYARDS_NSID.video]`.
  - The records permission is create, update and delete on both.

- [ ] **Step 1: Write the failing tests.**
  - `lanyards.test.ts`, "reads only podcasts and videos": with web-link
    and honorific records served, the result `toEqual({ media: [...] })`,
    and no request goes to `app.lanyards.link.web` or to the honorific.
  - `blocks.test.ts`, "links come only from Bluesky and Sifa": given
    `lanyards` records holding a web link, the Links items contain no
    URL from them, and no item has `ownKey`.
  - `blocks.test.ts`, "a hidden key only an own link supplied becomes an
    orphan" (Review Focus 2): `orphanedHiddenKeys` returns that
    normalised URL.
  - `customise.test.tsx`:
    - "links can only be hidden": in the Links block there's no
      "Add a link" and no Edit or Delete button, but there is
      `Hide GitHub`;
    - "has no Title control": no combobox named Title;
    - "a session without the web-link or title scopes can still edit
      podcasts": the scope grants audio and video only, no permission
      notice shows, and "Add a podcast or video" is enabled.
- [ ] **Step 2: Run** those files. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Remove the link and honorific paths from:
    - the source;
    - `mergeLinks`;
    - the draft: `addLink`, `updateLink`, `removeLink`, `setHonorific`,
      `LinkFields`, `HonorificValue`, and the honorific `Change`;
    - `allowed()`;
    - `canKeep`;
    - `LanyardEditor`: the Links content slot and `HonorificControl`.
  - Delete the three directories.
  - Remove whatever lint then reports as unused.
  - Drop the link and honorific tests that no longer apply.
  - In e2e, delete the link and Title flows. Task 4 adds the podcast flow.
- [ ] **Step 4: Run** the full check, then e2e. Expected: PASS.
- [ ] **Step 5: Commit**
  `feat: links from Sifa and Bluesky only, no Lanyards title (#118)`.

### Task 3: Dialog primitive

**Files:**
- Create: `web/src/components/Dialog/Dialog.tsx`, `.types.ts` and
  `.styles.ts`.
- Test: `web/src/components/Dialog/Dialog.test.tsx`.

**Interfaces:**
- Produces:

  ```ts
  type DialogProps = {
    open: boolean;
    onOpenChange(open: boolean): void;
    /** Visible heading; names the dialog. */
    title: string;
    children: ReactNode;
    /** Called once the dialog has closed, to put focus back on its opener. */
    returnFocus?(): void;
    className?: string;
  };
  ```

  It's a modal on `radix-ui`'s Dialog, as `Sheet` is.

- [ ] **Step 1: Write the failing tests:**
  - "is named by its title": `getByRole('dialog', { name: 'Add a podcast or video' })`;
  - "focuses its first field when it opens": with a `TextField` as its first
    child, the field has focus. The Close button comes after the content,
    in DOM order.
  - "Escape closes it and returnFocus runs": `onOpenChange(false)` and
    `returnFocus` are each called once.
  - "a click outside doesn't close it": `onOpenChange` is not called.
  - "has no axe violations".
- [ ] **Step 2: Run** `npx vitest run src/components/Dialog`.
  Expected: FAIL (module missing).
- [ ] **Step 3: Implement `Dialog`.**
  - Use `onOpenAutoFocus` to focus the first field.
  - Use `onPointerDownOutside` and `onInteractOutside` with
    `preventDefault`.
  - Use `onCloseAutoFocus` with `preventDefault`, then call
    `returnFocus`.
  - Style it with chrome tokens:
    - a radius between 8 and 14 px;
    - a full-width sheet below `sm`;
    - a centred panel at `sm` and up.
- [ ] **Step 4: Run** the tests and `scripts/styleRules.test.ts`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: a dialog primitive (#118)`.

### Task 4: Podcasts and videos in a dialog

**Files:**
- Modify:
  - `web/src/features/lanyard/customise/MediaEditor/MediaEditor.tsx` and
    its styles;
  - `web/src/features/lanyard/hooks/useInPlaceEditing.ts`: drop `form`;
  - `web/src/features/lanyard/components/blocks/itemActions.ts` and
    `ItemFrame/ItemFrame.tsx`: drop `renderEditor`;
  - `docs/superpowers/specs/2026-11-19-customiser-redesign-design.md`: add
    an "Amended by 2026-11-19-lanyard-layout-design.md" note at the top of
    "Editing kept records in place";
  - `web/src/i18n/locales/en-GB/messages.po` (`npm run i18n:extract`).
- Test:
  - `MediaEditor.test.tsx`;
  - `ItemFrame.test.tsx`;
  - `web/src/app/customise.test.tsx`;
  - `web/e2e/customise.spec.ts`.

**Interfaces:**
- Consumes:
  - `Dialog` (Task 3);
  - `UseKeptRecordsDraft` (Task 2).
- Produces:
  - `MediaEditor` keeps its props.
  - `ItemActions` is `{ isHidden, renderToggle, renderEdit? }`.

**Copy:**
- the button: "Add a podcast or video";
- the dialog titles: "Add a podcast or video" and `Edit ${title}`;
- the announcements: `${name} added`, `${name} updated` and
  `${title} deleted`.

- [ ] **Step 1: Write the failing tests** in `MediaEditor.test.tsx`:
  - "Add opens a dialog; a valid entry closes it, joins the draft and
    focus returns to Add":
    - after submitting, `addMedia` was called with the fields;
    - `queryByRole('dialog')` is null;
    - the Add button has focus;
    - the status reads "… added".
  - "Edit opens the dialog filled in; Update closes it and focus returns to
    Edit {title}".
  - "Cancel discards what was typed": reopening Add shows empty fields.
  - "Delete removes the entry, says so and focuses Add".
  - "while saving, Add and Edit do nothing, and an open form can't submit"
    (Review Focus 3): rerender with `disabled`, and the dialog's submit
    button is disabled.
  - "has no axe violations with the dialog open".
  - `customise.test.tsx`, "adds a podcast in a dialog; it's saved only on
    Save": no `applyWrites` request until Save, then one batch with a
    `#create` on `app.lanyards.link.media.audio`.
  - e2e:
    - "adds a podcast in the dialog and saves it";
    - "stays accessible with the podcast dialog open", light and dark.
      This replaces "stays accessible while adding a link".
- [ ] **Step 2: Run** those files. Expected: FAIL (no dialog).
- [ ] **Step 3: Implement.**
  - The forms open in `Dialog` instead of in place.
  - `returnFocus` focuses the opener: Add, or that card's Edit.
  - Remove `renderEditor` and `useInPlaceEditing.form`.
  - Add the spec note, then run `npm run i18n:extract`.
- [ ] **Step 4: Run** the full check, e2e and size. Expected: PASS, and
  the budget at or under 200 KB.
- [ ] **Step 5: Commit**
  `feat: podcasts and videos in a dialog (#118)`.
- [ ] **Step 6: PR 4.**
  - Run the whole-branch review on opus over `d8c2fe2..HEAD`, then the fix
    pass.
  - Push to `claude/lanyards-rebuild-attendee-ux-vcl1sb`.
  - Open the PR "Records in place: podcasts in a dialog, titles from Sifa
    (#118)", with `Closes #118`.
  - Subscribe to it.

---

## Part 2: The layout (new issue)

### Task 5: The lanyard's own ground in the customiser

**Files:**
- Modify:
  - `web/src/features/lanyard/components/LanyardSurface/` (all 4 files);
  - `LanyardPage/LanyardPage.tsx`;
  - `web/src/features/lanyard/customise/LanyardEditor/LanyardEditor.tsx`;
  - `CustomisePage/CustomisePage.tsx` and `.styles.ts`.
- Test:
  - `LanyardSurface.test.tsx`;
  - `web/src/app/customise.test.tsx`.

**Interfaces:**
- Produces:
  - `LanyardSurface({ children, className })`: no `variant`. It renders
    `data-lanyard-surface` on the lanyard's ground.
  - `LanyardPage` with `preview` set renders without its own surface.

- [ ] **Step 0: Open the issue.**
  - Create the GitHub issue "Lanyard layout: bordered blocks, pills and
    cards", linking the spec. Add it as a sub-issue of #94.
  - Branch `feature/issue-<N>-lanyard-layout` from the PR 4 branch head.
  - Use `<N>` in every Part 2 commit.
- [ ] **Step 1: Write the failing tests.** `customise.test.tsx`, "the
  lanyard sits on its own ground, with no box round it":
  - in edit mode and in "View as public",
    `container.querySelectorAll('[data-lanyard-surface]')` has length 1;
  - the Preview region and the h1 are inside it.
- [ ] **Step 2: Run** it. Expected: FAIL. Today there's a surface card inside
  the grey canvas.
- [ ] **Step 3: Implement.**
  - Remove the `card` variant.
  - The canvas becomes one `LanyardSurface` holding the intro, the
    notices and the editor or preview.
  - The intro uses lanyard text tokens; the notices stay chrome panels.
  - `LanyardEditor`'s loading and problem states lose their wrapper.
- [ ] **Step 4: Run** the full check. Expected: PASS.
- [ ] **Step 5: Commit**
  `feat: the customiser's canvas is the lanyard's own ground (#<N>)`.

### Task 6: Block frame and one header row

**Files:**
- Modify:
  - `web/src/features/lanyard/components/BlockSection/` (all 4 files);
  - `web/src/features/lanyard/customise/EditableBlock/`.
- Create:
  - `web/src/features/lanyard/customise/BlockControls/`;
  - `BlockHandle/`.
- Delete: `web/src/features/lanyard/customise/BlockBar/`. Its tests move
  to the two new components.
- Test:
  - `BlockSection.test.tsx`;
  - `BlockControls.test.tsx`;
  - `BlockHandle.test.tsx`;
  - `EditableBlock.test.tsx`;
  - `LanyardEditor.test.tsx`;
  - `web/e2e/customise.spec.ts`.

**Interfaces:**
- Produces:
  - `BlockSectionProps` gains:

    ```ts
    /** Before the name: the customiser's drag handle. */
    handle?: ReactNode;
    /** Under the name, e.g. "Hidden from visitors". */
    note?: string;
    /** After the Edit-on links: the customiser's block controls. */
    controls?: ReactNode;
    /** Only the header row, in a dashed frame. */
    collapsed?: boolean;
    ```
  - `BlockControls({ type, index, total, visible, limit?, disabled, onMove, onVisibleChange, onLimitChange? })`:
    the count select, Move up, Move down and the switch.
  - `BlockHandle({ type, disabled, dragHandle })`.
  - Their accessible names are unchanged from `BlockBar`:
    - "Reorder {name}";
    - "Items to show for {name}";
    - "Move {name} up" and "Move {name} down";
    - "Show {name}".

- [ ] **Step 1: Write the failing tests.**
  - `BlockSection.test.tsx`:
    - "frames the block with one header row": `handle`, the `h2`,
      `editLinks` and `controls` are all inside the element with
      `data-block-header`, in that order;
    - "collapsed shows only the header row, with its note": no content,
      no skeleton; `note` is under the heading; the frame has
      `data-collapsed`.
  - `EditableBlock.test.tsx`, "names the block once": within the block
    only one element's text is "Links", and it's the level-2 heading.
  - Keep the existing keyboard tests green:
    - hiding keeps focus on the switch;
    - Move keeps focus;
    - drag announcements.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Split `BlockBar` into `BlockHandle` and `BlockControls`.
  - `EditableBlock` always renders `BlockSection`, passing `handle`,
    `controls` and, while hidden, `note` and `collapsed`.
  - Frame style:
    - lanyard `border` token, 1 px;
    - a radius of about 16 px;
    - padding;
    - dashed when collapsed.
  - The public `LanyardBlocks` gets the frame too, with no handle and no
    controls.
  - The header row wraps below `sm`.
- [ ] **Step 4: Run** the full check and e2e. Update "names every block in
  full on its bar at 390 px" to the header row. Expected: PASS.
- [ ] **Step 5: Commit**
  `feat: every block framed, with one header row (#<N>)`.

### Task 7: Pills for Links, Open to and Skills

**Files:**
- Create: `web/src/features/lanyard/components/blocks/PillItem/`.
- Modify:
  - `LinksBlock/`;
  - `OpenToBlock/`;
  - `SkillsBlock/`;
  - `shared.styles.ts`: the `chips` and `chip` styles become `pills`.
- Test:
  - `PillItem.test.tsx`;
  - the three blocks' tests;
  - `web/e2e/lanyard.spec.ts`.

**Interfaces:**
- Produces:

  ```ts
  type PillItemProps = {
    itemKey: string;
    /** For its controls' names. */
    title: string;
    label: string;
    /** Links only: on the public page the whole pill is the link. */
    href?: string;
    /** Links only: favicon or platform icon, on the left. */
    icon?: ReactNode;
    className?: string;
  };
  ```

- [ ] **Step 1: Write the failing tests** (`PillItem.test.tsx`):
  - "public: the whole pill is one link": `getByRole('link', { name: 'GitHub' })`;
    there's no other interactive element, and no wrapper is drawn around
    the link.
  - "editor: the toggle sits inside the pill, beside the link, never in
    it": `link.contains(toggle)` is false, and they share a parent.
  - "hidden: dashed, with '(hidden)' for screen readers": `data-hidden`,
    plus `getByText('(hidden)')` with class `sr-only`.
  - "no href: a plain label" (Open to, Skills): no link.
  - e2e (Review Focus 4), "long pill labels truncate at 320 px": at a
    viewport 320 px wide, with a 100-character link title and an
    unbroken skill, `document.documentElement.scrollWidth <= 320`.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Each pill is rounded-full, at least 44 px tall, vertically centred,
    at most the row's width, and truncates its label.
  - Lists are `flex flex-wrap` with a small gap.
  - The three blocks render `PillItem` instead of `ItemFrame`.
- [ ] **Step 4: Run** the full check and e2e. Expected: PASS.
- [ ] **Step 5: Commit**
  `feat: links, Open to and skills as pills (#<N>)`.

### Task 8: Rename Articles and Social posts

**Files:**
- Modify:
  - `web/src/features/lanyard/components/LanyardBlocks/LanyardBlocks.constants.ts`
    (`BLOCK_HEADINGS`);
  - every test and e2e string naming "Blog posts" or "Posts on Bluesky";
  - `messages.po`.

- [ ] **Step 1: Update the tests to the new names,** first
  `LanyardBlocks.test.tsx`: the headings "Articles" and "Social posts".
- [ ] **Step 2: Run** them. Expected: FAIL (the old headings).
- [ ] **Step 3: Implement** `blogPosts: msg\`Articles\`` and
  `bskyPosts: msg\`Social posts\``. Run `npm run i18n:extract`.
- [ ] **Step 4: Run** the full check and e2e. Expected: PASS.
- [ ] **Step 5: Commit**
  `feat: rename Blog posts to Articles and Bluesky posts to Social posts (#<N>)`.
- [ ] **Step 6: PR A.**
  - Run the whole-branch review on opus over Tasks 5–8, then the fix
    pass.
  - Once PR 4 has merged, rebase onto `main` and push.
  - Open the PR "Lanyard layout A: frames, header rows and pills", with
    `Refs #<N>`.
  - Subscribe to it.

### Task 9: Cards; Articles with thumbnails; Social posts

**Files:**
- Create:
  - `web/src/features/lanyard/components/blocks/CardItem/`;
  - `CardLink/`.
- Modify:
  - `web/src/lib/atproto/avatar.ts`, adding `blobThumbnail`;
  - `web/src/lib/sources/standardSite/standardSite.ts` and `.types.ts`;
  - `BlogPostsBlock/`;
  - `BskyPostsBlock/`.
- Test:
  - `avatar.test.ts`;
  - `standardSite.test.ts`;
  - `CardItem.test.tsx`;
  - `CardLink.test.tsx`;
  - the two blocks' tests.

**Interfaces:**
- Produces:

  ```ts
  /** cdn.bsky.app feed thumbnail for an image blob in `did`'s repo, else undefined. */
  function blobThumbnail(did: string, blob: unknown): string | undefined;

  type CardItemProps = {
    itemKey: string;
    title: string; // for its controls' names
    thumbnail?: ReactNode;
    children: ReactNode;
    className?: string;
  };

  type CardLinkProps = {
    href: string;
    children: ReactNode;
    /** Accessible name when it differs from the text; must contain it. */
    label?: string;
    className?: string;
  };
  ```

  - `BlogPost` gains `thumbnail?: string`.
  - `CardItem` does in the editor what `ItemFrame` does: the toggle,
    `renderEdit` and the "Hidden" tag.
  - `CardLink` stretches over its card only outside the editor, that is
    when there's no `ItemActionsContext`.

- [ ] **Step 1: Write the failing tests.**
  - `avatar.test.ts`, "blobThumbnail": for an image blob, the result is
    `https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:ada/<cid>@jpeg`.
    A non-image blob, a missing `ref`, or `undefined` gives `undefined`.
  - `standardSite.test.ts`: a document with `coverImage` has `thumbnail`,
    and one without has none.
  - `CardLink.test.tsx`:
    - "public: the link stretches over the card": the link has
      `after:absolute after:inset-0`;
    - "editor: a plain link".
  - `CardItem.test.tsx`:
    - "one link per card, and its focus ring shows on the card"
      (Review Focus 5): `getAllByRole('link')` has length 1, and the card
      has the `has-[a:focus-visible]` ring class;
    - "editor: controls are siblings of the link".
  - `BlogPostsBlock.test.tsx`:
    - "a card with its thumbnail": `img` has the `cdn.bsky.app` src,
      `alt=""` and `loading="lazy"`;
    - "a card without a cover shows the document icon".
  - `BskyPostsBlock.test.tsx`, "plain text; the date is the link, named
    Post on Bluesky": there's no link in the text, and
    `getByRole('link', { name: 'Post on Bluesky, 12 Nov 2026' })` exists.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - Build `CardItem` and `CardLink`.
  - The thumbnail is about 64 × 48, cropped to cover, on a subtle tile
    with a `FileText` icon fallback.
  - Social posts drop `RichText` for plain, clamped text.
- [ ] **Step 4: Run** the full check and e2e. Expected: PASS.
- [ ] **Step 5: Commit**
  `feat: cards for articles and social posts (#<N>)`.

### Task 10: Cards for the other blocks

**Files:**
- Modify:
  - `TalksBlock/`;
  - `PublicationsBlock/`;
  - `EducationBlock/`;
  - `CodeBlock/`;
  - `CollectionsBlock/`;
  - `MediaBlock/`.
- Test: each block's test, plus `web/e2e/lanyard.spec.ts`.

**Interfaces:**
- Consumes: `CardItem` and `CardLink` (Task 9).

- [ ] **Step 1: Write the failing tests,** one per block, each asserting
  one link per card on the public page with the spec's content:
  - Talks without a URL, and every Education card, have no link and no
    `cursor-pointer` (Review Focus 5);
  - "Collections don't list their links": no link but the collection's;
  - Media: the link has `target="_blank"`.
  - e2e, "Tab reaches one link per card": on the public lanyard, Tab
    through Articles. Each Tab lands on the next card's link.
- [ ] **Step 2: Run** them. Expected: FAIL.
- [ ] **Step 3: Implement** each block with `CardItem` and `CardLink`.
  - The content follows the spec's table.
  - Media's Edit and Delete keep working through `renderEdit`.
- [ ] **Step 4: Run** the full check, e2e and size. Expected: PASS, and
  the budget at or under 200 KB.
- [ ] **Step 5: Commit**
  `feat: cards for talks, publications, education, code, collections and media (#<N>)`.
- [ ] **Step 6: PR B.**
  - Run the whole-branch review on opus over Tasks 9–10, then the fix
    pass.
  - Push after PR A merges.
  - Open the PR "Lanyard layout B: cards", with `Closes #<N>`.
  - Subscribe to it.
