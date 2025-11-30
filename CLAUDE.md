# Lanyards Development Guide

## THE GOLDEN RULE

**The goal is production-quality code, not a prototype**. Every change should be something you'd be confident shipping. Quality over speed. Completeness over convenience.

---

## Instructions for Claude

### Issue Tracking
Use GitHub Issues via the `gh` CLI for all task tracking:
- **NEVER** use markdown files for to-do lists or tracking work
- **ALWAYS** create issues for bugs and features before starting work
- Reference issue numbers in commits and PRs

### Git Workflow
- **NEVER** commit without explicit user instruction
- **NEVER** push without explicit user instruction
- **NEVER** use `--force` or destructive git commands
- You may run `git status`, `git diff`, `git log` freely
- You may stage files with `git add` when explicitly asked
- Leave version control decisions to the user

### Core Principles
**1. No Stubs, No Shortcuts**
- **NEVER** use placeholder implementations or `// TODO` comments
- **NEVER** skip functionality because it seems complex
- **NEVER** leave incomplete code paths
- Every function must be fully implemented and working

**2. Complete Before Moving On**
- Finish the current task before starting another
- If blocked, discuss with the user rather than working around it
- Each increment of work must be complete and functional

**3. Verify Your Work**
- Run `npm run lint` after changes
- Test locally with `npm run dev`
- Check the browser - don't assume it works

---

## Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS (no inline styles)
- **Auth**: AT Protocol OAuth (`@atcute/oauth-browser-client`)
- **Protocol**: AT Protocol (`@atproto/*` packages)
- **Data**: ProfileRepository pattern wrapping AtpAgent

---

## ⚠️ CRITICAL OAuth Configuration Rules

**NEVER USE `localhost` - ALWAYS USE `127.0.0.1`**

RFC 8252 REQUIRES loopback IP addresses, NOT hostnames:
- ✅ `http://127.0.0.1:3000/oauth/callback`
- ❌ `http://localhost:3000/oauth/callback`

AT Protocol OAuth will reject `localhost` with "invalid_request" error.

**Development Configuration:**
- `SERVER_HOST = '127.0.0.1'` in `next.config.ts`
- Fallback redirect_uri must use `127.0.0.1` in `src/lib/oauth/config.ts`
- Access the app via `http://127.0.0.1:3000` (NOT localhost)

**Production Configuration:**
- Use full HTTPS URLs from `.env` (e.g., `https://lanyards.app/oauth/callback`)

---

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
│   ├── auth/         # Legacy session compatibility layer
│   ├── oauth/        # OAuth client and session management
│   ├── data/         # ProfileRepository, DOI resolution
│   └── utils.ts      # Utilities including cn()
└── types/            # TypeScript definitions
    └── generated/    # Auto-generated from lexicons

lexicons/             # AT Protocol schemas (*.json)
docs/                 # Hugo documentation site
```

---

## Code Quality Standards

### TypeScript
- Strict mode is enabled - respect it
- Use proper types, avoid `any` (warnings are configured)
- Prefer type inference where obvious, explicit types for function signatures
- Use `Result`-style error handling patterns where appropriate

### Component Architecture
**All components MUST follow this 4-file structure:**

```
ComponentName/
├── ComponentName.tsx           # Logic and JSX
├── ComponentName.types.ts      # TypeScript interfaces
├── ComponentName.styles.ts     # Tailwind class strings
└── ComponentName.constants.ts  # Hardcoded values (optional)
```

### Styling Rules
- **No margin utilities** - use `gap` for spacing between siblings, `padding` for internal
- **All text needs `leading-*`** - always specify line-height
- **Use `cn()`** from `@/lib/utils` for conditional classes
- **No inline styles** - Tailwind only

### Code Conventions
- **Quotes**: Single quotes
- **Semicolons**: Yes
- **Trailing commas**: ES5 style
- **Line width**: 80 characters
- **Unused vars**: Prefix with `_`

### Error Handling
- Use try/catch in API routes with meaningful error responses
- Return appropriate HTTP status codes
- Never swallow errors silently
- Log errors server-side for debugging

---

## Form Standards

All forms must be accessible, usable, and provide clear feedback.

### Input Selection by Data Type

Choose the appropriate input for the data:

| Data Type               | Input Component                      | Example                      |
| ----------------------- | ------------------------------------ | ---------------------------- |
| Free text (short)       | `<input type="text">`                | Name, title                  |
| Free text (long)        | `<textarea>`                         | Bio, description             |
| Closed list (large)     | Select with typeahead/autocomplete   | Country, institution         |
| Closed list (small, ≤5) | Radio buttons                        | Honorific (Dr, Prof, Mr, Ms) |
| Boolean                 | Checkbox or toggle                   | Visibility settings          |
| Date                    | Date picker                          | Event date, graduation year  |
| URL                     | `<input type="url">` with validation | Website, social link         |
| Email                   | `<input type="email">`               | Contact email                |

### Validation & Error Handling

**Client-side:**
- Validate on blur and on submit
- Show inline errors immediately below the field
- Use `aria-describedby` to link error messages to inputs
- Disable submit button while submitting (prevent double-submit)

**Server-side:**
- Always validate again server-side (never trust client)
- Return structured error responses with field-level details
- Log validation failures for debugging

**Error message format:**
```typescript
// Field-level errors
{
  success: false,
  errors: {
    fieldName: 'Specific, actionable message'
  }
}
```

### Feedback & Notifications

**On success:**
- Show toast confirmation: "Affiliation added" / "Profile updated" / "Item deleted"
- Clear form or redirect as appropriate
- Update UI state immediately (optimistic updates where safe)

**On error:**
- Show toast for system errors: "Failed to save. Please try again."
- Show inline errors for validation failures
- Preserve user input - never clear the form on error

### Accessibility Requirements

- All inputs must have visible `<label>` elements (not just placeholder)
- Use `aria-required="true"` for required fields
- Use `aria-invalid="true"` when field has error
- Use `aria-describedby` to associate help text and error messages
- Ensure 4.5:1 color contrast for all text
- Forms must be fully keyboard navigable
- Focus management: move focus to first error on failed submit
- Loading states must be announced to screen readers

### Form Component Structure

```
FormName/
├── FormName.tsx           # Form logic, state, submission
├── FormName.types.ts      # Props, form values, validation types
├── FormName.styles.ts     # Tailwind classes
├── FormName.constants.ts  # Default values, options lists
└── FormName.validation.ts # Zod schema or validation functions
```

---

## Lexicon Workflow

Lexicons define content types for the AT Protocol. A lexicon is not complete until it has full end-to-end implementation.

### Naming Convention

Lexicons use hierarchical namespacing:
```
app.lanyards.<category>.<subcategory>.<type>
```

Examples:
- `app.lanyards.actor.biography.affiliation`
- `app.lanyards.actor.profile.content`
- `app.lanyards.link.social`

Choose names that are:
- Descriptive and unambiguous
- Scalable (can accommodate future related types)
- Consistent with existing lexicon structure

### End-to-End Implementation Checklist

A lexicon is **not complete** until all of these exist:

1. **Schema** - JSON file in `lexicons/` with proper naming
2. **Types** - Run `npm run lex:gen`, update `src/types/index.ts` if needed
3. **Repository** - CRUD methods in `src/lib/data/repository.ts`
4. **API Routes** - Endpoints in `src/app/api/`
5. **Dashboard Page** - Management UI in `src/app/dashboard/`
6. **Form** - Create/edit form with proper validation (see Form Standards below)
7. **Public Display** - Component for `src/app/[handle]/` profile view
8. **Feedback** - Toast notifications for all CRUD operations

### Implementation Order

```
Schema → Types → Repository → API → Form → Dashboard → Public Display
```

> [!IMORTANT]
> Each layer **must** be complete and tested before moving to the next.

---

## Bug Workflow

### Raising Bugs (From VS Code)

When we discover a bug during development:

```bash
gh issue create \
  --title "Bug: [Brief description]" \
  --body "## Description
