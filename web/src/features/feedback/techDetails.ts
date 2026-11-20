const BROWSERS: [RegExp, string][] = [
  [/Edg\/(\d+)/, 'Edge'],
  [/Firefox\/(\d+)/, 'Firefox'],
  [/Chrome\/(\d+)/, 'Chrome'],
  [/Version\/(\d+).*Safari/, 'Safari'],
];

const SYSTEMS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Android/, 'Android'],
  [/Mac OS X/, 'macOS'],
  [/Windows/, 'Windows'],
  [/Linux|X11/, 'Linux'],
];

/** "Chrome 131 on macOS", from a user agent string. */
export function browserOf(agent: string): string {
  const browser = BROWSERS.map(
    ([pattern, name]) => [pattern.exec(agent), name] as const
  ).find(([match]) => match);
  if (!browser) return 'Unknown browser';
  const [match, name] = browser;
  const system = SYSTEMS.find(([pattern]) => pattern.test(agent))?.[1];
  const version = `${name} ${match![1]}`;
  return system ? `${version} on ${system}` : version;
}

/**
 * The technical details a bug report may include, opt-in and shown in
 * full before it's sent (#134): no names, accounts or identifiers.
 */
export function techDetails({ page }: { page: string }): string {
  return [
    `App: ${__APP_VERSION__}`,
    `Browser: ${browserOf(navigator.userAgent)}`,
    `Window: ${window.innerWidth}×${window.innerHeight}`,
    `Page: ${page}`,
  ].join('\n');
}
