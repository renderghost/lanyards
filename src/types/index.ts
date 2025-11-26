/**
 * Type exports for Lanyards application
 * Manually defined types based on AT Protocol lexicon schemas
 *
 * Note: The lex gen-api tool only generates full API clients for record types,
 * but doesn't export individual type interfaces. We define these manually based
 * on the lexicon schemas in src/types/generated/lexicons.ts
 */

import type { AppLanyardsCollection } from './generated';

// Actor Biography Types - defined based on lexicon schemas
export interface Identity {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  banner?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Honorific {
  value: 'none' | 'Dr' | 'Prof';
  createdAt: string;
  updatedAt?: string;
}

export interface Affiliation {
  organizationName: string;
  organizationType?: 'institution' | 'company' | 'government' | 'other';
  role?: string;
  startDate: string;
  endDate?: string;
  isPrimary?: boolean;
  location?: {
    city?: string;
    country?: string;
  };
  website?: string;
  createdAt: string;
}

export interface Qualification {
  title: string;
  type: 'phd' | 'masters' | 'bachelors' | 'postdoc' | 'certification' | 'fellowship' | 'other';
  institution: string;
  field?: string;
  yearAwarded: number;
  location?: {
    city?: string;
    country?: string;
  };
  createdAt: string;
}

export interface Skill {
  name: string;
  category?: 'technical' | 'methodological' | 'domain-expertise' | 'language' | 'other';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  createdAt: string;
}

export interface Location {
  country?: string;
  city?: string;
}

// Actor Profile Types
export interface ProfileContent {
  type: 'header' | 'text';
  content?: string;
  position?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ProfilePinned {
  items: string[]; // AT-URI references
  createdAt: string;
  updatedAt?: string;
}

export interface ProfileTheme {
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: 'system' | 'serif' | 'sans-serif' | 'monospace';
  layout?: 'compact' | 'comfortable' | 'spacious';
  createdAt: string;
  updatedAt?: string;
}

export interface ProfileVisible {
  hiddenItems: string[]; // AT-URI references
  createdAt: string;
  updatedAt?: string;
}

// Link Types
export interface LinkEvent {
  name: string;
  type: 'conference' | 'symposium' | 'workshop' | 'seminar' | 'lecture' | 'poster-session' | 'webinar' | 'other';
  startDate: string;
  endDate?: string;
  location?: {
    city?: string;
    country?: string;
  };
  organizerName?: string;
  relatedWorks?: string[]; // AT-URI references
  url?: string;
  createdAt: string;
}

export interface LinkWork {
  doi: string;
  type: string;
  title?: string;
  authors?: string[];
  publicationDate?: string;
  venue?: string;
  abstract?: string;
  url?: string;
  publication?: {
    name?: string;
    type?: 'journal' | 'proceedings' | 'preprint' | 'repository' | 'book-series' | 'other';
    issn?: string;
    website?: string;
  };
  event?: string; // AT-URI reference
  createdAt: string;
}

export interface LinkSocial {
  platform: 'bluesky' | 'twitter' | 'linkedin' | 'mastodon' | 'researchgate' | 'googlescholar' | 'orcid' | 'semble' | 'other';
  url: string;
  isLocked?: boolean;
  createdAt: string;
}

export interface LinkWeb {
  url: string;
  title?: string;
  createdAt: string;
}

export interface LinkMediaAudio {
  url: string;
  platform: 'spotify' | 'apple-podcasts' | 'soundcloud' | 'anchor' | 'other';
  title?: string;
  description?: string;
  type?: 'podcast-episode' | 'interview' | 'lecture' | 'panel-discussion' | 'other';
  seriesName?: string;
  duration?: number;
  publishedDate?: string;
  relatedWork?: string; // AT-URI reference
  createdAt: string;
}

export interface LinkMediaCode {
  url: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'codepen' | 'gist' | 'other';
  title?: string;
  description?: string;
  language?: string;
  tags?: string[];
  createdAt: string;
}

export interface LinkMediaVideo {
  url: string;
  platform: 'youtube' | 'vimeo' | 'twitch' | 'tiktok' | 'other';
  title?: string;
  description?: string;
  type?: 'lecture' | 'presentation' | 'interview' | 'tutorial' | 'conference-talk' | 'other';
  duration?: number;
  publishedDate?: string;
  relatedWork?: string; // AT-URI reference
  createdAt: string;
}

// Embedded Object Types
export interface Publication {
  name?: string;
  type?: 'journal' | 'proceedings' | 'preprint' | 'repository' | 'book-series' | 'other';
  issn?: string;
  website?: string;
}

// Collection Type - use the generated type
export type Collection = AppLanyardsCollection.Record;

// Convenience type aliases for enum values
export type HonorificValue = Honorific['value'];
export type OrganizationType = NonNullable<Affiliation['organizationType']>;
export type QualificationType = NonNullable<Qualification['type']>;
export type SkillCategory = NonNullable<Skill['category']>;
export type SkillProficiency = NonNullable<Skill['proficiency']>;
export type ContentBlockType = ProfileContent['type'];
export type ThemeFontFamily = NonNullable<ProfileTheme['fontFamily']>;
export type ThemeLayout = NonNullable<ProfileTheme['layout']>;
export type EventType = LinkEvent['type'];
export type WorkType = LinkWork['type'];
export type SocialPlatform = LinkSocial['platform'];
export type AudioPlatform = LinkMediaAudio['platform'];
export type AudioType = NonNullable<LinkMediaAudio['type']>;
export type CodePlatform = LinkMediaCode['platform'];
export type VideoPlatform = LinkMediaVideo['platform'];
export type VideoType = NonNullable<LinkMediaVideo['type']>;
export type PublicationType = NonNullable<Publication['type']>;
