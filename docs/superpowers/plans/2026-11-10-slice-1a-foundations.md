# Slice 1a: Foundations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the new Lanyards app shell at `next.lanyards.app`, built in `web/` alongside the untouched legacy app. It provides:
- a branded, accessible, installable PWA
- AT Protocol OAuth sign-in, sign-up and sign-out
- an Account screen
- CI and a production deploy

**Architecture:**
- **Isolation:** a Vite + React SPA in `web/` with its own `package.json`, deployed by a second Vercel project (Root Directory `web`). The legacy Next.js app at the repo root keeps serving `lanyards.app` until Slice 1c.
- **Separation of concerns:**
  - pure configuration (OAuth env, palettes, sanitising) sits in plain modules with unit tests
  - React features consume them through providers and hooks
  - every component follows the 4-file structure

**Tech Stack:**
- **App:** Vite 8, React 19, TypeScript `~6.0.3`, TanStack Router (file-based) and TanStack Query.
- **Styling and UI:** Tailwind CSS v4 (`@tailwindcss/vite`) and Radix (`radix-ui`), plus downshift, sonner and culori.
- **ATProto:** `@atcute/oauth-browser-client` 5, `@atcute/client` 5, `@atcute/identity-resolver` 2, `@atcute/lexicons` 2, `@atcute/bluesky` 4.
- **Platform:** Lingui 6, `vite-plugin-pwa` 2 with `@vite-pwa/assets-generator`, `posthog-js`.
- **Testing:** Vitest 5 with Testing Library, MSW 3 and axe-core; Playwright 1.65.

**Spec:** `docs/superpowers/specs/2026-11-10-attendee-ux-design.md` (§3, §6.1, §6.2, §12, §13, §14, §15, §16, §17 Slice 1). Issue: #101 (parent #95, epic #94).

## Global Constraints

- **Location:**
  - all new code lives under `web/`
  - outside `web/`, this plan only edits root `tsconfig.json`, root `eslint.config.js`, `.gitignore`, `CLAUDE.md` and `.github/workflows/`
  - the legacy app must keep building
- **Toolchain:** npm, Node 22 in CI, and TypeScript pinned to `~6.0.3`, because `typescript-eslint` 8.72 requires `typescript <6.1.0`.
- **Dependencies:** pin with caret ranges at the versions verified on 2026-11-10:
  - `@atcute/client@^5.1.2`, `@atcute/oauth-browser-client@^5.1.0`, `@atcute/identity-resolver@^2.0.3`, `@atcute/lexicons@^2.1.1`, `@atcute/bluesky@^4.0.26`
  - `vite@^8.3.7`, `@vitejs/plugin-react@^6.3.0`
  - `@tanstack/react-router@^1.170.46`, `@tanstack/router-plugin@^1.169.0`, `@tanstack/router-cli@^1.168.0`, `@tanstack/react-query@^5.107.1`
  - `tailwindcss@^4.3.5`, `@tailwindcss/vite@^4.3.5`
  - `@lingui/core@^6.12.0`, `@lingui/react@^6.12.0`, `@lingui/cli@^6.12.0`, `@lingui/vite-plugin@^6.12.0`, `@lingui/babel-plugin-lingui-macro@^6.12.0`, `@rolldown/plugin-babel@^0.3.1`
  - `vite-plugin-pwa@^2.0.0`, `@vite-pwa/assets-generator@^2.0.0`
  - `posthog-js@^1.447.7`, `downshift@^9.5.0`, `sonner@^2.0.8`, `culori@^4.0.2` (+ `@types/culori@^4.0.1`), `clsx@^2.1.1`, `tailwind-merge@^3.7.0`, `tsx` (latest 4.x, dev only)
  - `radix-ui` is deferred to Slice 1b, where the first dialog and sheet appear
  - `@fontsource-variable/dm-sans@^5.3.0`, `@fontsource/dm-serif-text@^5.3.0`, `@fontsource/dm-mono@^5.3.0`
  - `vitest@^5.1.0`, `jsdom@^31.0.0`, `@testing-library/react@^16.3.3`, `@testing-library/user-event@^14.6.9`, `@testing-library/jest-dom@^7.0.1`, `msw@^3.0.4`, `axe-core` (latest 4.x), `@playwright/test@^1.65.0`, `@axe-core/playwright@^4.14.0`
  - `eslint@^10.14.0`, `@eslint/js@^10.0.1`, `typescript-eslint@^8.72.2`, `eslint-plugin-react-hooks@^7.1.1`, `eslint-plugin-jsx-a11y@^6.10.2`, `globals@^17.14.0`, `prettier@^3.9.10`
- **Local servers:**
  - dev on `http://127.0.0.1:5173` and preview on `http://127.0.0.1:4173`, both `strictPort: true`
  - OAuth redirect URIs always use `127.0.0.1`, never `localhost`
  - the loopback `client_id` *host* is literally `http://localhost?…` (RFC 8252 format) and is the only place `localhost` appears
- **OAuth scope** for this slice: `atproto` (identity only). Slice 1b widens it.
- **Copy:**
  - all user-facing copy is British English and goes through Lingui (`<Trans>`, `t`, `msg`); there are no hard-coded strings in components
  - copy in this plan is exact where quoted
- **Components and styling:**
  - 4-file structure: `X.tsx`, `X.types.ts`, `X.styles.ts`, `X.constants.ts` (optional); forms add `X.validation.ts`
  - Tailwind only, with no inline `style` attributes and no margin utilities (use `gap` and padding)
  - every text element sets `leading-*`, and conditional classes use `cn()`
- **Accessibility (WCAG 2.2 AA, plus AAA where feasible):**
  - body text and essential UI meet **7:1**; other text meets 4.5:1; non-text UI meets 3:1
  - touch targets are at least 44×44 px
  - focus is always visible, inputs have visible labels, and status changes are announced through live regions
  - `prefers-reduced-motion` is respected (use `motion-safe:` for any transition)
  - layouts hold at 320 px width and 200% zoom with no horizontal scrolling
- **Analytics** properties and error reports contain **no DIDs, handles, names or URLs**. The PostHog project key is public configuration from `VITE_POSTHOG_KEY`, never a secret.
- **Budget:** initial JS ≤ **200 KB gzipped** (`204800` bytes).
- **Code style:** single quotes, semicolons, ES5 trailing commas, 80 columns; prefix unused variables with `_`.
- **Commits and tests:**
  - commits use `<type>: <description> (#101)`, authored as the repository owner (see CLAUDE.md), with Claude's `Co-Authored-By`
  - Playwright always runs with `--trace off`; in this environment set `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`

## Review Focus

