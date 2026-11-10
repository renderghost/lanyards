export type Platform =
  | 'github'
  | 'gitlab'
  | 'codeberg'
  | 'tangled'
  | 'orcid'
  | 'linkedin'
  | 'youtube'
  | 'bluesky'
  | 'sifa'
  | 'x'
  | 'instagram'
  | 'googleScholar'
  | 'substack'
  | 'semble'
  | 'fediverse'
  | 'website';

/** Host (or parent domain) → platform. */
const HOSTS: Record<string, Platform> = {
  'github.com': 'github',
  'gitlab.com': 'gitlab',
  'codeberg.org': 'codeberg',
  'tangled.org': 'tangled',
  'tangled.sh': 'tangled',
  'orcid.org': 'orcid',
  'linkedin.com': 'linkedin',
  'youtube.com': 'youtube',
  'youtu.be': 'youtube',
  'bsky.app': 'bluesky',
  'sifa.id': 'sifa',
  'x.com': 'x',
  'twitter.com': 'x',
  'instagram.com': 'instagram',
  'scholar.google.com': 'googleScholar',
  'substack.com': 'substack',
  'semble.so': 'semble',
};

/** Sifa platform values that name a platform the host can't reveal. */
const HINTS: Record<string, Platform> = {
  fediverse: 'fediverse',
  mastodon: 'fediverse',
  bluesky: 'bluesky',
  github: 'github',
  gitlab: 'gitlab',
  codeberg: 'codeberg',
  tangled: 'tangled',
  orcid: 'orcid',
  linkedin: 'linkedin',
  youtube: 'youtube',
  twitter: 'x',
  instagram: 'instagram',
  substack: 'substack',
};

/** Which platform icon a link gets: by host, then by the Sifa hint. */
export function detectPlatform(url: string, hint?: string): Platform {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return 'website';
  }
  const labels = host.split('.');
  for (let index = 0; index < labels.length - 1; index += 1) {
    const platform = HOSTS[labels.slice(index).join('.')];
    if (platform) return platform;
  }
  return (hint && HINTS[hint.toLowerCase()]) || 'website';
}
