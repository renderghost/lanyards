# Lanyards Lexicons

This directory contains the AT Protocol lexicon definitions for Lanyard.

> [!NOTE]
> Lanyards uses the AT Protocol Lexicon CLI [@atproto/lex-cli](https://www.npmjs.com/package/@atproto/lex-cli) to automatically generate TypeScript types from the lexicon JSON definitions.

## Namespace Structure

All lexicons use the `at.lanyard.*` namespace in anticipation of the `lanyard.at` domain.

```
at.lanyard/
├── researcher          - Core researcher profile (singleton record)
├── work                - Scholarly contributions (DOI-based, multiple records)
├── event               - Academic events (conferences, workshops, multiple records)
├── link                - External profiles and links (unified, multiple records)
├── publication         - Publication venues (journals, conferences, embedded object)
├── organization        - Institutions and entities (embedded object)
└── location            - Geographic locations (embedded object)
```

## Lexicon Details

### Records (Top-level collections)

Records are stored as collections in the user's repository with `at-uri` identifiers.

> [!NOTE]
> The following records are given as example. Referred to the lexicon themselves from more complete and up-to-date documentation.

**`at.lanyard.researcher`**
- **Type**: Record (singleton, key: `literal:self`)
- **Description**: The researcher's core profile and identity
- **Required Fields**: `did`, `handle`, `createdAt`
- **Optional Fields**: `displayName`, `avatar`, `description` (synced from Bluesky), `honorifics`, `location`, `affiliations`, `updatedAt`
- **Embeds**: `location` (at.lanyard.location), `affiliations[]` (affiliation object)
- **Subdefs**: `affiliation` - professional relationships with organizations

**`at.lanyard.work`**
- **Type**: Record (multiple, key: `tid`)
- **Description**: Scholarly contributions identified by DOI
- **Required Fields**: `doi`, `type`, `createdAt`
- **Optional Fields**: `title`, `authors[]`, `publicationDate`, `venue`, `publication` (ref), `event` (at-uri ref)
- **Work Types**: `abstract`, `poster`, `paper`, `conference-proceeding`, `journal-article`, `book-chapter`, `book`, `preprint`, `dataset`, `other`
- **Note**: Metadata auto-fetched from CrossRef/DataCite via DOI

**`at.lanyard.event`**
- **Type**: Record (multiple, key: `tid`)
- **Description**: Academic events where research is presented or discussed
- **Required Fields**: `name`, `type`, `startDate`, `createdAt`
- **Optional Fields**: `endDate`, `location` (ref), `organizer` (ref), `relatedWorks[]` (at-uri refs), `url`
- **Event Types**: `conference`, `symposium`, `workshop`, `seminar`, `lecture`, `poster-session`, `webinar`, `other`
- **Embeds**: `location` (at.lanyard.location), `organizer` (at.lanyard.organization)

**`at.lanyard.link`**
- **Type**: Record (multiple, key: `tid`)
- **Description**: External profiles and custom web links (unified collection)
- **Required Fields**: `url`, `type`, `createdAt`
- **Optional Fields**: `platform`, `title`, `username`, `isLocked`
- **Link Types**:
  - `social` - Twitter, LinkedIn, Bluesky
  - `academic` - ORCID, Google Scholar, ResearchGate, Semble
  - `web` - Custom web links (max 3 per profile)
- **Platforms**: `bluesky`, `twitter`, `linkedin`, `researchgate`, `googlescholar`, `orcid`, `semble`, `custom`
- **Constraints**: 1 per social/academic platform, max 3 custom web links

### Embedded Objects (Reusable components)

Embedded objects are not stored as separate records but are embedded within other records.

**`at.lanyard.location`**
- **Type**: Object (embedded)
- **Description**: Geographic location using ISO standard codes
- **Fields**: `country` (ISO 3166-1 alpha-2), `region` (ISO 3166-2), `city`, `isVirtual`
- **Used By**: researcher, organization, event
- **Examples**: `{country: "US", region: "US-CA", city: "San Francisco"}`, `{isVirtual: true}`

**`at.lanyard.organization`**
- **Type**: Object (embedded)
- **Description**: Institutions, publishers, societies, funders, companies
- **Required Fields**: `name`
- **Optional Fields**: `type`, `ringgoldId`, `gridId`, `rorId`, `location` (ref), `website`, `logo` (blob)
- **Organization Types**: `institution`, `publisher`, `society`, `funder`, `company`, `government`, `other`
- **Used By**: researcher.affiliation, event.organizer, publication.publisher
- **Identifiers**: Ringgold ID (academic institutions), GRID ID, ROR ID

**`at.lanyard.publication`**
- **Type**: Object (embedded)
- **Description**: Publication venues (journals, conference proceedings, preprint servers)
- **Required Fields**: `name`
- **Optional Fields**: `type`, `issn`, `publisher` (ref), `website`, `subjects[]`
- **Publication Types**: `journal`, `proceedings`, `preprint`, `repository`, `book-series`, `other`
- **Used By**: work.publication
- **Examples**: Nature, PLOS ONE, arXiv, NeurIPS Proceedings

## Object Relationships

```
at.lanyard.researcher (record)
  ├─ embeds → location (object)
  └─ embeds → affiliations[] (objects)
      └─ embed → organization (object)
          └─ embed → location (object)

at.lanyard.work (record)
  ├─ embeds → publication (object)
  │   └─ embed → organization (object) [publisher]
  └─ refs → event (at-uri) [optional]

at.lanyard.event (record)
  ├─ embeds → location (object)
  ├─ embeds → organizer (organization object)
  └─ refs → relatedWorks[] (at-uri)

at.lanyard.link (record)
  └─ (no references)
```

## Design Principles

1. **Flat Namespace** - Simple top-level structure, no deep nesting
2. **Embedded Objects** - Reusable components (location, organization, publication) embedded, not separate records
3. **DOI-Centric** - Works primarily identified by DOI, metadata auto-fetched
4. **Unified Links** - Single collection for social, academic, and custom links
5. **AT Protocol Conventions** - Follows app.bsky.* patterns with records and embedded objects
6. **Single Source of Truth** - Bluesky profile data is locked and synced

## Future Expansion

The structure allows for growth:
- `at.lanyard.education` - Academic degrees and credentials
- `at.lanyard.grant` - Research funding records
- `at.lanyard.patent` - Patent records
- `at.lanyard.dataset` - Research datasets
- `at.lanyard.teaching` - Teaching activities and courses
