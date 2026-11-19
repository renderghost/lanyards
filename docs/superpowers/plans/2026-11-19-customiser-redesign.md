# Customiser redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/lanyard` as an in-place editor (pinned style sidebar, block bars and record toggles on the lanyard, draft Save/Reset, View as public) in a new neutral design language for all app chrome.

**Architecture:**
- **Tokens:** the app chrome gets its own neutral `ui-*` tokens. The lanyard keeps its brand tokens and accent palettes, and a style-rules test keeps the two apart.
- **Editor:** the customiser renders its own `LanyardEditor`, built from the public lanyard's pieces (BadgeHero, BlockSection, block item components), so dnd-kit and the editing controls stay out of the public bundle. "View as public" keeps rendering `LanyardPage preview="visitor"`.
- **Saving:** every change is a draft until Save. Lanyard settings keep the conflict-safe save from #114; kept records are saved in one atomic `applyWrites` batch.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Radix (`radix-ui`), TanStack Router/Query, @dnd-kit, Lingui, Vitest + Testing Library + MSW + axe, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-19-customiser-redesign-design.md` (changes §7.4 of `docs/superpowers/specs/2026-11-10-attendee-ux-design.md`). Issue #118. Mockups: https://claude.ai/artifact/73eRbEHcrhBjaS6ArYiVzA (option A).

## Global Constraints

- **Code rules (CLAUDE.md):**
  - Every component uses the four-file structure (`X.tsx`, `X.types.ts`, `X.styles.ts`, optional `X.constants.ts`), plus `X.test.tsx`.
  - Tailwind only: no inline styles except dnd-kit's drag transform, no margin utilities (`scripts/styleRules.test.ts`), `leading-*` on all text, and `cn()` for conditional classes.
- **Copy:** British English through Lingui (`t`/`msg`). Run `npm run i18n:extract` before a commit that adds copy; `npm run i18n:check` must pass.
- **Accessibility:**
  - 44 px minimum targets, with the global 2 px `focus-ring` outline never removed.
  - Text contrast ≥ 4.5:1, and control boundaries ≥ 3:1 (checked by tests).
  - Axe passes in light and dark, and keyboard reordering keeps its announcements.
- **Bundle:** the public lanyard routes stay ≤ 200 KB of gzipped initial JS (`npm run size`). Radix Accordion/ToggleGroup/Dialog-as-sheet and dnd-kit may only be imported by `/lanyard` code.
- **Settings save:** keep #114's `swapRecord`, the three-way `mergeConfig` and the stable failure-toast id (`lanyard-settings-save`).
- **Feed blocks** (`bskyPosts`, `blogPosts`, `code`, `collections`) keep an item count. Every other block shows all records that aren't hidden, and any stored `limit` on them is ignored.
- **Colours:**
  - brand primary for chrome: `#4020DF` (the existing `--color-purple-vivid-500`);
  - unsaved dot: amber.
- **Every task's verification:** run from `web/` with `PATH=/root/.npm/_npx/bac97da9607b7ef2/node_modules/node/bin:$PATH`: `npm run lint`, `npm run typecheck`, `npm test -- --run`. UI tasks also run `npm run build:e2e && PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npx playwright test --trace off`.
- **Commits:** `<type>: <description> (#118)`, authored as the repository owner, with the session's trailers.

## Review Focus

1. **Leaving with unsaved changes** (a header link, browser Back, closing the tab) asks first, and confirming discards the draft. (Test: Task 5.)
2. **A settings refetch** (window refocus) while the draft is dirty keeps the draft on screen and in Save. (Test: Task 4.)
3. **Keyboard-only editing:** hiding a block keeps focus on its switch even though the block collapses; hiding a record keeps focus on its toggle; reordering announces moves. (Tests: Tasks 10 and 11.)
4. **A partly failed Save:** records saved but settings conflicted twice leaves only the settings in the draft, shows one error and Retry, and never re-sends the records. (Test: Task 15.)
5. **A session that expires or loses permission mid-draft:** Save fails with the permission notice, and the draft survives. (Test: Task 15.)

---

## PR 1: Design language

### Task 1: Neutral UI tokens, kept apart from the lanyard's

