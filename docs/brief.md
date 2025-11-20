# Overview
'Lanyards' is a dedicated profile for researchers, built on the AT profile.

Researchers will use this as an alternative to the ORCID id.

# Technology Stack
* eslint
* nextjs (latest version)
* postcss
* prettier
* Relevant @atproto/* npm packages (search https://www.npmjs.com/search?q=%40atproto%2F  )
* tailwind (v4)
* typescript

## Potential NPM Packages

> [!IMPORTANT]
> These packages are listed as optional and should not be considered essential or mandatory.

* @atproto/api
* @atproto/common
* @atproto/identity
* @atproto/lex-cli
* @atproto/lexicon
* @atproto/oauth-client-node
* @atproto/sync
* @atproto/syntax
* @atproto/xrpc-server
* cors
* dotenv
* types
* uuid
* zod

> [!IMPORTANT]
> NEVER speculate on package version numbers. Always use 'latest' version in the package.json.

# Features:

## Account Creation and Sign-In
Create accounts using your @bluesky account:

* Users can create an account with their DID (e.g. a bluesky handle), hosted on *any* PDS, securly using *Oauth* **only**
* No email signup supported

## Researcher Profile

Display your managed data beautifully

- Mobile-first (for easy realworld networking)
- "Follow on Bluesky" primary action
- View profile link as QR Code (for easy sharing at conferences)
<!-- - Broadcast via Bluetooth (advertist you) -->

## Manage Profile

"Build a rich user profile, designed for **Researchers**"

### Basics
Manage your User Profile

* Avatar Photo (locked, added from authenticated account)
* Description Text (locked, added from authenticated account)
* Honorifics
  * Add Doctor
  * Add Professor
* Location
  * ISO Codes

### Affiliations
Manage Professional Affiliations

Manage here means CRUD (create, read, update, remove).

* allow multiple
* required start date
* optional end date (marked as `current` if without end date)
* optional mark as `primary` (max 1)

> [!IMPORTANT]
> Use Ringgold or Grid for Organisation data

### Social Network Profiles
Manage Social Network Profile Links

* Bluesky (Only 1 allowed)
  * added from authenticated account
  * cannot be edited/hidden/deleted
* Twitter Profile (Only 1 allowed)
  * can be created/edited/deleted
* LinkedIn Profile (Only 1 allowed)
  * can be created/edited/deleted
* ResearchGate Profile (Only 1 allowed)
  * can be created/edited/deleted
* Google Scholar Profile (Only 1 allowed)
  * can be created/edited/deleted
* Semble Profile (Only 1 allowed)
  * can be created/edited/deleted
  * https://semble.so for details

### Web Links

Manage Web Links (up to 3)
* can be created/edited/deleted

## Manage Scholarly Contributions

"Add your research to your profile, using DOIs"

* Add Research Links
  * Type (e.g. Abstract, Poster, Paper, Conference Proceeding)
  * No upper limit
  * Add DOI only
  * Metadata is collected from link destination

## Manage Academic Events
Add your conference presentations

  * Type (e.g. Conference, Symposium, etc)
  * Date of Event (as a single date, or a range)
  * Add related Research (as Scholarly Contribution)
  * Organiser (as Organisation)

# Typed Lexicons

* User
* Location (for user, organisation)
* Organisation (for Affiliation)
* Social Network Profiles
* Web Links
* Work (for Scholarly Contributions)
* Event

# Leverage Collections in PDS

Where possible and relevant, use data from collections in the PDS, such as

* app.bsky.actor.profile
* app.bsky.graph.block
* app.bsky.graph.follow
* app.bsky.graph.verification

[Future development!!!] Where the user has a semble.so account
* network.cosmik.card
* network.cosmik.collection
* network.cosmik.collectionLink