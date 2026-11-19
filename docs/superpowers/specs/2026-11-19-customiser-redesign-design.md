# Customiser redesign: in-place editing, draft Save/Reset and a new design language

Issue: #118. Mockups (private to the owner):
https://claude.ai/artifact/73eRbEHcrhBjaS6ArYiVzA. Option **A** ("block bars")
is chosen; option B is kept on the canvas only for reference.

This changes the attendee UX spec (`2026-11-10-attendee-ux-design.md`) §7.4
(customisation): where they differ, this document wins. Slice 1c (#103) waits
until this lands.

## Intent

The owner isn't happy with the customiser or the product UI's visual quality.
The aim is to put editing controls first and let people change their lanyard
**directly**, where it is, instead of through a list of controls beside it.
The product UI gets a calmer, more neutral, modern and accessible design
language, with the brand colours as accents, clearly separate from the
lanyard itself (which keeps its own branded look).

## Goals

1. **Layout:** a style sidebar pinned to the left; the lanyard fills the rest,
   framed apart from the app's chrome.
2. **Sidebar:** visual settings only, as accessible disclosures stacked in an
   accordion: **Accent colour** and **Badge** (show current job).
3. **Direct editing on the lanyard:**
   - every block has a control bar while editing (option A);
   - every record has its own show/hide;
   - links, podcasts, videos and the honorific are added, edited and deleted
     in place.
4. **Hidden stays in place:** a hidden block collapses to its bar and a
   hidden record stays in its list, both faded, dashed and labelled
   "Hidden".
5. **Top bar:** an **Edit / View as public** toggle, **Save**, **Reset** (to
   the last save) and an unsaved-changes indicator.
6. **Draft model:** every change, settings and kept records alike, is a
   draft until Save. This replaces autosave.
7. **Phones:** the sidebar opens as a bottom sheet.
8. **Design language:** applied to all app chrome (top bar, sidebar,
   controls, landing, sign-in, settings, error and not-found screens).

## Non-goals

- Restyling the public lanyard itself. Only the chrome around it changes; the
  lanyard keeps its accent palettes, serif headings and layout.
- New lanyard features. The sidebar holds only what exists today (accent,
  show current job); no invented settings.
- Editing Sifa or Bluesky data inside Lanyards. Those records stay
  hide-only, with "Edit on Sifa" and "Edit in Bluesky" links.

## Anti-goals

- Anything a keyboard or screen-reader user can't do: every in-place control
  is a real button, switch or field with a name, and moves and saves are
  announced.
- A save that half-happens silently: whatever didn't save stays in the draft,
  with a clear error and Retry.
- Losing edits by navigating away: leaving with unsaved changes asks first.
- The design-language work bloating the public lanyard's initial JavaScript
  past its 200 KB budget.

## The design

### Layout and chrome

- **Top bar (56 px, full width):**
  - left: logo, then "Your lanyard";
  - right: the **Edit / View as public** toggle (a two-button group with
    `aria-pressed`), the save status ("Unsaved changes" with a dot, or "All
    changes saved", in a live region), **Reset** (secondary) and **Save**
    (primary, brand violet), both unavailable when nothing has changed, then
    the account menu.
- **Sidebar (about 300 px, pinned left, full height under the top bar):**
  - a "Style" heading and two accordion sections, each a heading with a
    disclosure button (`aria-expanded`, `aria-controls`);
  - Accent colour (open by default): the eight accents as labelled radio
    cards;
  - Badge: "Show current job" (checkbox);
  - a short note that blocks and items are edited on the lanyard.
- **Canvas:** a neutral grey workspace; the lanyard sits centred on it as its
  own page (max about 640 px), keeping its accent and serif.
- **View as public:** the sidebar and every edit control disappear, and
  hidden blocks and records aren't shown, so the canvas shows exactly what
  visitors see. A short note says so. Save and Reset stay in the top bar.
- **Phones (below about 768 px):**
  - the top bar keeps the toggle ("Edit" / "Public"), Reset and Save;
  - the lanyard fills the screen;
  - a "Style" button opens the same accordion in a bottom sheet (a modal
    dialog with a title, a close button, and focus moved in and back).

### Blocks (option A: block bars)

- **In edit mode, each block has a bar above its content:**
  - a drag handle ("Reorder Links");
  - move up and move down buttons;
  - a show/hide switch ("Show Links");
  - for feed blocks only (below), a "Show N" count.
- **Reordering:** pointer drag, keyboard drag (Space, arrows, Space), or
  move up/down. Every move is announced ("Links moved to position 2 of 12"),
  and focus stays on the control used.
- **Hidden block:** collapses to its bar, faded with a dashed border and a
  "Hidden from visitors" label. Turning its switch on expands it in place.
- **Empty or failed blocks** keep today's messages ("Nothing to show yet",
  "Couldn't load … · Retry"), with their "Edit on Sifa / in Bluesky" links,
  inside the block.

### Records: show/hide and the count

- **Every record has a show/hide control** (an eye button named "Hide
  Personal site" / "Show Old blog"). A hidden record stays in its list,
  faded, dashed and labelled "Hidden". This replaces the item menu and the
  separate "Hidden items" list, which are removed.
- **Sifa-backed blocks and Links have no count:** they show every record
  that isn't hidden (owner decision: the data is curated on Sifa, so
  visibility is per block and per record). Item limits stored on these
  blocks are ignored from now on.
- **Feed blocks keep a count:** Posts on Bluesky, Blog posts, Code and
  Collections can run long and don't come from Sifa, so each keeps a "Show N"
  control in its bar (owner decision). Records in feeds can still be hidden
  one by one.

### Editing kept records in place

- **Links block:**
  - Lanyards' own web links can be edited (address, title) and deleted in
    place;
  - "+ Add link" opens an inline form at the end of the list;
  - links that come from Sifa or Bluesky are hide-only, with the block's
    "Edit on Sifa / in Bluesky" links.
- **Podcasts and videos (Media block):** the same; add, edit and delete in
  place, with the media form's fields (kind, address, platform, title,
  description, content type).