**Files:**
- Modify: `web/src/styles/tokens.css`, `web/src/styles/index.css`, `web/src/features/lanyard/components/LanyardPage/LanyardPage.{tsx,styles.ts}`
- Test: `web/src/design/uiTokens.test.ts`, `web/src/features/lanyard/components/LanyardPage/LanyardPage.test.tsx`

**Interfaces:**
- Produces CSS variables, light and dark:
  - `--ui-canvas`, `--ui-surface`, `--ui-surface-muted`, `--ui-border`, `--ui-border-strong`
  - `--ui-text`, `--ui-text-muted`
  - `--ui-primary`, `--ui-on-primary`, `--ui-primary-subtle`
  - `--ui-warning`
- Produces Tailwind colours: `ui-canvas`, `ui-surface`, `ui-surface-muted`, `ui-border`, `ui-border-strong`, `ui-text`, `ui-text-muted`, `ui-primary`, `ui-on-primary`, `ui-primary-subtle`, `ui-warning`.

- [ ] **Step 1: Write the failing contrast test** `uiTokens.test.ts`. It reads `tokens.css` with `readCssVars` (as `accents.test.ts` does), for light and dark, and asserts with `contrastRatio`:
  - `--ui-text`/`--ui-surface` ≥ 7;
  - `--ui-text-muted` against both `--ui-surface` and `--ui-canvas` ≥ 4.5;
  - `--ui-on-primary`/`--ui-primary` ≥ 4.5;
  - `--ui-primary`/`--ui-surface` ≥ 4.5 (primary used as link text);
  - `--ui-border-strong`/`--ui-surface` ≥ 3 (input and switch boundaries);
  - `--ui-warning`/`--ui-surface` ≥ 3.
- [ ] **Step 2: Run** `npm test -- --run src/design/uiTokens.test.ts`. Expected: FAIL (variables undefined).
- [ ] **Step 3: Implement the tokens.** Add the `--ui-*` variables to `tokens.css`: neutral zinc-like greys in OKLCH with chroma ≤ 0.01; light `--ui-canvas` about `oklch(0.967 0.003 265)`; `--ui-primary` = `var(--color-purple-vivid-500)` light and a lighter violet in dark that passes. Map them in `@theme inline`. Change `body` to `bg-ui-canvas text-ui-text`.
- [ ] **Step 4: Write the failing test** `LanyardPage.test.tsx`: "keeps the lanyard's own background on its public page". The public (non-preview) root has class `bg-background`; with `preview="owner"` it does not.
- [ ] **Step 5: Implement.** Add `styles.backdrop = 'flex w-full flex-1 justify-center bg-background text-foreground'` around the page when `!preview`.
- [ ] **Step 6: Run the task's tests and the full verification.** Expected: PASS. Open `/@handle` in the e2e build and confirm the lanyard still looks as before.
- [ ] **Step 7: Commit** `feat: neutral UI tokens for the app chrome (#118)`.

### Task 2: UI primitives

**Files:**
- Create, each with types, styles and a test:
  - `web/src/components/IconButton/`
  - `web/src/components/Switch/`
  - `web/src/components/ToggleGroup/`
  - `web/src/components/Accordion/`
  - `web/src/components/Sheet/`
  - `web/src/components/Tooltip/`
- Modify: `web/src/components/Button/*`, `web/src/components/{TextField,TextAreaField,SelectField}/*.styles.ts`

**Interfaces:**
- **Button:** `ButtonProps` gains `tone?: 'ui' | 'accent'` (default `'ui'`) and `size?: 'sm' | 'md' | 'lg'` (sm = `min-h-9` for dense toolbars; md stays `min-h-11`).
  - `ui` primary: `bg-ui-primary text-ui-on-primary`.
  - `accent` keeps today's lanyard-accent classes.
