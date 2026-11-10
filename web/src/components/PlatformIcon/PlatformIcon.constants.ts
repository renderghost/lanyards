import {
  siBluesky,
  siCodeberg,
  siGithub,
  siGitlab,
  siGooglescholar,
  siInstagram,
  siMastodon,
  siOrcid,
  siSubstack,
  siX,
  siYoutube,
} from 'simple-icons';

import type { Platform } from '@/lib/person/platform';

/** Brand marks (simple-icons, CC0). Other platforms get a globe. */
export const MARKS: Partial<Record<Platform, { path: string }>> = {
  github: siGithub,
  gitlab: siGitlab,
  codeberg: siCodeberg,
  orcid: siOrcid,
  youtube: siYoutube,
  bluesky: siBluesky,
  fediverse: siMastodon,
  x: siX,
  instagram: siInstagram,
  googleScholar: siGooglescholar,
  substack: siSubstack,
};
