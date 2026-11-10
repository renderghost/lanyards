# Lanyards web app

The rebuilt Lanyards attendee app: a front-end-only, installable PWA built on
the AT Protocol. Design spec:
`docs/superpowers/specs/2026-11-10-attendee-ux-design.md`.

This folder is self-contained. The legacy Next.js app at the repository root
keeps serving `lanyards.app` until the rebuild's Slice 1c swaps it over.

## Commands

Run everything from `web/`:

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Dev server on `http://127.0.0.1:5173` (never localhost) |
| `npm test`          | Unit and component tests (Vitest)                       |
| `npm run e2e`       | End-to-end tests (Playwright) against a preview build   |
| `npm run lint`      | ESLint, including accessibility rules                   |
| `npm run typecheck` | TypeScript                                              |
| `npm run build`     | Production build (needs `PUBLIC_BASE_URL`)              |
| `npm run format`    | Prettier                                                |

Copy `.env.example` to `.env.local` for local overrides.

`npm run size` checks the initial JavaScript against the 200 KB gzipped
budget after a build. If your environment ships its own Chromium, point the
e2e tests at it with `PW_CHROMIUM_PATH=/path/to/chromium npm run e2e`.