- **IconButton:** `IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; icon: ReactNode; variant?: 'ghost' | 'outline'; ref?: Ref<HTMLButtonElement> }`. It sets `aria-label={label}`, is 44 × 44, and shows a Tooltip with `label`.
- **Switch:** `SwitchProps = { checked: boolean; onCheckedChange(checked: boolean): void; label: string; disabled?: boolean; ref?: Ref<HTMLButtonElement> }`, Radix Switch with `aria-label={label}`.
- **ToggleGroup:** `ToggleGroupProps<T extends string> = { value: T; onValueChange(value: T): void; label: string; options: { value: T; label: string }[] }`, Radix ToggleGroup `type="single"`. It never allows deselecting to empty and renders `aria-label={label}`.
- **Accordion:** `AccordionProps = { items: { id: string; title: string; content: ReactNode }[]; defaultOpen?: string[]; headingLevel?: 2 | 3 }`, Radix Accordion `type="multiple"` with headings at `headingLevel` (default 3).
- **Sheet:** `SheetProps = { open: boolean; onOpenChange(open: boolean): void; title: string; children: ReactNode; trigger?: ReactNode }`, Radix Dialog shown as a bottom sheet with a visible title and a Close IconButton.
- **Tooltip:** `TooltipProps = { label: string; children: ReactElement }`, Radix Tooltip with a 300 ms delay that also opens on keyboard focus.

- [ ] **Step 1: Write the failing tests**, one file per primitive:
  - Switch: `role="switch"`, `aria-checked` follows `checked`, Space toggles and calls `onCheckedChange(true)`, name = `label`.
  - ToggleGroup: two radio-like buttons with `aria-pressed`, arrow keys move focus, pressing the pressed item keeps the value.
  - Accordion: each title is a heading containing a button with `aria-expanded`; Enter toggles; `defaultOpen` items start expanded; content is linked by `aria-controls`.
  - Sheet: `role="dialog"` named by `title`, focus moves inside on open, Escape closes and returns focus to the trigger.
  - IconButton: name = `label`, 44 px class, the tooltip shows `label` on focus.
  - Button: `tone="accent"` uses `bg-accent`, and the default uses `bg-ui-primary`.
  - Each test also runs `expectNoAxeViolations`.
- [ ] **Step 2: Run** `npm test -- --run src/components`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement** each primitive on `radix-ui` with `ui-*` tokens, using `cn()` for state classes. Restyle the fields: `border-ui-border-strong bg-ui-surface text-ui-text`, error ring in a red that passes 3:1.
- [ ] **Step 4: Run** the tests. Expected: PASS.
- [ ] **Step 5: Commit** `feat: accessible UI primitives on the new tokens (#118)`.

### Task 3: Restyle the chrome, and guard the separation

**Files:**
- Modify: `web/scripts/styleRules.test.ts`
- Modify styles in `web/src/components/{AppHeader,AppError,NotFound,OfflineBanner,Toaster,HandleCombobox,Logo}/`, `web/src/features/auth/components/{LandingPage,SignInForm,PermissionNotice,CallbackStatus}/`, `web/src/features/account/components/{AccountCard,SettingsPage}/`, `web/src/features/qr/components/QrSheet/`
- Modify: lanyard components that render `<Button>` (`FollowButton`, `BlockSection`, `LanyardProblem`, `LanyardPage`, `LanyardNotFound`, `VisitorActions`) to pass `tone="accent"`

**Interfaces:** none new.

- [ ] **Step 1: Write the failing guard tests** in `styleRules.test.ts`:
  - "chrome uses only UI tokens": class strings in files under `src/components/`, `src/features/auth/`, `src/features/account/`, `src/features/qr/` and `src/features/lanyard/customise/` contain none of `bg-background`, `text-foreground`, `bg-surface`, `border-border`, `text-muted-foreground`, `bg-accent`, `text-accent-text`, `bg-accent-subtle`, `text-on-accent`. Exempt `Button.styles.ts`'s `accent` tone and `QrCode`.
  - "the lanyard uses only lanyard tokens": files under `src/features/lanyard/components/` contain no `ui-` colour class.
- [ ] **Step 2: Run** `npm test -- --run scripts/styleRules.test.ts`. Expected: FAIL, listing the chrome files.
- [ ] **Step 3: Restyle** each listed chrome file to `ui-*` tokens, following mockup A:
  - header 56 px, `bg-ui-surface border-b border-ui-border`;
  - cards `rounded-xl border-ui-border bg-ui-surface`;
  - a 13/15/17/22 px type scale with matching leading.

  Pass `tone="accent"` in the lanyard components above.