These behaviours are implied by the spec but easy to miss; each is pinned by a test in the task named.

1. **Handle input variants.** Leading `@`, uppercase letters and surrounding spaces are normalised. A DID is accepted. An email gets the specific message "Enter your handle, not your email — for example alice.bsky.social". *(Task 8)*
2. **OAuth callback edge cases.** A denied consent (`#error=access_denied`), a callback with no parameters (back button or replayed URL), or a failed finalise each show a friendly message and a "Try again" link. The parameters are scrubbed from the URL, and nothing crashes. *(Task 9)*
3. **Revoked or expired stored session.** On start-up the stored session is cleared, the user is treated as signed out, and the toast "You've been signed out. Please sign in again." is shown. *(Task 6)*
4. **Offline.** The app shell loads offline. The sign-in button is disabled with "You're offline. Connect to sign in." *(Tasks 8 and 12)*
5. **Typeahead races and failures.** Out-of-order responses never replace newer results. A failed lookup shows no error and never blocks typing a handle manually. *(Task 5)*

---

### Task 1: Isolated `web/` workspace and project instructions

**Files:**
- Create:
  - `web/package.json`, `web/tsconfig.json`, `web/vite.config.ts`, `web/eslint.config.js`, `web/index.html`, `web/.env.example`
  - `web/src/main.tsx`, `web/src/lib/utils.ts`, `web/src/test/setup.ts`
  - `web/README.md`
- Modify: root `tsconfig.json` (`exclude` adds `"web"`), root `eslint.config.js` (`ignores` adds `'web/**'`), `.gitignore`, `CLAUDE.md`
- Test: `web/src/lib/utils.test.ts`

**Interfaces:**
- Produces:
  - `cn(...inputs: ClassValue[]): string` from `web/src/lib/utils.ts` (clsx + tailwind-merge)
  - the `web/` npm scripts that every later task runs:
    - `dev`: `vite`
    - `build`: `tsr generate && vite build`
    - `build:e2e`: build with `PUBLIC_BASE_URL=http://127.0.0.1:4173`
    - `preview`: `vite preview`
    - `typecheck`: `tsr generate && tsc --noEmit`
    - `lint`: `eslint .`
    - `test`: `vitest`
    - `e2e`: `playwright test --trace off`
    - `format`: `prettier --write .`
    - `i18n:extract` and `i18n:check` (Task 3), `size` (Task 12)
  - `@/` path alias mapped to `web/src/`

- [ ] **Step 1: Record the legacy baseline.** At the repo root, run `npx tsc --noEmit -p . 2>&1 | tail -1` and `npm run lint 2>&1 | tail -3`, and note the exit codes. The legacy state may already have errors; the requirement is that this task doesn't add new ones.
- [ ] **Step 2: Write the failing test** in `web/src/lib/utils.test.ts`:

```ts
import { cn } from './utils';
it('merges conflicting Tailwind classes, last wins', () => {
  expect(cn('px-2 leading-6', false && 'hidden', 'px-4')).toBe('leading-6 px-4');
});
```

- [ ] **Step 3: Scaffold.**
  - Create the `web/` files with the scripts above. `vite.config.ts` sets `server: { host: '127.0.0.1', port: 5173, strictPort: true }` and `preview: { host: '127.0.0.1', port: 4173, strictPort: true }`, plus `@vitejs/plugin-react`, the TanStack Router plugin (`autoCodeSplitting: true`) and the `@/` alias.
  - The Vitest block uses `environment: 'jsdom'` and `setupFiles: ['src/test/setup.ts']`, which imports `@testing-library/jest-dom/vitest`.
  - `eslint.config.js` uses `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks` and `jsx-a11y` recommended, the root's `no-unused-vars` `_` pattern, and ignores `dist/**` and `src/routeTree.gen.ts`.
  - Prettier inherits the root `.prettierrc.json`.
  - `.gitignore` adds `web/dist`, `web/src/routeTree.gen.ts`, `web/playwright-report`, `web/test-results` and `web/dev-dist`.
- [ ] **Step 4: Isolate the legacy tooling.** Add `"web"` to the root `tsconfig.json` `exclude` and `'web/**'` to the root ESLint `ignores`.
- [ ] **Step 5: Update `CLAUDE.md`.**
  - In **Tech Stack** and **Project Structure**, describe `web/` (the new app: Vite + React + TanStack + Tailwind v4 + atcute) and the root (the legacy Next.js app, frozen until Slice 1c; no new work).
  - Replace the Next-specific OAuth bullets with the `web/` rules: dev on `http://127.0.0.1:5173`, the loopback client built by `web/plugins/oauthMetadata.ts`, and production metadata generated at build time from `PUBLIC_BASE_URL`.
  - Add `cd web && npm run dev | test | e2e | lint | typecheck` to the verify steps.
- [ ] **Step 6: Install and run.** In `web/`, run `npm install`, then `npm test -- --run src/lib/utils.test.ts`. Expected: PASS. Then `npm run lint && npm run typecheck`. Expected: exit 0.
- [ ] **Step 7: Re-run the legacy baseline from Step 1.** Expected: the same exit codes and no new errors mentioning `web/`.
- [ ] **Step 8: Commit.** `chore: scaffold isolated web/ app workspace (#101)`.

---

### Task 2: Brand tokens, fonts and accent palettes

**Files:**
- Create:
  - `web/src/styles/index.css` (Tailwind import, `@custom-variant dark (@media (prefers-color-scheme: dark))`, `@theme` mapping)
  - `web/src/styles/tokens.css`, `web/src/styles/accents.css`
  - `web/src/design/accents.ts`, `web/src/design/accentCss.ts`, `web/src/design/contrast.ts`
- Test: `web/src/design/accents.test.ts`

**Interfaces:**
- Produces:
  - `ACCENTS = ['violet', 'indigo', 'plum', 'rose', 'ember', 'moss', 'teal', 'ocean'] as const`, `type Accent`, `DEFAULT_ACCENT: Accent = 'violet'`
  - `applyAccent(accent: Accent): void`, which sets `document.documentElement.dataset.accent`
  - `readCssVars(css: string, selector: string): Record<string, string>`
  - `contrastRatio(fg: string, bg: string): number` (WCAG 2.x, via culori `wcagContrast`; accepts any CSS colour culori parses, including `oklch()`)
  - CSS variables: base `--background`, `--foreground`, `--muted-foreground`, `--surface`, `--border`, `--focus-ring`; per accent `--accent`, `--on-accent`, `--accent-text`, `--accent-subtle`
  - Tailwind colour utilities generated from them: `bg-background`, `text-foreground`, `bg-accent`, `text-on-accent`, `text-accent-text`, and so on
