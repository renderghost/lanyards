/**
 * Type exports for Lanyards application
 * Re-exports generated AT Protocol lexicon types with convenient aliases
 */

import type {
  AppLanyardsActorBiographyAffiliation,
  AppLanyardsActorBiographyHonorific,
  AppLanyardsActorBiographyIdentity,
  AppLanyardsActorBiographyLocation,
  AppLanyardsActorBiographyQualification,
  AppLanyardsActorBiographySkill,
  AppLanyardsActorProfileContent,
  AppLanyardsActorProfilePinned,
  AppLanyardsActorProfileTheme,
  AppLanyardsActorProfileVisible,
  AppLanyardsCollection,
  AppLanyardsLinkEvent,
  AppLanyardsLinkMediaAudio,
  AppLanyardsLinkMediaCode,
  AppLanyardsLinkMediaVideo,
  AppLanyardsLinkSocial,
  AppLanyardsLinkWeb,
  AppLanyardsLinkWork,
  AppLanyardsLinkWorkPublication,
} from './generated';

// Actor Biography Types
export type Identity = AppLanyardsActorBiographyIdentity.Record;
export type Honorific = AppLanyardsActorBiographyHonorific.Record;
export type Affiliation = AppLanyardsActorBiographyAffiliation.Record;
export type Qualification = AppLanyardsActorBiographyQualification.Record;
export type Skill = AppLanyardsActorBiographySkill.Record;
export type Location = AppLanyardsActorBiographyLocation.Main;

// Actor Profile Types
export type ProfileContent = AppLanyardsActorProfileContent.Record;
export type ProfilePinned = AppLanyardsActorProfilePinned.Record;
export type ProfileTheme = AppLanyardsActorProfileTheme.Record;
export type ProfileVisible = AppLanyardsActorProfileVisible.Record;

// Link Types
export type LinkEvent = AppLanyardsLinkEvent.Record;
export type LinkWork = AppLanyardsLinkWork.Record;
export type LinkSocial = AppLanyardsLinkSocial.Record;
export type LinkWeb = AppLanyardsLinkWeb.Record;
export type LinkMediaAudio = AppLanyardsLinkMediaAudio.Record;
export type LinkMediaCode = AppLanyardsLinkMediaCode.Record;
export type LinkMediaVideo = AppLanyardsLinkMediaVideo.Record;

// Embedded Object Types
export type Publication = AppLanyardsLinkWorkPublication.Main;

// Collection Type
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
