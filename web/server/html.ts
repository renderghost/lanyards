/**
 * Builds the HTML for link previews. Shared by the Vercel functions only:
 * this folder never imports the app's `@/` alias or `import.meta.env`.
 */

export type PageMeta = {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
  type: 'profile' | 'website';
};

const ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapes text for use in HTML content and attribute values. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char] ?? char);
}

/** What a link to Lanyards itself, or to someone who opted out, shows. */
export function defaultMeta(base: string): PageMeta {
  return {
    title: 'Lanyards',
    description: 'Your conference lanyard on the AT Protocol',
    canonical: `${base}/`,
    image: `${base}/og/default.png`,
    imageAlt: 'Lanyards',
    type: 'website',
  };
}

const TITLE = /<title>[\s\S]*?<\/title>/;
const DESCRIPTION = /<meta\s+name="description"[\s\S]*?\/>/;

/**
 * Puts `meta` into the built index.html: replaces the title and description
 * and adds canonical, Open Graph and Twitter tags. Every value is escaped.
 */
export function injectMeta(indexHtml: string, meta: PageMeta): string {
  const e = escapeHtml;
  const tags = [
    `<link rel="canonical" href="${e(meta.canonical)}" />`,
    `<meta property="og:type" content="${e(meta.type)}" />`,
    `<meta property="og:site_name" content="Lanyards" />`,
    `<meta property="og:title" content="${e(meta.title)}" />`,
    `<meta property="og:description" content="${e(meta.description)}" />`,
    `<meta property="og:url" content="${e(meta.canonical)}" />`,
    `<meta property="og:image" content="${e(meta.image)}" />`,
    `<meta property="og:image:alt" content="${e(meta.imageAlt)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ].join('\n    ');

  return indexHtml
    .replace(TITLE, () => `<title>${e(meta.title)}</title>`)
    .replace(
      DESCRIPTION,
      () => `<meta name="description" content="${e(meta.description)}" />`
    )
    .replace('</head>', () => `    ${tags}\n  </head>`);
}