- **Single source of truth:** the colour values live **only** in the CSS files. Tests parse the CSS.

- [ ] **Step 1: Write the failing tests** in `accents.test.ts`. Read `tokens.css` and `accents.css` with `fs`, then assert:

```ts
it.each(MODES)('foreground on background is ≥ 7:1 (%s)', (mode) => {
  expect(contrastRatio(base[mode]['--foreground'], base[mode]['--background'])).toBeGreaterThanOrEqual(7);
});
it.each(cases)('%s/%s: on-accent text on accent ≥ 7:1', (accent, mode) => {
  const p = palette(accent, mode);
  expect(contrastRatio(p['--on-accent'], p['--accent'])).toBeGreaterThanOrEqual(7);
});
it.each(cases)('%s/%s: accent text on background ≥ 7:1', ...);   // --accent-text vs --background
it.each(cases)('%s/%s: accent vs background ≥ 3:1 (non-text)', ...); // --accent vs --background
it('defines every accent in light and dark', () => { /* all 8 × 2 present, 4 vars each */ });
```

  Here `MODES = ['light', 'dark']` and `cases` is every accent × mode pair.
  - Light values come from the `:root` selector (base) and `:root[data-accent='x']` (accent).
  - Dark values come from the same selectors inside `@media (prefers-color-scheme: dark)`. `readCssVars` takes an optional media-query argument for this.

- [ ] **Step 2: Run the tests to verify they fail.** Run `npm test -- --run src/design`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement.**
  - Port the brand scales from the root `src/app/globals.css` (purple-muted/vivid oklch scales) into `tokens.css`. Light background is `purple-muted-50`, foreground `purple-muted-950`; dark mirrors the legacy dark block.
  - Choose oklch values for the 8 accents in both modes so that every assertion passes. `violet` is built on the brand `#4020DF` / `purple-vivid` scale.
  - `index.css` imports the fonts (`@fontsource-variable/dm-sans`, `@fontsource/dm-serif-text`, `@fontsource/dm-mono`) and sets `--font-sans`, `--font-serif` and `--font-mono` to match the legacy tokens.
  - The focus ring is purple-vivid-500 in light mode and yellow-vivid-500 (`hsl(65 100% 50%)`) in dark mode, as in the legacy app.
- [ ] **Step 4: Run the tests to verify they pass.** Run `npm test -- --run src/design`. Expected: PASS for all 8 × 2 × 3 contrast cases, the base cases and the completeness check.
- [ ] **Step 5: Commit.** `feat: brand tokens, self-hosted fonts and 8 contrast-checked accents (#101)`.

---

### Task 3: British English i18n with Lingui

**Files:**
- Create: `web/lingui.config.ts`, `web/src/i18n/i18n.ts`, `web/src/i18n/locales/en-GB/messages.po`
- Modify: `web/vite.config.ts` (add `@lingui/vite-plugin`, and pass the `@lingui/babel-plugin-lingui-macro` babel plugin through `@rolldown/plugin-babel`), `web/package.json` scripts
- Test: `web/src/i18n/i18n.test.tsx`

**Interfaces:**
- Produces:
  - `i18n` (an `@lingui/core` instance, activated to `'en-GB'`)
  - `LOCALE = 'en-GB'`
  - `<AppI18nProvider>{children}</AppI18nProvider>`
  - scripts `i18n:extract` (`lingui extract --clean`) and `i18n:check` (`lingui extract --clean && git diff --exit-code src/i18n/locales`)
- `lingui.config.ts`: `locales: ['en-GB']`, `sourceLocale: 'en-GB'`, catalogue path `src/i18n/locales/{locale}/messages` in `po` format. The `.po` file is imported directly; the Vite plugin compiles it.

- [ ] **Step 1: Write the failing test.** Render `<AppI18nProvider><Trans>Sign in</Trans></AppI18nProvider>` and expect the text "Sign in". Also expect `i18n.locale` to be `'en-GB'`.
- [ ] **Step 2: Run the test to verify it fails.** Run `npm test -- --run src/i18n`. Expected: FAIL.
- [ ] **Step 3: Implement** the config, provider and plugin wiring.
- [ ] **Step 4: Verify.** `npm test -- --run src/i18n` should PASS. Then run `npm run i18n:extract`; `messages.po` should contain `msgid "Sign in"`. Then run `npm run i18n:check`; expected exit 0.
- [ ] **Step 5: Commit.** `feat: en-GB message catalogue with Lingui (#101)`.

---

### Task 4: UI primitives: Button, TextField, Toaster, Logo

**Files:**
- Create: each as a 4-file component under `web/src/components/`
  - `Button/`, `TextField/`, `Toaster/` (wrapping sonner)
  - `Logo/` (a `<picture>` with `<source srcset="/logo-dark.svg" media="(prefers-color-scheme: dark)">` and `<img src="/logo-light.svg" alt="Lanyards">`)
- Copy: root `public/logo-light.svg` and `public/logo-dark.svg` → `web/public/`
- Create: `web/src/test/axe.ts`
- Test: `web/src/components/*/X.test.tsx`

**Interfaces:**
- Produces:
  - `Button(props: ButtonProps)` with `ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'md' | 'lg'; loading?: boolean }`. Sizes are `md` = `min-h-11` (44 px) and `lg` = `min-h-14` (56 px). `loading` sets `aria-busy="true"` and `disabled`.
  - `TextField(props: TextFieldProps)` with `TextFieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; hint?: string; error?: string }`. It renders a visible `<label>`. The `<input>` gets `aria-invalid` when there's an error, `aria-required` when required, and `aria-describedby` listing the hint id and error id. The error goes in `<p role="alert">`. It accepts `ref` (React 19).
  - `Toaster()` and `notify: { success(message: string): void; error(message: string, opts?: { action?: { label: string; onClick(): void } }): void; info(message: string, opts?: { action?: … }): void }`
  - `Logo(props: { className?: string })`, with accessible name "Lanyards"
  - `expectNoAxeViolations(container: Element): Promise<void>` (runs axe-core and fails listing each violation)

- [ ] **Step 1: Write the failing tests.**
  - Button with `loading` → `toBeDisabled()`, `aria-busy="true"`, and the class contains `min-h-11`.
  - TextField with `error="Enter your handle"` → `getByLabelText(label)` has `aria-invalid="true"`, and its `aria-describedby` includes the id of the element whose text is "Enter your handle".
  - `notify.success('Signed out')` → the text appears inside a `role="status"` or `aria-live` region.
  - Each component passes `expectNoAxeViolations`.