[What's happening]

## Steps to Reproduce
1.
2.
3.

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Environment
- Browser:
- Node: $(node -v)" \
  --label bug
```

### For External Bug Reports

Direct users to: https://github.com/barryprendergast/lanyards/issues/new

### Fixing Bugs from Issues

1. **Read the issue**
   ```bash
   gh issue view <number>
   ```

2. **Create a fix branch**
   ```bash
   git checkout -b fix/issue-<number>-<short-description>
   ```

3. **Make the fix**
   - Follow component architecture
   - Run `npm run lint:fix`
   - Test locally with `npm run dev`

4. **User verification** (REQUIRED before any commit)
   - Present the fix to the user
   - User reviews and tests the implementation
   - User explicitly confirms the fix works as expected
   - **NEVER commit until user has verified**

5. **Commit with issue reference** (only after user verification)
   ```bash
   git commit -m "Fix #<number>: [description]"
   ```

6. **Push and create PR** (when user approves)
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

7. **After merge** - verify issue closes automatically via "Closes #N"

### Bug Labels
- `bug` - Confirmed bugs
- `needs-triage` - Unconfirmed reports
- `good-first-issue` - Simple fixes for new contributors
- `critical` - Breaking functionality

---

## Feature Workflow

1. **Create issue** with `enhancement` label first
2. **Create feature branch**
   ```bash
   git checkout -b feature/issue-<number>-<description>
   ```
3. **Implement the feature**
   - Follow component architecture
   - Run `npm run lint:fix`
   - Test locally with `npm run dev`
4. **User verification** (REQUIRED before any commit)
   - Present the implementation to the user
   - User reviews and tests the feature
   - User explicitly confirms it works as expected
   - **NEVER commit until user has verified**
5. **Commit, push, and create PR** (same as bug workflow)

---

## What To Do When Facing Complexity

**DON'T:**
- Stub it out with `// TODO`
- Skip it and move on
- Say "we'll come back to it"
- Implement a simplified version that doesn't match requirements

**DO:**
- Break the problem into smaller pieces
- Identify and resolve dependencies first
- Ask the user for guidance on approach
- Propose a phased plan where each phase is complete
- Discuss trade-offs before implementing

### Example: Adding a Complex New Feature

**WRONG:**
```typescript
export async function complexFeature() {
  // TODO: implement this later
  return null;
}
```

**RIGHT:**
1. Understand the full requirements
2. Identify dependencies (types, API routes, components)
3. Create the lexicon schema first if needed
4. Implement the data layer (repository methods)
5. Build the API routes
6. Create the UI components
7. Test each layer before moving to the next

---

## Quality Checklist

Before marking any task complete:

- [ ] All requirements from the issue are implemented
- [ ] No `// TODO` or placeholder code
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` succeeds
- [ ] Tested locally in browser
- [ ] Component architecture followed (4-file structure)
- [ ] Types are complete (no `any` unless unavoidable)
- [ ] Error cases are handled
- [ ] Code is formatted (`npm run format`)

---