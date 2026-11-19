import type { ExternalLinkTone } from './ExternalLink.types';

const base = 'underline-offset-4 hover:underline [overflow-wrap:anywhere]';

export const tones: Record<ExternalLinkTone, string> = {
  ui: `${base} text-ui-primary`,
  accent: `${base} text-accent-text`,
};

export const srOnly = 'sr-only';