- [ ] **Step 4: Run** the full verification and the e2e suite. Expected: PASS, including axe light and dark.
- [ ] **Step 5: Look at the result.** Screenshot (Playwright, dark and light) landing, sign-in, settings, not-found and the public lanyard. Compare with the mockup, and confirm the public lanyard is unchanged apart from its header.
- [ ] **Step 6: Commit** `feat: the new design language across the app chrome (#118)`, then open PR 1 (Closes nothing; Refs #118).

---

## PR 2: Customiser shell

### Task 4: Draft settings with Save and Reset

**Files:**
- Rename and modify: `web/src/features/lanyard/hooks/useLanyardConfig.ts` → `useLanyardDraft.ts` (test file too); update its importers.

**Interfaces:**
- Produces:

  ```ts
  export type UseLanyardDraft = {
    config: LanyardConfig;   // the draft
    saved: LanyardConfig;    // the last saved settings
    ready: boolean;
    invalid: boolean;
    dirty: boolean;
    /** Fields of LanyardConfig that differ from the last save. */
    changes: number;
    update(patch: (config: LanyardConfig) => LanyardConfig): void;
    save(): Promise<boolean>;   // true when saved
    discard(): void;             // back to the last save
    resetInvalid(): void;        // today's reset() for an unreadable record
    saving: boolean;
    error: boolean;
  };
  export function useLanyardDraft(): UseLanyardDraft;
  ```

- Removes: the 800 ms autosave and the pagehide/visibilitychange/unmount flushes (`SAVE_DELAY_MS`), and the "Lanyard updated" toast on every change. Save shows it once.

- [ ] **Step 1: Rewrite the tests.** Keep #114's swap, merge, refetch and invalid-record tests, now driven by `save()`. Add:
  - "shows a change at once but writes nothing until Save": `update`, advance 5 s, `putRecord` not called, `dirty` true, `changes` 1.
  - "Save writes the draft and clears dirty".
  - "discard returns to the last save": the config equals `saved`, dirty false, no write.
  - "keeps the draft when the settings are fetched again" (Review Focus 2).
  - "save resolves false and keeps the draft when the write fails".
- [ ] **Step 2: Run.** Expected: FAIL (module missing).
- [ ] **Step 3: Implement** by removing the timer, queue flush and lifecycle listeners from today's hook. `save()` runs the existing write path once; `discard()` is today's `restore()`. `changes` counts the differing fields among `accent`, `showJob`, `blocks` and `hidden` (JSON comparison).
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: lanyard settings are a draft until Save (#118)`.

### Task 5: Unsaved-changes guard

**Files:**
- Create: `web/src/hooks/useUnsavedChangesGuard.ts`
- Test: `web/src/hooks/useUnsavedChangesGuard.test.tsx`

**Interfaces:**
- Produces: `useUnsavedChangesGuard(dirty: boolean, message: string): void`.
  - Adds a `beforeunload` listener while `dirty`.
  - Uses TanStack Router `useBlocker({ shouldBlockFn: () => dirty && !window.confirm(message), enableBeforeUnload: false })`.

- [ ] **Step 1: Write the failing tests:**
  - "asks before leaving with unsaved changes": render in a test router, navigate with `dirty`, `window.confirm` mocked to false → the route stays; mocked to true → it navigates.
  - "doesn't ask when there's nothing to save".
  - "asks before the tab closes": a dispatched `beforeunload` has `defaultPrevented` true only while dirty.

  These cover Review Focus 1.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: ask before leaving unsaved changes (#118)`.

### Task 6: Header slots and the customiser's top-bar actions

**Files:**
- Modify: `web/src/components/AppHeader/*`, `web/src/routes/__root.tsx`, `web/src/routes/lanyard.tsx`
- Create: `web/src/features/lanyard/customise/CustomiserActions/` (4 files and a test)

**Interfaces:**
- `AppHeaderProps` gains `title?: string` and `actions?: ReactNode`.
- Routes may set `staticData: { ownHeader: true }`. `RootLayout` (via `useMatches`) then skips its own `AppHeader`, and the route renders one.
- Add the TanStack `StaticDataRouteOption` declaration: `ownHeader?: boolean`.
- `CustomiserActionsProps`:

  ```ts
  {
    viewAs: 'edit' | 'public';
    onViewAsChange(v: 'edit' | 'public'): void;
    dirty: boolean;
    changes: number;
    saving: boolean;
    onSave(): void;
    onReset(): void;
    onOpenStyle?(): void;
  }
  ```

  - The ToggleGroup is labelled "Preview mode", with options "Edit" and "View as public".
  - The status is a `role="status"` paragraph: "Unsaved changes" (with an amber dot) or "All changes saved".
  - Reset (secondary) and Save (primary, `loading={saving}`) are `aria-disabled` when not dirty.
  - A "Style" Button shows only below `md` (`md:hidden`) and calls `onOpenStyle`.
  - Reset asks `window.confirm("Discard your unsaved changes?")` when `changes > 1`.

- [ ] **Step 1: Write the failing tests:**
  - AppHeader: "renders a title and actions when given".
  - Root: "a route with ownHeader shows only its own header": one `banner` landmark on `/lanyard`.
  - CustomiserActions: toggle `aria-pressed`; the status text in both states; Save and Reset unavailable when clean; Save calls `onSave`; Reset with `changes` 2 and confirm false doesn't call `onReset`, while confirm true does; axe.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: the customiser's top bar, with Save, Reset and View as public (#118)`.

### Task 7: Style sidebar and phone sheet

**Files:**
- Create: `web/src/features/lanyard/customise/StylePanel/`, `web/src/features/lanyard/customise/StyleSidebar/`, `web/src/features/lanyard/customise/StyleSheet/` (4 files and a test each)
- Modify: `web/src/features/lanyard/customise/AccentPicker/*` (restyle as labelled radio cards in a 2-column grid, ui tokens; keep its API)

**Interfaces:**
- `StylePanelProps = { config: LanyardConfig; disabled: boolean; onChange(patch: (c: LanyardConfig) => LanyardConfig): void }`. It renders an `Accordion` with:
  - "Accent colour", open by default: AccentPicker;
  - "Badge": a checkbox "Show current job".

  It ends with the note "Blocks, links and items are edited on your lanyard."
- `StyleSidebar` wraps the panel in `<aside aria-label="Style">`, pinned, `hidden md:flex w-[300px] shrink-0`.
- `StyleSheet` wraps the same panel in `Sheet` titled "Style", with `open` and `onOpenChange` props.

- [ ] **Step 1: Write the failing tests:**
  - StylePanel: both disclosures exist; "Accent colour" starts expanded; choosing Teal calls `onChange` and the patch sets `accent: 'teal'`; toggling Badge → "Show current job" sets `showJob`; disabled disables the inputs; axe.
  - StyleSheet: opens as a dialog named "Style" containing the same controls.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: the style sidebar as an accordion, and a sheet on phones (#118)`.

### Task 8: The new customiser layout

**Files:**
- Modify: `web/src/features/lanyard/customise/CustomisePage/*`, `web/src/app/customise.test.tsx`, `web/e2e/customise.spec.ts`

**Interfaces:**
- Consumes: Tasks 4–7.
- Layout:
  - AppHeader (title "Your lanyard", actions = CustomiserActions);
  - below it, a row: StyleSidebar, then a canvas (`flex-1 bg-ui-canvas`) holding the lanyard in a framed page (`max-w-[640px] rounded-2xl bg-background`);
  - when `viewAs === 'public'`, the sidebar is hidden and the canvas shows `LanyardPage preview="visitor"` with the note "You're seeing your lanyard as the public sees it.";
  - `useUnsavedChangesGuard(draft.dirty, …)`.
- **Interim (until PRs 3 and 4):** the existing BlockEditor, HiddenItems, OrcidHelper and kept-record forms move into a "More settings" section under the lanyard frame, unchanged, and still write as they do today. Say so in PR 2's description.

- [ ] **Step 1: Update the route tests** in `customise.test.tsx`:
  - "a new accent shows at once and saves only on Save" (no putRecord before Save; one after);
  - "Reset puts back the last save";
  - "View as public hides the sidebar and edit controls";
  - "the page has one level-one heading" (kept).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the layout and wiring. Remove the old "Saving…/Saved" line.
- [ ] **Step 4: Update `e2e/customise.spec.ts`:**
  - saves happen on Save;
  - add "switches to View as public and back";
  - add "opens the style sheet on a phone (390 × 844)";
  - axe light and dark.

  Run the full verification and e2e. Expected: PASS.
- [ ] **Step 5: Look** at desktop, phone and View as public screenshots against the mockups.
- [ ] **Step 6: Commit** `feat: the customiser's new layout (#118)`, then open PR 2.

---

## PR 3: Blocks in place

### Task 9: Feed-only counts and an editor's view of the blocks

**Files:**
- Modify: `web/src/lib/person/config.ts`, `web/src/lib/person/blocks.ts`
- Test: `web/src/lib/person/blocks.test.ts`, `web/src/lib/person/config.test.ts`

**Interfaces:**
- `config.ts`: `export const FEED_BLOCKS: ReadonlySet<RenderableBlockType>` (`bskyPosts`, `blogPosts`, `code`, `collections`).
- `itemLimit(block)` returns `Infinity` for non-feed blocks.
- `blocks.ts`: `composeEditorBlocks(input: ComposeInput): EditorBlock[]`:

  ```ts
  export type EditorBlock = {
    type: RenderableBlockType;
    visible: boolean;
    /** For feed blocks only. */
    limit?: number;
    status: BlockStatus['status'];
    items: { item: BlockItem; hidden: boolean }[];
    failedSources: SourceName[];
  };
  ```

  - It covers every block in config order, hidden ones included, with every item (hidden ones flagged).
  - Feeds are cut to `limit` among non-hidden items, with hidden items kept in place.

- [ ] **Step 1: Write the failing tests:**
  - "shows every talk, whatever limit was stored": config Talks `limit: 1` with two talks → both composed (public `composeBlocks`).
  - "feeds still stop at their count": bskyPosts `limit: 2` with 3 posts → 2.
  - "composeEditorBlocks keeps hidden blocks and flags hidden items": a hidden Talks block → `visible: false`; a hidden link → `hidden: true`, in its original position.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: counts only for feeds, and an editor's view of the blocks (#118)`.

### Task 10: Show/hide on every record

**Files:**
- Modify: `web/src/features/lanyard/components/blocks/itemActions.ts`, `web/src/features/lanyard/components/blocks/ItemFrame/*`
- Create: `web/src/features/lanyard/customise/RecordToggle/` (4 files and a test)

**Interfaces:**
- `ItemActions` becomes `{ isHidden(itemKey: string): boolean; renderToggle(itemKey: string, title: string): ReactNode }` (replacing `renderMenu`).
- ItemFrame, when hidden, adds `styles.hidden = 'opacity-60 border border-dashed border-border rounded-md'` and a "Hidden" tag (lanyard tokens).
- `RecordToggleProps = { title: string; hidden: boolean; onToggle(): void; disabled?: boolean }`. It is an IconButton (eye or eye-off) named "Hide {title}" or "Show {title}", and keeps focus after toggling.

- [ ] **Step 1: Write the failing tests:**
  - ItemFrame: "marks a hidden item and keeps it in place".
  - RecordToggle: "names itself by what it will do"; "keeps focus after hiding" (Review Focus 3); axe.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: show and hide each record in place (#118)`.

### Task 11: Block bars on the lanyard

**Files:**
- Create: `web/src/features/lanyard/customise/LanyardEditor/`, `BlockBar/`, `EditableBlock/` (4 files and a test each)
- Move: the dnd-kit sensors, `Announcements` and move-focus logic from `BlockEditor`/`BlockEditorRow` into `LanyardEditor`/`BlockBar`

**Interfaces:**
- `BlockBarProps`:

  ```ts
  {
    type: RenderableBlockType;
    index: number;
    total: number;
    visible: boolean;
    limit?: number;
    disabled: boolean;
    onMove(to: number): void;
    onVisibleChange(v: boolean): void;
    onLimitChange?(n: number): void;
  }
  ```

  It holds a drag handle ("Reorder {name}"), "Move {name} up/down" (`aria-disabled` at the ends), `Switch` "Show {name}", and a "Show N" select for feeds (`LIMIT_OPTIONS`).
- `EditableBlockProps = { block: EditorBlock; profile: string; ... BlockBarProps handlers }`.
  - Visible: the bar above a `BlockSection` with the block's items.
  - Hidden: only the bar, with `opacity-60 border-dashed` and the label "Hidden from visitors".
- `LanyardEditorProps = { did: Did; config: LanyardConfig; onChange(patch): void; disabled: boolean }`. It renders BadgeHero (`headingLevel={2}`), then a `SortableContext` of EditableBlocks, inside an `ItemActionsContext` whose `isHidden` and `renderToggle` read and write `config.hidden`.

- [ ] **Step 1: Write the failing tests** (moving today's BlockEditor tests here):
  - "moves a block with Move down and announces it";
  - "keeps focus on Move down after moving";
  - "hiding a block collapses it in place and keeps focus on its switch" (Review Focus 3);
  - "a feed block offers Show N; Talks doesn't";
  - "hiding a record marks it Hidden in place";
  - axe.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: block bars on the lanyard (#118)`.

### Task 12: Wire it in, retire the list editors

**Files:**
- Modify: `CustomisePage` (render `LanyardEditor` in the frame when editing)
- Delete: `BlockEditor/`, `BlockEditorRow/`, `HiddenItems/`, `ItemMenu/` (and their tests)
- Modify: `web/src/app/customise.test.tsx`, `web/e2e/customise.spec.ts`

**Interfaces:**
- Consumes: Tasks 9–11. `hiddenItems()` in `blocks.ts` loses its last caller: delete it, its types and its tests.

- [ ] **Step 1: Update the e2e tests:**
  - "moves a block with Move down and saves the order on Save";
  - "reorders blocks with the keyboard alone" (announcements kept);
  - "hides a block in place and saves it";
  - "hides a record in place, then shows it again";
  - "changes a feed's count".
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement** the wiring and deletions; run `npm run i18n:extract`.
- [ ] **Step 4: Run** the full verification, e2e and `npm run size`. Expected: PASS, with the public routes ≤ 200 KB.
- [ ] **Step 5: Commit** `feat: edit blocks and records on the lanyard (#118)`, then open PR 3.

---

## PR 4: Records in place

### Task 13: Atomic batch writes

**Files:**
- Modify: `web/src/lib/atproto/writes.ts`
- Test: `web/src/lib/atproto/writes.test.ts`

**Interfaces:**
- Produces:

  ```ts
  export type WriteOp =
    | { type: 'create'; collection: WritableNsid; rkey?: string; fields: Record<string, unknown> }
    | { type: 'update'; collection: WritableNsid; rkey: string; fields: Record<string, unknown> }
    | { type: 'delete'; collection: WritableNsid; rkey: string };
  export async function applyWrites(session: WriteSession, ops: WriteOp[]): Promise<void>;
  ```

  - Every op passes `allow()` and `typed()` before anything is sent.
  - The ops go in one `com.atproto.repo.applyWrites` call, in chunks of at most 10, so each chunk is atomic.
  - It throws `WriteFailedError` on failure.

- [ ] **Step 1: Write the failing tests:**
  - "sends creates, updates and deletes in one batch" (body shape with `$type` `com.atproto.repo.applyWrites#create`, …);
  - "refuses the whole batch if one op lacks permission or breaks its lexicon, sending nothing";
  - "splits more than 10 ops into atomic chunks".
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: atomic batch writes (#118)`.

### Task 14: A draft of the kept records

**Files:**
- Create: `web/src/features/lanyard/hooks/useKeptRecordsDraft.ts` (and test)
- Modify: `web/src/lib/person/blocks.ts` (`mergeLinks`), `web/src/lib/person/personView.types.ts` (`LinkItem`)

**Interfaces:**
- `LinkItem` gains `ownKey?: string`: the AT-URI of the Lanyards web-link record a link comes from. Links from Sifa or Bluesky only have none.
- Produces:

  ```ts
  export type UseKeptRecordsDraft = {
    records: LanyardRecords;          // stored records with draft changes applied
    dirty: boolean;
    changes: number;
    addLink(fields: { url: string; title?: string }): void;
    updateLink(key: string, fields: { url: string; title?: string }): void;
    removeLink(key: string): void;
    addMedia(fields: MediaFields): void;
    updateMedia(key: string, fields: MediaFields): void;
    removeMedia(key: string): void;
    setHonorific(value: 'Dr' | 'Prof' | 'none'): void;
    /** Writes the changes in one batch; clears them on success. */
    save(): Promise<boolean>;
    discard(): void;
  };
  ```

  - New records use temporary keys `draft:<n>` until saved.
  - `save()` builds `WriteOp`s:
    - create: `createdAt` now;
    - update: keep the stored `createdAt`, read with `getRecord`;
    - delete;
    - honorific: an `update` with `rkey: 'self'`, or a create when none exists.

- [ ] **Step 1: Write the failing tests:**
  - "an added link shows at once with a draft key and isn't written until save";
  - "editing a stored link keeps its createdAt";
  - "a removed link disappears from the draft records";
  - "save sends one batch and clears the draft";
  - "a failed save keeps every change";
  - "mergeLinks marks Lanyards' own links with ownKey".
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: a draft of links, media and the honorific (#118)`.

### Task 15: One draft, one Save

**Files:**
- Create: `web/src/features/lanyard/hooks/useCustomiserDraft.ts` (and test)

**Interfaces:**
- Consumes: Tasks 4 and 14.
- Produces: `useCustomiserDraft(): { settings: UseLanyardDraft; records: UseKeptRecordsDraft; dirty: boolean; changes: number; saving: boolean; save(): Promise<void>; discard(): void }`.
  - `save()` runs `records.save()`, then `settings.save()`.
  - On full success it shows one "Lanyard updated" toast.
  - On failure it shows one error toast (id `lanyard-settings-save`) with Retry. The failed part stays dirty; the saved part is cleared and not re-sent.
  - On `MissingPermissionError` it shows the PermissionNotice instead.

- [ ] **Step 1: Write the failing tests:**
  - "saves records then settings, with one toast";
  - "when settings conflict twice, records stay saved and only settings remain in the draft; Retry doesn't re-send records" (Review Focus 4);
  - "a lost permission keeps the whole draft and shows the permission notice" (Review Focus 5).
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: one Save for settings and records (#118)`.

### Task 16: Edit links, media and the honorific in place

**Files:**
- Create: `web/src/features/lanyard/customise/LinkEditor/`, `MediaEditor/`, `HonorificControl/` (4 files and a test each)
- Modify:
  - `WebLinkForm` and `MediaForm`: replace their writer with `onSubmit(fields)` and an optional `initial`, keeping the validation and Form Standards;
  - `LanyardEditor`: links, media and badge slots; OrcidHelper inside Publications when editing;
  - `CustomisePage`: use `useCustomiserDraft`; remove the interim "More settings" section.
- Delete: `WebLinkList/`, `MediaList/`, `HonorificForm/` (and their tests)
- Modify: `web/e2e/customise.spec.ts`, `web/src/app/customise.test.tsx`

**Interfaces:**
- `LinkEditor`:
  - for each own link (`ownKey`): Edit, which opens WebLinkForm inline with `initial`, and "Delete {title}";
  - "+ Add link" opens WebLinkForm inline at the end;
  - Sifa and Bluesky links get only a RecordToggle.
- `MediaEditor`: the same, using MediaForm.
- `HonorificControl`: a labelled select "Title" (None, Dr, Prof) under the avatar, calling `records.setHonorific`.
- `CustomiserActions` takes `dirty` and `changes` from `useCustomiserDraft`.

- [ ] **Step 1: Write the failing tests:**
  - "adds a link in place; it's saved only on Save";
  - "edits an own link's title";
  - "deletes an own link and Reset brings it back";
  - "Sifa links can only be hidden";
  - "sets the honorific on the badge";
  - "the ORCID helper sits in Publications while editing";
  - e2e: the same flows end to end, plus axe light and dark.
- [ ] **Step 2: Run.** Expected: FAIL.
- [ ] **Step 3: Implement**, and run `npm run i18n:extract`.
- [ ] **Step 4: Run** the full verification, e2e and `npm run size`. Expected: PASS.
- [ ] **Step 5: Look** at desktop, phone and View as public screenshots against the mockups.
- [ ] **Step 6: Commit** `feat: edit links, media and the honorific on the lanyard (#118)`, then open PR 4 (Closes #118).
