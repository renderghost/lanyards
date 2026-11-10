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

## Deploying the beta (`next.lanyards.app`)

The app deploys from a **second** Vercel project. The legacy project keeps
serving `lanyards.app` from the repository root until Slice 1c (#103).

### 1. Create the Vercel project

In the Vercel dashboard (team `renderghost`): **Add New → Project →** import
`renderghost/lanyards`, then set:

| Setting           | Value                                           |
| ----------------- | ----------------------------------------------- |
| Project name      | `lanyards-next`                                 |
| Framework preset  | Vite                                            |
| Root Directory    | `web`                                           |
| Build and output  | leave as detected (`web/vercel.json` sets them) |
| Production branch | `main` (Settings → Git, after creation)         |

Keep **Settings → Environment Variables → "Automatically expose System
Environment Variables"** on, because preview builds use `VERCEL_ENV` and
`VERCEL_BRANCH_URL`.

### 2. Environment variables

| Name                | Environment | Value                       |
| ------------------- | ----------- | --------------------------- |
| `PUBLIC_BASE_URL`   | Production  | `https://next.lanyards.app` |
| `VITE_POSTHOG_KEY`  | —           | leave unset during the beta |
| `VITE_POSTHOG_HOST` | —           | leave unset during the beta |

Production builds fail on purpose without `PUBLIC_BASE_URL`, because the
OAuth client metadata is generated from it.

### 3. Domain

1. In the project: **Settings → Domains → Add** `next.lanyards.app`.
2. `lanyards.app` uses Cloudflare DNS. Add this record in Cloudflare:

   | Type  | Name   | Target                 | Proxy status          |
   | ----- | ------ | ---------------------- | --------------------- |
   | CNAME | `next` | `cname.vercel-dns.com` | DNS only (grey cloud) |

   Keep the proxy off so Vercel can issue the certificate.

### 4. Check the deployment

After the first production deployment from `main`:

```bash
curl -s https://next.lanyards.app/oauth-client-metadata.json
# → JSON whose client_id is https://next.lanyards.app/oauth-client-metadata.json
curl -sI https://next.lanyards.app/oauth-client-metadata.json | grep -i content-type
# → application/json
curl -s -o /dev/null -w '%{http_code}\n' https://next.lanyards.app/settings
# → 200
```

Then sign in with a real account, check your name and handle on `/settings`,
sign out, and install the app on a phone and open it offline.

### Preview deployments

Preview builds work, but Vercel protects previews with Vercel Authentication
by default. Bluesky's servers can't fetch a protected preview's OAuth
metadata, so **sign-in only works on `next.lanyards.app`** (or locally)
unless you relax deployment protection for previews.
