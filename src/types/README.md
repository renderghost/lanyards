## Lanyards Types Generation

Lanyards uses the AT Protocol Lexicon CLI [@atproto/lex-cli](https://www.npmjs.com/package/@atproto/lex-cli) to automatically generate TypeScript types from the lexicon JSON definitions.

### Generated Files

When you run the code generation, the following files are created in `src/types/generated/`:

```
src/types/generated/
├── index.ts                          - Main export file with all types
├── lexicons.ts                       - Lexicon definitions for runtime validation
├── util.ts                           - Utility types and helpers
└── types/at/lanyard/                 - Generated type definitions
    ├── researcher.ts                 - Researcher record types
    ├── work.ts                       - Work record types
    ├── event.ts                      - Event record types
    ├── link.ts                       - Link record types
    ├── publication.ts                - Publication object types
    ├── organization.ts               - Organization object types
    └── location.ts                   - Location object types
```

> [!NOTE]
> The types are **NOT** committed to git in most workflows, but are generated as part of the build process.

### Commands

**Generate types once:**
```bash
npm run lex:gen
```
This command reads all `.json` files in the `lexicons/` directory and generates TypeScript types in `src/types/generated/`.

**Watch mode (development):**
```bash
npm run lex:watch
```
Watches for changes to lexicon files and automatically regenerates types.

**Build process:**
```bash
npm run build
```
The build command automatically runs `lex:gen` before building the Next.js app to ensure types are up-to-date.

### How It Works

1. **Lexicon Definitions**: JSON files in `lexicons/` define the schema using AT Protocol lexicon syntax
2. **CLI Tool**: `@atproto/lex-cli` parses the JSON definitions
3. **Type Generation**: Creates TypeScript interfaces, types, and validation schemas
4. **Import & Use**: Generated types are imported throughout the codebase via `@/types/generated`

### Generated Type Structure

Each generated file includes:
- **Record types**: For top-level collection records (researcher, work, event, link)
- **Object types**: For embedded objects (location, organization, publication)
- **Input/Output schemas**: For API operations (create, update, delete)
- **Validation functions**: Runtime validation using the lexicon definitions

### Example Usage

```typescript
import {
  Researcher,
  Work,
  Event,
  Link
} from '@/types/generated';

// Use generated types in your code
const researcher: Researcher.Record = {
  did: 'did:plc:...',
  handle: 'researcher.bsky.social',
  createdAt: new Date().toISOString(),
  // ... other fields
};
```

### Type Declaration Fixes

Due to import path resolution in generated types, we maintain custom type declarations in `src/types/`:
- **`atproto.d.ts`**: Namespace declarations for AT Protocol repo operations
- **`multiformats.d.ts`**: Module declaration for CID imports

These ensure the generated types work correctly with the AT Protocol SDK.

### Regenerating Types

You should regenerate types whenever you:
1. **Modify lexicon files**: Add/remove fields, change types, update descriptions
2. **Add new lexicons**: Create new `.json` files in `lexicons/`
3. **Change constraints**: Update validation rules (maxLength, enum values, etc.)
4. **Pull changes**: After pulling changes that include lexicon updates


