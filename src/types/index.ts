/**
 * Type exports for Lanyards application
 * Re-exports generated AT Protocol lexicon types with convenient aliases
 */

import type {
  AtLanyardProfile,
  AtLanyardAffiliation,
  AtLanyardWork,
  AtLanyardEvent,
  AtLanyardLink,
  AtLanyardOrganization,
  AtLanyardPublication,
  AtLanyardLocation,
} from './generated';

// Main record types
export type Profile = AtLanyardProfile.Record;
export type Affiliation = AtLanyardAffiliation.Record;
export type Work = AtLanyardWork.Record;
export type Event = AtLanyardEvent.Record;
export type Link = AtLanyardLink.Record;
export type Organization = AtLanyardOrganization.Main;
export type Publication = AtLanyardPublication.Main;
export type Location = AtLanyardLocation.Main;

// Convenience type aliases for enums and unions
export type Honorific = 'none' | 'Dr' | 'Prof';
export type WorkType = Work['type'];
export type EventType = Event['type'];
export type LinkType = Link['type'];
export type LinkPlatform = NonNullable<Link['platform']>;
export type OrganizationType = NonNullable<Organization['type']>;
export type PublicationType = NonNullable<Publication['type']>;