- **Honorific:** a "Title" control (None, Dr, Prof) on the badge, next to the
  name.
- **ORCID helper:** shown inside the Publications block for the owner (edit
  mode only), not in the sidebar.
- **Forms** keep CLAUDE.md's Form Standards: inline errors, focus to the
  first problem, labels, 44 px targets.

### The draft, Save and Reset

- **The draft holds every unsaved change:** lanyard settings (accent, show
  current job, block order and visibility, feed counts, hidden records) and
  kept-record changes (added, edited or deleted links and media, the
  honorific). The preview always shows the draft.
- **Save** writes the draft:
  - kept-record changes in one atomic batch (`applyWrites`);
  - then the settings record with the conflict-safe `putRecord`
    (`swapRecord` and the three-way merge, from #114).
- **On failure**, whatever didn't save stays in the draft, the error says
  what failed, and Retry tries again. One toast is shown at a time, replaced
  rather than stacked.
- **Reset** discards the draft and returns to the last saved state, after a
  confirmation when the draft is large (more than one change).
- **Leaving** (navigation, closing the tab) with unsaved changes asks first.
  The draft isn't kept across reloads.
- **Undo after delete is replaced by Reset:** a delete is only a draft change
  until Save.

### Design language (all app chrome)

- **Colour:**
  - neutral greys for chrome surfaces, borders and text, in light and dark
    themes, with 4.5:1 text contrast;
  - brand violet (`#4020DF`) for primary actions, focus and selection;
  - a warm amber dot for "unsaved".
- **Type:** DM Sans for the product UI on a clear scale (12, 13, 14, 15, 17,
  22 px with matching line heights). The lanyard keeps its serif headings.
- **Shape and spacing:** 8–14 px radii, 4 px spacing steps, light borders
  rather than heavy outlines, minimal shadow (floating layers only).
- **Primitives** (own components on Radix, following the project's
  four-file structure):
  - Button (primary, secondary, ghost, icon) and IconButton;
  - Switch;
  - ToggleGroup (the Edit / View as public control);
  - Accordion;
  - Sheet (bottom sheet);
  - Select, TextField, TextAreaField and Checkbox, restyled;
  - Tooltip, for icon-only buttons.
- **Applied to:** the top bar and account menu, the customiser, landing,
  sign-in, settings, callback, the permission notice, the offline banner,
  error and not-found screens, and toasts.
- **Focus:** a visible 2 px brand ring on every control, never removed.

## Release order (owner's choice: own primitives, four PRs)

| PR | Contents |
|---|---|
| **1. Design language** | Tokens, primitives, and the restyle of all chrome screens (no behaviour change) |
| **2. Customiser shell** | Pinned sidebar with accordion; canvas; top bar toggle; draft model with Save/Reset/leave-guard for **settings**; View as public; phone bottom sheet |
| **3. Blocks in place** | Block bars; hidden blocks collapsed in place; per-record show/hide; feed counts; ignoring stored limits on other blocks; removing the old block editor, item menu and hidden-items list |
| **4. Records in place** | Links, media and honorific edited in place as draft changes; ORCID helper in Publications; removing the old forms beside the preview |

Each PR is complete and releasable to `next.lanyards.app` on its own.

## Approaches considered

| Approach | Trade-off | Decision |
|---|---|---|
| **Own primitives on Radix, four PRs** | Fits the stack and the four-file rule; more design work up front | **Chosen** by the owner |
| Adopt shadcn/ui components directly | Quickest polish; breaks the four-file rule unless reworked | Rejected |
| Build a v2 customiser alongside, then swap | Never half-redesigned in production; duplicated code for weeks | Rejected |

Block controls: option **A** (a bar on every block) was chosen over B (a
floating toolbar on the focused block) for discoverability and touch.

## Decided by the owner

- Pinned left sidebar, visual settings only, as an accordion.
- Block and record controls in place on the lanyard; option A's block bars.
- Hidden blocks and records stay in place, faded and collapsed.
- An Edit / View as public toggle and Save/Reset in the top bar.
- A draft until Save, for settings and kept records alike.
- A bottom sheet on phones.
- The new design language for all app chrome; the lanyard keeps its look.
- No count on Sifa blocks; a count only on feed blocks.
- The look in the mockups is the right direction.

## My calls (correctable)

- The sidebar's two sections (Accent colour, Badge); nothing new invented.
- An eye button per record, rather than a switch, to keep rows compact.
- The ORCID helper inside the Publications block in edit mode.
- Save order: kept records (atomic) then settings (conflict-safe).
- Reset asks for confirmation when there's more than one change.
- The draft isn't kept across reloads; leaving asks first.
- The phone breakpoint at about 768 px.
- The type scale and radii above.

## Left to the builder

- The draft's internal shape and how it sits beside TanStack Query.
- Exact token values within the rules above, checked by the contrast tests.
- How the leave-guard hooks into TanStack Router.
- Animation details (respecting reduced motion).
