# Lanyards Lexicons

This directory contains the AT Protocol lexicon definitions for Lanyards.

> [!NOTE]
> Lanyards uses the AT Protocol Lexicon CLI [@atproto/lex-cli](https://www.npmjs.com/package/@atproto/lex-cli) to automatically generate TypeScript types from the lexicon JSON definitions.

## Namespace Structure

All lexicons use the `app.lanyards.*` namespace for the `lanyards.app` domain.

Lanyards is fundamentally a **link roll** for academics - everything is a link to external resources or information about the person managing those links.

```
lexicons/
├── README.md
├── actor/                         - Information about the person and their preferences
│   ├── biography/                 - Biographical information about the person
│   │   ├── affiliation.json       - Professional affiliations (multiple records)
│   │   ├── honorific.json         - Academic title (Dr, Prof) (singleton)
│   │   ├── identity.json          - Core identity synced from Bluesky (locked singleton)
│   │   ├── location.json          - Home location (embedded object)
│   │   ├── qualification.json     - Degrees and certifications (multiple records)
│   │   └── skill.json             - Skills and expertise (multiple records)
│   ├── preference/                - App preferences (placeholder for future)
│   └── profile/                   - Profile display configuration
│       ├── content.json           - Custom text blocks/headers (multiple records)
│       ├── pinned.json            - Featured/pinned items (singleton)
│       ├── theme.json             - Visual customization (singleton)
│       └── visible.json           - Visibility settings (singleton)
├── collection/                    - Named collections of links
│   └── collection.json            - Organized groups of links with ordering
└── link/                          - Links to external resources
    ├── event/                     - Links to academic events
    │   └── event.json             - Conferences, workshops, symposiums
    ├── media/                     - Links to media content
    │   ├── audio.json             - Audio (podcasts, interviews)
    │   ├── code.json              - Code repositories and gists
    │   └── video.json             - Videos (lectures, talks, interviews)
    ├── social/                    - Social & academic profile links
    │   └── social.json            - Unified social/academic platform links
    ├── web/                       - Custom web links
    │   └── web.json               - Personal websites, blogs, portfolios
    └── work/                      - Links to research works
        ├── publication.json       - Publication venue (embedded object)
        └── work.json              - Scholarly work (DOI-based)
```

## Core Concepts

### 1. Actor (The Person)

The **actor** namespace contains everything about the person themselves:

#### actor/biography/ - Biographical Information

- **identity.json** - Core identity fields synced from Bluesky (did, handle, displayName, avatar, description, banner) - **locked/read-only singleton**
- **honorific.json** - Academic title (none, Dr, Prof) - **editable singleton**
- **location.json** - Home location (country, city) - **embedded object**
- **affiliation.json** - Current and past institutional affiliations with roles and dates - **multiple records**
- **skill.json** - Technical skills, methodologies, and domain expertise - **multiple records**
- **qualification.json** - Academic degrees, certifications, and credentials - **multiple records**

#### actor/profile/ - Profile Display Configuration

- **pinned.json** - Featured/prioritized links or collections (max 6 items) - **singleton**
- **visible.json** - Visibility controls (which links/collections to hide) - **singleton**
- **theme.json** - Visual customization (colors, fonts, layout density) - **singleton**
- **content.json** - Custom text blocks and section headers for storytelling - **multiple records**

#### actor/preference/ - App Preferences

Placeholder directory for future app-level preferences (notifications, privacy, security).

### 2. Link (External Resources)

Everything in the **link** namespace is a link to something external:

#### link/event/ - Academic Events

- **event.json** - Links to conferences, workshops, symposiums, seminars where research is presented - **multiple records**

#### link/work/ - Research Works

- **work.json** - Scholarly publications identified by DOI (papers, posters, datasets) - **multiple records**
- **publication.json** - Publication venue details (embedded object: journal name, ISSN, type)

#### link/media/ - Media Content

- **code.json** - Code repositories (GitHub, GitLab), gists, CodePen - **multiple records**
- **video.json** - Videos (YouTube, Vimeo) - lectures, presentations, interviews - **multiple records**
- **audio.json** - Audio content (Spotify, podcasts) - episodes, interviews, panels - **multiple records**

#### link/social/ - Social & Academic Profiles

- **social.json** - Unified collection for both social networks and academic platforms - **multiple records**
  - Social: Bluesky, Twitter, LinkedIn, Mastodon
  - Academic: ORCID, Google Scholar, ResearchGate, Semble
  - **Constraint**: 1 link per platform

#### link/web/ - Custom Web Links

- **web.json** - Generic web links for personal websites, blogs, portfolios, etc. - **multiple records**
  - **Constraint**: Max 3 per profile

### 3. Collection (Organized Groups)

The **collection** namespace allows organizing links into named groups:

- **collection.json** - A titled collection with description, icon, and manually ordered array of link references - **multiple records**
- Use cases: "My Publications", "2024 Conference Talks", "Teaching Resources"

## Lexicon Details

### Records vs Embedded Objects

**Records** are stored as collections in the user's repository with unique `at-uri` identifiers. Each record can be created, updated, and deleted independently.

**Embedded Objects** are reusable components defined in lexicons but embedded within records rather than stored separately. Examples: location, publication venue.

### Record Types (by key)

- **Singleton Records** (`key: "literal:self"`) - Only one per user
  - `actor.biography.identity`
  - `actor.biography.honorific`
  - `actor.profile.pinned`
  - `actor.profile.visible`
  - `actor.profile.theme`

- **Multiple Records** (`key: "tid"`) - Many per user
  - `actor.biography.affiliation`
  - `actor.biography.skill`
  - `actor.biography.qualification`
  - `actor.profile.content`
  - `link.event.event`
  - `link.work.work`
  - `link.media.code`
  - `link.media.video`
  - `link.media.audio`
  - `link.social.social`
  - `link.web.web`
  - `collection.collection`

### Embedded Objects

**app.lanyards.actor.biography.location**
- Fields: `country` (string), `city` (string)
- Used by: affiliation, qualification, event
- Simple country/city representation (moved away from ISO codes for simplicity)

**app.lanyards.link.work.publication**
- Fields: `name`, `type`, `issn`, `website`
- Used by: link.work.work
- Represents publication venues (journals, conferences, preprints)

## Data Flow

### Locked vs Editable Fields

**Locked (from Bluesky)**:
- `actor.biography.identity.*` - Synced from Bluesky profile, cannot be edited in Lanyards
- Changes must be made on Bluesky and will sync automatically

**Editable (in Lanyards)**:
- Everything else - `actor.biography.*`, `actor.profile.*`, `link.*`, `collection.*`

### Profile Display Logic

The public profile combines:
1. **Identity** from `actor.biography.identity` (locked)
2. **Biographical details** from `actor.biography.*` (editable)
3. **Links** from `link.*` (all types)
4. **Collections** from `collection.collection`
5. **Display configuration** from `actor.profile.*`
   - Pinned items appear first
   - Hidden items are excluded
   - Custom content blocks tell stories
   - Theme applies visual styling

## Design Principles

1. **Hierarchical Naming** - Clear namespace hierarchy reflects conceptual organization
2. **Link-Centric** - Everything is fundamentally about links to external resources
3. **Actor-Centric** - Clear separation between person (actor) and content (links)
4. **Embedded Objects** - Reusable components without creating separate records
5. **DOI-Centric** - Research works identified by DOI with auto-fetched metadata
6. **Configurable Display** - Rich profile customization through actor.profile.*
7. **Single Source of Truth** - Bluesky profile data is authoritative and locked
8. **Flexibility** - Collections and content blocks enable creative profile organization

## File Organization

Lexicon files are now organized by functional hierarchy:

- **actor/** - Person-centric data
  - **biography/** - Who they are (identity, credentials, affiliations)
  - **profile/** - How they present themselves (theme, layout, featured content)
  - **preference/** - How they use the app (future)

- **link/** - External resource links
  - **event/** - Academic events
  - **work/** - Research works and publications
  - **media/** - Code, video, audio content
  - **social/** - Social and academic platform profiles
  - **web/** - Custom web links

- **collection/** - Organizational structures for grouping links

## Future Expansion

Potential additions:
- `actor.preference.*` - App-level preferences (notifications, privacy, security)
- `actor.biography.award` - Awards and honors
- `link.grant` - Research funding and grants
- `link.patent` - Patent filings
- `link.dataset` - Research datasets
- `link.teaching` - Teaching materials and courses
