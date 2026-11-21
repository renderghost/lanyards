import { msg } from '@lingui/core/macro';
import {
  BookOpen,
  Building2,
  Globe,
  type LucideIcon,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

import type { Accent } from '@/design/accents';
import type { CoverPattern } from '@/design/covers';
import {
  BLUESKY_HANDLE,
  DOCS_URL,
} from '@/features/feedback/feedback.constants';

type Message = ReturnType<typeof msg>;
type Point = { title: Message; text: Message };

export const LINKS = {
  docs: DOCS_URL,
  github: 'https://github.com/renderghost/lanyards',
  contact: 'https://bsky.app/profile/renderg.host',
  bluesky: `https://bsky.app/profile/${BLUESKY_HANDLE}`,
} as const;

/** The old homepage's copy (#145), in British English. */
export const PARADOX: Point[] = [
  {
    title: msg`Scattered presence`,
    text: msg`ORCID for publications, ResearchGate for networking, personal website for informal work, Twitter for visibility, conference sites for talks—each needs manual updates.`,
  },
  {
    title: msg`Missing context`,
    text: msg`Informal work like preprints, datasets, ongoing projects, and social engagement doesn’t fit existing academic infrastructure.`,
  },
  {
    title: msg`Constant maintenance`,
    text: msg`Time spent updating multiple platforms is time not spent on research. Each change requires logging into different systems.`,
  },
  {
    title: msg`No single truth`,
    text: msg`There’s no single place that represents your complete, current scholarly identity when opportunities arise.`,
  },
];

type Feature = Point & {
  icon: LucideIcon;
  /** Each in its own accent and cover: what a lanyard can wear. */
  accent: Accent;
  cover: CoverPattern;
  initials?: string;
};

/** Two are edited to say only what the new app does (#145). */
export const FEATURES: Feature[] = [
  {
    icon: Building2,
    accent: 'blue',
    cover: 'dots',
    title: msg`Professional identity`,
    text: msg`Affiliations, qualifications, and skills presented with proper academic aesthetic.`,
  },
  {
    icon: BookOpen,
    accent: 'mint',
    cover: 'stripes',
    title: msg`Research outputs`,
    text: msg`Publications, talks, and events—both formal and informal contributions.`,
  },
  {
    icon: Users,
    accent: 'pink',
    cover: 'orb',
    title: msg`Social presence`,
    text: msg`Connect all your academic and social profiles in one place.`,
  },
  {
    icon: Sparkles,
    accent: 'lime',
    cover: 'pixels',
    title: msg`Auto-ingestion`,
    text: msg`Connect ORCID, and your publications appear automatically.`,
  },
  {
    icon: Zap,
    accent: 'pink',
    cover: 'arrows',
    title: msg`Your control`,
    text: msg`Put your work in the order you want, and hide what’s not relevant.`,
  },
  {
    icon: Globe,
    accent: 'blue',
    cover: 'monogram',
    initials: 'AT',
    title: msg`AT Protocol`,
    text: msg`Decentralised, open, yours—no platform lock-in or data silos.`,
  },
];

export const BENEFITS: Point[] = [
  {
    title: msg`Less admin, more research`,
    text: msg`Update once, share everywhere. No more Sunday afternoons updating ten different websites or managing multiple link collections.`,
  },
  {
    title: msg`Complete visibility`,
    text: msg`New connections see the full scope of your work immediately—from formal publications to informal contributions that drive real connections.`,
  },
  {
    title: msg`Career continuity`,
    text: msg`Your research identity stays with you across institutions. No more losing control when changing positions.`,
  },
  {
    title: msg`Open infrastructure`,
    text: msg`Built on AT Protocol—transparent, inspectable, and aligned with academic values of openness and reusability.`,
  },
];
