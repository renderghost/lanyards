import type { ExternalLinkTone } from './ExternalLink.types';

const base = 'underline-offset-4 hover:underline [overflow-wrap:anywhere]';

export const tones: Record<ExternalLinkTone, string> = {
  // Underlined at rest: next to body text, colour alone can't mark a link.
  ui: `${base} text-ui-link underline`,
  accent: `${base} text-accent-text`,
};

export const srOnly = 'sr-only';
