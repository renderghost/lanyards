# Lanyards Development Guide

## Project Overview

Lanyards is a decentralized researcher profile platform built on the AT Protocol (Bluesky). It's an alternative to ORCID, allowing researchers to share their academic identity, publications, affiliations, and social links via their Bluesky handle.

**Live docs**: https://docs.lanyards.app

## Quick Reference

```bash
# Development
npm run dev          # Start dev server (runs lex:gen first)
npm run lex:gen      # Generate types from lexicons

# Code quality
npm run lint         # Check for issues
npm run lint:fix     # Auto-fix issues
npm run format       # Format with Prettier
```

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (no inline styles)
- **Auth**: App Password (dev) / OAuth (production - not yet active)
- **Protocol**: AT Protocol (`@atproto/*` packages)
- **Data**: ProfileRepository pattern wrapping AtpAgent

## Project Structure

```
src/
├── app/              # Next.js routes
│   ├── [handle]/     # Public profile pages
│   ├── api/          # REST endpoints
│   ├── auth/         # Login pages
│   └── dashboard/    # Protected routes
├── components/       # React components (strict 4-file structure)
├── lib/
│   ├── auth/         # Authentication logic
│   ├── data/         # ProfileRepository, DOI resolution
│   └── utils.ts      # Utilities including cn()
└── types/            # TypeScript definitions
    └── generated/    # Auto-generated from lexicons

lexicons/             # AT Protocol schemas (*.json)
docs/                 # Hugo documentation site
```

## Component Architecture

**All components MUST follow this 4-file structure:**

```
ComponentName/
├── ComponentName.tsx           # Logic and JSX
├── ComponentName.types.ts      # TypeScript interfaces
├── ComponentName.styles.ts     # Tailwind class strings
└── ComponentName.constants.ts  # Hardcoded values (optional)
```

**Styling rules:**
- No margin utilities - use `gap` and `padding`
- All text needs `leading-*` for line-height
- Use `cn()` from `@/lib/utils` for dynamic classes
- Design tokens: `bones-blue`, `bones-white`, `bones-black`, `bones-yellow`

## Code Conventions

- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Trailing commas**: ES5 style
- **Line width**: 80 characters
- **Unused vars**: Prefix with `_`

## Lexicon Workflow

When modifying AT Protocol record schemas:
1. Edit JSON files in `lexicons/`
2. Run `npm run lex:gen`
3. Update corresponding types in `src/types/index.ts` if needed

---

## Bug Workflow

### Raising Bugs (From VS Code)

When we discover a bug during development:

```bash
# Create issue with appropriate labels
gh issue create \
  --title "Bug: [Brief description]" \
  --body "## Description
[What's happening]

## Steps to Reproduce
1. ...
2. ...

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser:
- OS:
- Node version: $(node -v)" \
  --label bug
```

**Bug issue template checklist:**
- [ ] Clear, descriptive title starting with "Bug:"
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior
- [ ] Environment details if relevant
- [ ] Screenshots if UI-related

### For External Bug Reports

Direct users to: https://github.com/barryprendergast/lanyards/issues/new

### Fixing Bugs from Issues

**Standard workflow:**

1. **Read the issue**
   ```bash
   gh issue view <number>
   ```

2. **Create a fix branch**
   ```bash
   git checkout -b fix/issue-<number>-<short-description>
   # Example: fix/issue-42-profile-not-loading
   ```

3. **Make the fix**
   - Follow component architecture
   - Run `npm run lint:fix` before committing
   - Test locally with `npm run dev`

4. **Commit with issue reference**
   ```bash
   git commit -m "Fix #<number>: [description]"
   ```

5. **Push and create PR**
   ```bash
   git push -u origin fix/issue-<number>-<short-description>
   gh pr create \
     --title "Fix #<number>: [description]" \
     --body "## Summary
   [What was fixed and how]

   ## Testing
   - [ ] Tested locally
   - [ ] No lint errors

   Closes #<number>"
   ```

6. **After merge, verify issue closes automatically**
   - The "Closes #N" syntax auto-closes the issue
   - If reporter provided contact, consider notifying them

### Bug Labels

Use these labels consistently:
- `bug` - Confirmed bugs
- `needs-triage` - Unconfirmed reports
- `good-first-issue` - Simple fixes for new contributors
- `critical` - Breaking functionality

---

## Feature Workflow

For new features (not bugs):

1. Create issue with `enhancement` label first
2. Branch naming: `feature/issue-<number>-<description>`
3. Same PR workflow as bugs

---

## Common Tasks

### Adding a new profile section

1. Create lexicon in `lexicons/`
2. Run `npm run lex:gen`
3. Add types to `src/types/index.ts`
4. Add repository methods in `src/lib/data/repository.ts`
5. Create API routes in `src/app/api/`
6. Create dashboard page in `src/app/dashboard/`
7. Create display component for public profile

### Adding a new social link type

1. Update `src/types/index.ts` - add to `SocialPlatform` type
2. Update `src/components/links/` components
3. Add icon if needed

---

## Environment Setup

Copy `.env.example` to `.env.local`:

```env
AUTH_METHOD=app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
PDS_URL=https://bsky.social
```

## Troubleshooting

- **Type errors after lexicon changes**: Run `npm run lex:gen`
- **Auth issues**: Check `AUTH_METHOD` in `.env.local`
- **Build fails**: Run `npm run lint:fix` then `npm run build`