- [ ] **Step 2: Run the tests to verify they fail.** Run `npm test -- --run src/components`. Expected: FAIL.
- [ ] **Step 3: Implement** the components with styles in `X.styles.ts`, using the token utilities from Task 2.
- [ ] **Step 4: Run the tests to verify they pass.** Run `npm test -- --run src/components`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: accessible Button, TextField, Toaster and Logo primitives (#101)`.

---

### Task 5: Identity resolution and handle typeahead

**Files:**
- Create: `web/src/lib/atproto/identity.ts`, `web/src/lib/atproto/typeahead.ts`, `web/src/components/HandleCombobox/` (4 files)
- Create: `web/src/test/msw.ts` (an MSW `setupServer` with `onUnhandledRequest: 'error'`, registered in `src/test/setup.ts`)
- Test: `web/src/lib/atproto/typeahead.test.ts`, `web/src/components/HandleCombobox/HandleCombobox.test.tsx`

**Interfaces:**
- Produces:
  - `PUBLIC_APPVIEW = 'https://public.api.bsky.app'`
  - `identityResolver`: a `LocalActorResolver` using `XrpcHandleResolver({ serviceUrl: PUBLIC_APPVIEW })` and a `CompositeDidDocumentResolver` over plc and web
  - `publicAppView`: `new Client({ handler: simpleFetchHandler({ service: PUBLIC_APPVIEW }) })`
  - `type HandleSuggestion = { did: Did; handle: Handle; displayName?: string; avatar?: string }`
  - `searchHandles(query: string, signal?: AbortSignal): Promise<HandleSuggestion[]>`:
    - calls `app.bsky.actor.searchActorsTypeahead` with `{ q, limit: 8 }`
    - returns `[]` without any request when the trimmed query, minus a leading `@`, is shorter than 2 characters
    - rejects on network or abort errors
  - `HandleCombobox(props: HandleComboboxProps)` with `HandleComboboxProps = { id: string; label: string; value: string; onChange(value: string): void; onBlur?(): void; hint?: string; error?: string; required?: boolean; disabled?: boolean; inputRef?: Ref<HTMLInputElement> }`, built on downshift `useCombobox`. It has the same `aria-invalid`, `aria-required` and `aria-describedby` behaviour as `TextField`, and:
    - debounce `TYPEAHEAD_DEBOUNCE_MS = 200`
    - aborts the previous request on each new query
    - selecting an option calls `onChange(suggestion.handle)`

- [ ] **Step 1: Write the failing tests.**
  - With MSW returning two actors for `q=ali`, `searchHandles('ali')` resolves to two suggestions with `handle`, `did`, `displayName` and `avatar` mapped.
  - `searchHandles('@a')` makes no request (MSW would error) and resolves to `[]`.
  - Aborting the signal rejects with `name === 'AbortError'`.
  - **Combobox race (Review Focus 5):** the response for "al" is delayed 300 ms and the one for "ali" returns at once. After both settle, only the "ali" results are listed.
  - **Combobox failure:** MSW returns a 500. After typing, the listbox has no options, no alert is shown, and `onChange` received the typed text.
  - Selecting "alice.bsky.social" calls `onChange('alice.bsky.social')`.
  - axe passes with the listbox open.
- [ ] **Step 2: Run the tests to verify they fail.** Run `npm test -- --run src/lib/atproto/typeahead.test.ts src/components/HandleCombobox`. Expected: FAIL.
- [ ] **Step 3: Implement** to the interfaces above. Options show the avatar (decorative, `alt=""`), display name and `@handle`, each at least 44 px tall.
- [ ] **Step 4: Run the tests to verify they pass.** Same command. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: handle typeahead with race-safe accessible combobox (#101)`.

---

### Task 6: OAuth configuration, session runtime and SessionProvider

**Files:**
- Create:
  - `web/src/lib/atproto/oauthConfig.ts` (pure), `web/plugins/oauthMetadata.ts` (Vite plugin)
  - `web/src/lib/atproto/session.ts`, `web/src/lib/atproto/useProfile.ts`
  - `web/src/features/auth/session/SessionProvider.tsx`, `SessionProvider.types.ts`, `useSession.ts`
- Modify: `web/vite.config.ts` (register the plugin), `web/src/vite-env.d.ts` (typed `VITE_OAUTH_CLIENT_ID`, `VITE_OAUTH_REDIRECT_URI`, `VITE_OAUTH_SCOPE`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST`)
- Test: `web/src/lib/atproto/oauthConfig.test.ts`, `web/src/lib/atproto/session.test.ts`, `web/src/features/auth/session/SessionProvider.test.tsx`

**Interfaces:**
- **Consumes:** `identityResolver`, `publicAppView` (Task 5); `notify` (Task 4); `i18n` (Task 3).
- **Produces (pure, `oauthConfig.ts`):**
  - `OAUTH_SCOPE = 'atproto'`, `SIGN_UP_PDS = 'https://bsky.social'`, `REDIRECT_PATH = '/oauth/callback'`, `DID_STORAGE_KEY = 'lanyards:did'`
  - `resolveBaseUrl(input: { command: 'serve' | 'build'; env: Record<string, string | undefined> }): string`:
    - `serve` → `'http://127.0.0.1:5173'`
    - `build` → `env.PUBLIC_BASE_URL` without a trailing slash
    - otherwise, if `env.VERCEL_ENV === 'preview'` and `env.VERCEL_BRANCH_URL` is set → `https://${env.VERCEL_BRANCH_URL}`
    - otherwise throws `Error('PUBLIC_BASE_URL must be set for production builds')`
  - `buildOAuthEnv(baseUrl: string, scope: string): { clientId: string; redirectUri: string; metadata: ClientMetadata | null }`:
    - for `http://127.0.0.1:<port>`, a loopback `clientId` and `metadata: null`
    - for `https://…`, a hosted `clientId` and metadata
    - any other `http:` URL throws
  - `safeReturnTo(value: unknown): string`: returns the value only if it's a string starting with `/`, not starting with `//`, containing no `\`, and at most 512 characters long; otherwise `'/'`
- **Produces (plugin):** `oauthMetadataPlugin(): Plugin`
  - Its `config` hook defines `import.meta.env.VITE_OAUTH_CLIENT_ID`, `VITE_OAUTH_REDIRECT_URI` and `VITE_OAUTH_SCOPE`.
  - Its `generateBundle` hook emits `oauth-client-metadata.json` (pretty JSON) when the metadata is non-null.
- **Produces (runtime, `session.ts`):**
  - `configureAuth(): void`
  - `startSignIn(identifier: string, returnTo: string): Promise<void>`
  - `startSignUp(returnTo: string): Promise<void>` (target `{ type: 'pds', serviceUrl: SIGN_UP_PDS }`, `prompt: 'create'`)
  - `completeSignIn(hash: string): Promise<{ did: Did; returnTo: string }>`, which throws `OAuthCallbackError` with `code: 'denied' | 'missing' | 'failed'`
  - `restoreSession(): Promise<RestoreResult>` with `type RestoreResult = { status: 'none' } | { status: 'restored'; session: SessionHandle } | { status: 'expired' }`
  - `signOut(session: SessionHandle): Promise<void>`
  - `type SessionHandle = { did: Did; agent: OAuthUserAgent; rpc: Client }`
  - `useProfile(actor: string | undefined)`, a TanStack Query hook (key `['profile', actor]`, `staleTime` 5 minutes) over `app.bsky.actor.getProfile` on `publicAppView`, returning `{ did, handle, displayName?, avatar? }`
- **Produces (React):**
  - `SessionProvider`
  - `useSession(): SessionState & { signOut(): Promise<void> }` with `SessionState = { status: 'loading' } | { status: 'signedOut' } | { status: 'signedIn'; session: SessionHandle }`

- [ ] **Step 1: Write the failing pure tests** in `oauthConfig.test.ts`:

```ts
expect(buildOAuthEnv('http://127.0.0.1:5173', 'atproto')).toEqual({
  clientId: 'http://localhost?redirect_uri=http%3A%2F%2F127.0.0.1%3A5173%2Foauth%2Fcallback&scope=atproto',
  redirectUri: 'http://127.0.0.1:5173/oauth/callback',
  metadata: null,
});
expect(buildOAuthEnv('https://next.lanyards.app', 'atproto').metadata).toEqual({
  client_id: 'https://next.lanyards.app/oauth-client-metadata.json',
  client_name: 'Lanyards',
  client_uri: 'https://next.lanyards.app',
  logo_uri: 'https://next.lanyards.app/pwa-192x192.png',
  redirect_uris: ['https://next.lanyards.app/oauth/callback'],
  scope: 'atproto',
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
  application_type: 'web',
  dpop_bound_access_tokens: true,
});
expect(() => buildOAuthEnv('http://example.com', 'atproto')).toThrow();
expect(resolveBaseUrl({ command: 'build', env: { PUBLIC_BASE_URL: 'https://next.lanyards.app/' } })).toBe('https://next.lanyards.app');
expect(resolveBaseUrl({ command: 'build', env: { VERCEL_ENV: 'preview', VERCEL_BRANCH_URL: 'x.vercel.app' } })).toBe('https://x.vercel.app');
expect(() => resolveBaseUrl({ command: 'build', env: {} })).toThrow('PUBLIC_BASE_URL must be set for production builds');
expect(safeReturnTo('/settings')).toBe('/settings');
for (const bad of ['//evil.com', 'https://evil.com', '/\\evil', 42, undefined, '/' + 'a'.repeat(600)]) expect(safeReturnTo(bad)).toBe('/');
```

- [ ] **Step 2: Write the failing runtime tests** in `session.test.ts`, with `vi.mock('@atcute/oauth-browser-client')`:
  - `startSignIn('alice.bsky.social', '//evil')` calls `createAuthorizationUrl` with `{ target: { type: 'account', identifier: 'alice.bsky.social' }, scope: 'atproto', state: { returnTo: '/' } }`, then calls `location.assign` with the returned URL.
  - `startSignUp('/settings')` passes `prompt: 'create'` and the `pds` target `https://bsky.social`.
  - `completeSignIn('#error=access_denied')` rejects with `code: 'denied'`.
  - `completeSignIn('')` rejects with `code: 'missing'`.
  - When `finalizeAuthorization` rejects, `completeSignIn` rejects with `code: 'failed'`.
  - A successful `completeSignIn` stores the DID under `lanyards:did` and returns `returnTo` from the state.
  - **Review Focus 3:** `restoreSession()` with a stored DID and a rejecting `getSession` returns `{ status: 'expired' }`, calls `deleteStoredSession(did)`, and removes `lanyards:did`.
  - `restoreSession()` with no stored DID returns `{ status: 'none' }`.
  - `signOut` falls back to `deleteStoredSession` when `agent.signOut` rejects, and always clears the key.
- [ ] **Step 3: Write the failing provider tests.**
  - With `restoreSession` mocked to resolve `expired`, the provider settles on `signedOut`, and `notify.info` is called with "You've been signed out. Please sign in again."
  - With `restored`, the provider settles on `signedIn`.
  - `signOut()` moves the state to `signedOut` and calls `notify.success('Signed out')`.
- [ ] **Step 4: Run the tests to verify they fail.** Run `npm test -- --run src/lib/atproto src/features/auth/session`. Expected: FAIL.
- [ ] **Step 5: Implement** to the interfaces.
  - `startSignIn` waits 200 ms after `createAuthorizationUrl` before `location.assign`, as the atcute README advises.
  - `completeSignIn` builds its `URLSearchParams` from `hash.slice(1)`.
  - Analytics calls are added in Task 7.
- [ ] **Step 6: Run the tests to verify they pass,** then check the build output. Same test command; expected PASS. Then run `PUBLIC_BASE_URL=https://next.lanyards.app npm run build && cat dist/oauth-client-metadata.json`. Expected: JSON equal to the Step 1 metadata.
- [ ] **Step 7: Commit.** `feat: AT Protocol OAuth sign-in, sign-up and session restore (#101)`.

---

### Task 7: Privacy-first analytics and error reporting

**Files:**
- Create: `web/src/lib/analytics/events.ts`, `web/src/lib/analytics/sanitise.ts`, `web/src/lib/analytics/analytics.ts`
- Modify: `web/src/lib/atproto/session.ts` and `SessionProvider.tsx` (emit events)
- Test: `web/src/lib/analytics/sanitise.test.ts`, `web/src/lib/analytics/analytics.test.ts`

**Interfaces:**
- **Produces:**
  - `type AnalyticsEvent = 'app_opened' | 'sign_in_started' | 'sign_in_completed' | 'sign_in_failed' | 'sign_up_started' | 'signed_out' | 'session_expired' | 'pwa_update_applied'`
  - `type AnalyticsProps = Record<string, string | number | boolean>`
  - `sanitiseProps(props: AnalyticsProps): AnalyticsProps` drops any string value that looks like a DID (`/did:[a-z]+:/i`), a URL (`/[a-z][a-z0-9+.-]*:\/\//i`), an email address, or a handle-like domain (`/^@?[a-z0-9-]+(\.[a-z0-9-]+)+$/i`)
  - `sanitiseError(error: unknown): { name: string; message: string }` replaces those patterns in the message with `[redacted]`
  - `initAnalytics(opts: { key: string | undefined; host: string; doNotTrack: boolean }): boolean`
  - `track(event: AnalyticsEvent, props?: AnalyticsProps): void`
  - `captureError(error: unknown, context: { source: string }): void`
- The default host is `VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com'`. The `sign_in_failed` event carries `{ reason: 'denied' | 'missing' | 'failed' | 'start' }`.

- [ ] **Step 1: Write the failing tests.**
  - `sanitiseProps({ a: 'did:plc:abc', b: 'https://x.y', c: 'alice.bsky.social', d: 'me@x.com', e: 'button', f: 3, g: true })` returns `{ e: 'button', f: 3, g: true }`.
  - `sanitiseError(new Error('failed for did:plc:abc at https://pds.x'))` has message `'failed for [redacted] at [redacted]'`.
  - With `vi.mock('posthog-js')`, `initAnalytics({ key: undefined, … })` returns `false` and `doNotTrack: true` returns `false`, and in both cases `posthog.init` isn't called.
  - With a key, `init` is called with options containing `{ persistence: 'memory', person_profiles: 'never', autocapture: false, capture_pageview: false, disable_session_recording: true, respect_dnt: true }`.
  - `track('app_opened')` before init doesn't throw and doesn't call `capture`.
  - `captureError` sends the sanitised error.
- [ ] **Step 2: Run the tests to verify they fail.** Run `npm test -- --run src/lib/analytics`. Expected: FAIL.
- [ ] **Step 3: Implement,** and wire up the events:
  - `sign_in_started` and `sign_up_started` in the start functions
  - `sign_in_completed` and `sign_in_failed` in `completeSignIn`
  - `signed_out` and `session_expired` in the provider
- [ ] **Step 4: Run the tests to verify they pass.** Run `npm test -- --run src/lib/analytics src/lib/atproto src/features/auth`. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: cookieless analytics and error reporting without identifiers (#101)`.

---

### Task 8: Landing page and sign-in form

**Files:**
- Create:
  - `web/src/features/auth/components/SignInForm/` (`SignInForm.tsx`, `.types.ts`, `.styles.ts`, `.constants.ts`, `.validation.ts`)
  - `web/src/hooks/useOnlineStatus.ts`
  - `web/src/app/router.tsx`, `web/src/app/queryClient.ts`, `web/src/app/AppProviders.tsx`
  - `web/src/routes/__root.tsx`, `web/src/routes/index.tsx`
- Modify: `web/src/main.tsx` (call `configureAuth()` and `initAnalytics`, then render `RouterProvider`)
- Test: `SignInForm.validation.test.ts`, `SignInForm.test.tsx`, `web/src/hooks/useOnlineStatus.test.ts`

**Interfaces:**
- **Consumes:** `HandleCombobox` (Task 5), `Button`, `notify` (Task 4), `startSignIn`, `startSignUp`, `useSession` (Task 6), `track` (Task 7).
- **Produces:**
  - `normaliseIdentifier(raw: string): string` trims, strips one leading `@`, and lower-cases handles. DIDs are only trimmed, because they're case-sensitive.
  - `validateIdentifier(raw: string): SignInError | null`, with `type SignInError = 'required' | 'email' | 'invalid'`. Validation runs `isHandle` and `isDid` from `@atcute/lexicons/syntax` on the normalised value.
  - `SignInForm(props: { returnTo: string })`
  - `useOnlineStatus(): boolean`
  - The router context carries `{ queryClient }`.
  - The landing route `/` accepts the search param `returnTo` (passed through `safeReturnTo`). A signed-in user is redirected to `returnTo`, or to `/settings` when it's `'/'`.
- **Exact copy:**

| Element | Text |
|---|---|
| Heading | "Your conference lanyard, from your AT Protocol account" |
| Field label | "Your handle" |
| Hint | "For example alice.bsky.social" |
| Submit button | "Sign in" |
| Secondary button | "Create an account" |
| Error `required` | "Enter your handle" |
| Error `email` | "Enter your handle, not your email — for example alice.bsky.social" |
| Error `invalid` | "That doesn't look like a handle — for example alice.bsky.social" |
| Offline | "You're offline. Connect to sign in." |
| Start failure (toast) | "Couldn't start sign-in. Please try again." |

- [ ] **Step 1: Write the failing validation tests** (Review Focus 1):

```ts
expect(normaliseIdentifier('  @Alice.Bsky.Social ')).toBe('alice.bsky.social');
expect(normaliseIdentifier(' did:plc:Z72i7hdynmk6r22z27h6tvur ')).toBe('did:plc:Z72i7hdynmk6r22z27h6tvur');
expect(validateIdentifier('')).toBe('required');
expect(validateIdentifier('alice@example.com')).toBe('email');
expect(validateIdentifier('not a handle')).toBe('invalid');
expect(validateIdentifier('@Alice.Bsky.Social')).toBeNull();
expect(validateIdentifier('did:plc:z72i7hdynmk6r22z27h6tvur')).toBeNull();
```

- [ ] **Step 2: Write the failing component tests.**
  - Submitting empty shows "Enter your handle". The input has `aria-invalid="true"` and receives focus.
  - On blur after typing `me@x.com`, the email error shows.
  - Rendered with `returnTo="/settings"`, a valid submit of `@Alice.Bsky.Social` calls `startSignIn('alice.bsky.social', '/settings')`, and the button is disabled with `aria-busy` while pending.
  - When `startSignIn` rejects, the toast "Couldn't start sign-in. Please try again." appears, the input keeps its value, and `track('sign_in_failed', { reason: 'start' })` is called.
  - **Review Focus 4:** with `useOnlineStatus` mocked to `false`, the submit is disabled and "You're offline. Connect to sign in." is visible.
  - "Create an account" calls `startSignUp(returnTo)`.
  - axe passes.
- [ ] **Step 3: Run the tests to verify they fail.** Run `npm test -- --run src/features/auth/components src/hooks`. Expected: FAIL.
- [ ] **Step 4: Implement.**
  - Validation runs on blur and on submit.
  - The root route renders `AppProviders` (QueryClient, I18n, Session, Toaster) around the layout. The layout is the header (Task 9), `<main>` containing `<Outlet />`, and the offline banner (Task 9).
  - `useOnlineStatus` listens to the `online` and `offline` events.
- [ ] **Step 5: Run the tests to verify they pass.** Same command. Expected: PASS. Then run `npm run i18n:extract`; the new strings should be in `messages.po`.
- [ ] **Step 6: Commit.** `feat: landing page with validated, accessible sign-in (#101)`.

---

### Task 9: OAuth callback, Account screen, header and app-level states

**Files:**
- Create:
  - `web/src/routes/oauth.callback.tsx`, `web/src/routes/settings.tsx`
  - `web/src/features/auth/components/CallbackStatus/`, `web/src/features/account/components/AccountCard/`
  - `web/src/components/AppHeader/`, `web/src/components/OfflineBanner/`, `web/src/components/AppError/`, `web/src/components/NotFound/` (each 4-file)
- Modify: `web/src/routes/__root.tsx` (`errorComponent: AppError`, `notFoundComponent: NotFound`, header and banner)
- Test: `CallbackStatus.test.tsx`, `AccountCard.test.tsx`, `AppHeader.test.tsx`, `OfflineBanner.test.tsx`

**Interfaces:**
- **Consumes:** `completeSignIn`, `OAuthCallbackError`, `useSession`, `useProfile` (Task 6); `captureError` (Task 7); `useOnlineStatus` (Task 8).
- **Produces:**
  - **`CallbackStatus`** (`status: 'working' | 'denied' | 'missing' | 'failed'`). The route calls `completeSignIn(location.hash)` once, then immediately calls `history.replaceState(null, '', '/oauth/callback')`. On success it navigates to `returnTo`; on error it shows the status.
  - **`/settings`** redirects a signed-out user to `/?returnTo=%2Fsettings`. It renders `AccountCard`: the avatar, display name (falling back to the handle) and `@handle`, plus **Sign out**.
  - **`AppHeader`** shows the logo linking to `/`. When signed in, it adds an avatar link to `/settings` with accessible name "Your account".
  - **`OfflineBanner`** renders "You're offline. Some things won't work until you reconnect." in a `role="status"` region when offline.
  - **`AppError`** shows "Something went wrong" with a **Reload** button, and reports via `captureError(error, { source: 'route' })`.
  - **`NotFound`** shows "We couldn't find that page" with a link "Go to the home page".
- **Callback copy:**

| Status | Text |
|---|---|
| `working` | "Signing you in…" (`aria-live="polite"`) |
| `denied` | "Sign-in was cancelled." |
| `missing` | "This sign-in link has expired or was already used." |
| `failed` | "We couldn't finish signing you in." |

  Each error status also shows a link "Try again", pointing to `/`.

- [ ] **Step 1: Write the failing tests** (Review Focus 2).
  - **Callback route,** with `completeSignIn` mocked:
    - `#error=access_denied` → "Sign-in was cancelled." and a "Try again" link to `/`
    - an empty hash → the `missing` copy
    - a failed finalise → the `failed` copy
    - success → navigation to `/settings`
    - in every case, `history.replaceState` is called with `'/oauth/callback'`
  - **AccountCard** with a profile → it shows the display name and `@alice.bsky.social`; **Sign out** calls `signOut` from `useSession`.
  - **AppHeader:** signed out, there's no account link; signed in, there's a link named "Your account" to `/settings`.
  - **OfflineBanner:** offline shows the status text; online renders nothing.
  - axe passes for each.
- [ ] **Step 2: Run the tests to verify they fail.** Run `npm test -- --run src/features src/components/AppHeader src/components/OfflineBanner`. Expected: FAIL.
- [ ] **Step 3: Implement** to the interfaces.
- [ ] **Step 4: Run the tests to verify they pass.** Run `npm test -- --run`. Expected: all PASS. Then `npm run lint && npm run typecheck && npm run i18n:check`; expected exit 0 (after running `i18n:extract` and committing the catalogue).
- [ ] **Step 5: Commit.** `feat: OAuth callback, account screen and app-level states (#101)`.

---

### Task 10: Manual check in the browser (dev)

**Files:** none.

- [ ] **Step 1:** Run `npm run dev` in `web/` and open `http://127.0.0.1:5173`.
- [ ] **Step 2:** Use Playwright (deviceScaleFactor 1) to load `/`, type `ali`, and screenshot.
  - **Expected:** the typeahead lists accounts (live public AppView); the light and dark (`colorScheme`) screenshots show brand colours; there are no console errors.
- [ ] **Step 3:** Submit `alice@example.com`.
  - **Expected:** the email error, with focus on the input.
- [ ] **Step 4:** Open `/oauth/callback#error=access_denied`.
  - **Expected:** "Sign-in was cancelled.", and the URL bar shows `/oauth/callback` with no hash.
- [ ] **Step 5:** Fix anything found, re-run `npm test -- --run`, and commit any fixes with `fix: … (#101)`.

---

### Task 11: Installable PWA shell with update prompt

**Files:**
- Create: `web/pwa-assets.config.ts` (preset `minimal2023Preset`, image `public/logo-light.svg`), `web/src/components/UpdatePrompt/` (4-file)
- Copy: root `public/favicon.ico` → `web/public/`
- Modify: `web/vite.config.ts` (add `VitePWA`), `web/src/routes/__root.tsx` (render `UpdatePrompt`), `web/index.html` (`lang="en-GB"`, `theme-color`, title "Lanyards")
- Test: `web/src/components/UpdatePrompt/UpdatePrompt.test.tsx`

**Interfaces:**
- **Consumes:** `notify` (Task 4), `track` (Task 7).
- **Produces:** `UpdatePrompt()`, using `useRegisterSW` from `virtual:pwa-register/react`. When `needRefresh` becomes true it calls `notify.info('A new version of Lanyards is available', { action: { label: 'Reload', onClick } })`, where `onClick` tracks `pwa_update_applied` and calls `updateServiceWorker(true)`.
- **`VitePWA` options:**
  - `registerType: 'prompt'`, `pwaAssets: { config: true }`
  - manifest:
    - `{ name: 'Lanyards', short_name: 'Lanyards', description: 'Your conference lanyard on the AT Protocol', lang: 'en-GB', start_url: '/', scope: '/', display: 'standalone', theme_color: '#4020DF' }`
    - `background_color` is the light `--background` token converted to hex
  - workbox:
    - `navigateFallback: '/index.html'`
    - `navigateFallbackDenylist: [/^\/oauth-client-metadata\.json$/, /^\/api\//]`
    - `globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']`

- [ ] **Step 1: Write the failing test.** Mock `virtual:pwa-register/react` with `needRefresh = true`. Expect the toast text "A new version of Lanyards is available"; clicking "Reload" calls `updateServiceWorker(true)`.
- [ ] **Step 2: Run the test to verify it fails.** Run `npm test -- --run src/components/UpdatePrompt`. Expected: FAIL.
- [ ] **Step 3: Implement,** then `npm run build:e2e`.
  - **Expected:** `dist/` contains `manifest.webmanifest`, `sw.js`, and `pwa-64x64.png`, `pwa-192x192.png`, `pwa-512x512.png` and `maskable-icon-512x512.png`.
- [ ] **Step 4: Run the test to verify it passes.** Same command. Expected: PASS.
- [ ] **Step 5: Commit.** `feat: installable PWA shell with offline app shell and update prompt (#101)`.

---

### Task 12: End-to-end tests, bundle budget and CI

**Files:**
- Create:
  - `web/playwright.config.ts`
  - `web/e2e/landing.spec.ts`, `web/e2e/settings.spec.ts`, `web/e2e/callback.spec.ts`, `web/e2e/pwa.spec.ts`
  - `web/scripts/bundleSize.ts`, `web/scripts/check-bundle-size.ts`
  - `.github/workflows/web-ci.yml`
- Delete: `.github/workflows/hugo.yml` (stale: `docs/` moved to the wiki)
- Modify: `web/vite.config.ts` (`build.manifest: true`), `web/package.json` (`"size": "tsx scripts/check-bundle-size.ts"`, adding `tsx` as a dev dependency)
- Test: `web/scripts/bundleSize.test.ts`

**Interfaces:**
- **Produces:**
  - `INITIAL_JS_BUDGET_BYTES = 204800`
  - `initialJsFiles(manifest: Record<string, ManifestChunk>): string[]`: the `index.html` entry's `file` plus every chunk reachable through `imports` (not `dynamicImports`), deduplicated
  - `gzipSize(contents: Buffer): number` (`zlib.gzipSync`, level 9)
  - `check-bundle-size.ts` prints each file with its gzipped size and the total, and exits 1 when the total exceeds the budget
- **Playwright config:**
  - `webServer: { command: 'npm run build:e2e && npm run preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI }`
  - one `chromium` project, with `launchOptions.executablePath` set to `process.env.PW_CHROMIUM_PATH` when present

- [ ] **Step 1: Write the failing unit test.** Given a manifest where `index.html` → `assets/index.js` imports `assets/vendor.js`, and lazily (via `dynamicImports`) imports `assets/settings.js`, `initialJsFiles` returns `['assets/index.js', 'assets/vendor.js']`.
- [ ] **Step 2: Write the e2e specs.**
  - **landing:**
    - the heading is visible, and submitting empty shows "Enter your handle"
    - `AxeBuilder` finds no violations in light **and** dark (`colorScheme: 'dark'`)
    - at a 320×640 viewport, `document.documentElement.scrollWidth` ≤ 320
  - **settings:** visiting `/settings` signed out ends at `/?returnTo=%2Fsettings`, with the sign-in form shown.
  - **callback:**
    - `/oauth/callback#error=access_denied` shows "Sign-in was cancelled.", and `page.url()` has no hash
    - `/oauth/callback` shows "This sign-in link has expired or was already used."
  - **pwa:** the page links a manifest whose `name` is `'Lanyards'`; `navigator.serviceWorker.ready` resolves. Then, with `context.setOffline(true)`, reloading `/` still shows the heading and the offline banner (Review Focus 4).
- [ ] **Step 3: Run to verify they fail.** Run `npm test -- --run scripts` (FAIL) and `npm run e2e` (the specs fail or are pending until the implementation is in).
- [ ] **Step 4: Implement** the scripts and config, then add the CI workflow.
  - **Triggers:** `pull_request` and `push` to `main`, with `paths: ['web/**', '.github/workflows/web-ci.yml']`.
  - **Defaults:** `working-directory: web`, Node 22, with npm cache.
  - **Steps, in order:** `npm ci`, `npm run lint`, `npm run typecheck`, `npm run i18n:check`, `npm test -- --run`, `npm run build:e2e`, `npm run size`, `npx playwright install --with-deps chromium`, `npm run e2e`.
  - Delete `hugo.yml`.
- [ ] **Step 5: Verify.** Run `npm test -- --run` (all PASS), `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium npm run e2e` (all PASS), and `npm run size`. Expected: a total ≤ 204800 bytes, and exit 0.
- [ ] **Step 6: Commit.** `ci: web e2e, axe, bundle budget workflow; remove stale Hugo deploy (#101)`.

---

### Task 13: Beta deploy to next.lanyards.app

**Files:**
- Create: `web/vercel.json`
- Modify: `web/README.md` (the deploy and environment section)

**Interfaces:**
- **Consumes:** the build from Tasks 6 and 11 (`PUBLIC_BASE_URL`, `VITE_POSTHOG_KEY`).
- **Produces:** the Vercel project `lanyards-next` (team `renderghost`, Git repo `renderghost/lanyards`, Root Directory `web`, framework Vite, production branch `main`), with the domain `next.lanyards.app`.
- **`web/vercel.json`:**
  - `ignoreCommand: "git diff --quiet HEAD^ HEAD -- ."`
  - `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]`
  - headers:
    - `/oauth-client-metadata.json` → `Content-Type: application/json`, `Cache-Control: public, max-age=300`
    - `/sw.js` → `Cache-Control: no-cache`
- **Production environment variables:**
  - `PUBLIC_BASE_URL=https://next.lanyards.app`
  - `VITE_POSTHOG_KEY` (from the owner; analytics stays disabled until it's set)
  - `VITE_POSTHOG_HOST=https://eu.i.posthog.com`

- [ ] **Step 1: Add `web/vercel.json`.** Commit it with `chore: Vercel config for the web app (#101)` and push.
- [ ] **Step 2: Create the Vercel project and domain (needs owner approval).**
  - Create the project with the settings above via the Vercel connector, set the env vars, and add `next.lanyards.app`.
  - If the connector reports a DNS record is needed, give the owner the exact record and wait.
- [ ] **Step 3: Verify the deployment.**
  - `curl -s https://next.lanyards.app/oauth-client-metadata.json` returns JSON whose `client_id` is `https://next.lanyards.app/oauth-client-metadata.json` and whose `content-type` is `application/json`. This confirms static files take precedence over the SPA rewrite.
  - `curl -s -o /dev/null -w '%{http_code}' https://next.lanyards.app/settings` returns `200`.
  - The legacy `https://lanyards.app` still responds `200`.
- [ ] **Step 4: Owner smoke test (owner action).** The owner signs in on `https://next.lanyards.app` with a real account, sees their name and handle on `/settings`, signs out, then installs the PWA on a phone and opens it offline. Record the result in #101.
- [ ] **Step 5: Open the PR.** Open a PR "feat: Slice 1a foundations (#101)" with `Closes #101`, then subscribe to its activity. Only the owner approves and merges.
