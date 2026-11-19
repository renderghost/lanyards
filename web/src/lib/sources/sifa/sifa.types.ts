/** Sifa's openTo values, without the `id.sifa.defs#` prefix. */
export const OPEN_TO_VALUES = [
  'fullTimeRoles',
  'partTimeRoles',
  'contractRoles',
  'commissions',
  'boardPositions',
  'mentoringOthers',
  'beingMentored',
  'collaborations',
  'speakingEngagements',
] as const;

export type OpenToValue = (typeof OPEN_TO_VALUES)[number];

/** Every `key` is the item's AT-URI, as stored in a lanyard's `hidden`. */
export type SifaPosition = {
  key: string;
  title: string;
  company?: string;
  startedAt?: string;
  endedAt?: string;
  isPrimary: boolean;
};

export type SifaEducation = {
  key: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startedAt?: string;
  endedAt?: string;
};

export type SifaSkill = { key: string; name: string };

export type SifaAccount = {
  key: string;
  url: string;
  /** Bare and lower-case, e.g. 'orcid', 'github', 'website'. */
  platform: string;
  label?: string;
};

export type SifaPublication = {
  key: string;
  title: string;
  doi?: string;
  url?: string;
  date?: string;
  venue?: string;
};

export type SifaTalk = {
  key: string;
  title: string;
  eventName?: string;
  date?: string;
  /** e.g. 'presenter', 'keynote', 'panelist'. */
  role?: string;
  url?: string;
};

export type SifaProfile = {
  handle?: string;
  displayName?: string;
  /** Before the name, as typed in Sifa, e.g. "Dr" or "Prof.". */
  honorificPrefix?: string;
  /** After the name, e.g. "PhD" or "OBE". */
  honorificSuffix?: string;
  /** Whether the person shows their honorifics (Sifa's default: yes). */
  showHonorifics: boolean;
  avatar?: string;
  pronouns?: string;
  headline?: string;
  location?: string;
  langs: string[];
  openTo: OpenToValue[];
  positions: SifaPosition[];
  education: SifaEducation[];
  skills: SifaSkill[];
  externalAccounts: SifaAccount[];
  publications: SifaPublication[];
  talks: SifaTalk[];
};
