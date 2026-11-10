// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { defaultMeta, escapeHtml, injectMeta } from './html.ts';

const INDEX = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="description"
      content="Your conference lanyard on the AT Protocol"
    />
    <title>Lanyards</title>
  </head>
  <body><div id="root"></div></body>
</html>`;

const meta = {
  title: 'Ada Example (@alice.test) · Lanyards',
  description: 'Research Engineer',
  canonical: 'https://lanyards.app/@alice.test',
  image: 'https://lanyards.app/og/p/did:plc:x.png',
  imageAlt: "Ada Example's lanyard",
  type: 'profile' as const,
};

describe('escapeHtml', () => {
  it('escapes every character that could break out of an attribute', () => {
    expect(escapeHtml(`<a href="x" onclick='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });
});

describe('injectMeta', () => {
  it('replaces the title and description and adds Open Graph tags', () => {
    const html = injectMeta(INDEX, meta);
    expect(html.match(/<title>/g)).toHaveLength(1);
    expect(html).toContain(
      '<title>Ada Example (@alice.test) · Lanyards</title>'
    );
    expect(html).toContain(
      '<meta name="description" content="Research Engineer" />'
    );
    expect(html).not.toContain('Your conference lanyard on the AT Protocol');
    expect(html).toContain(
      '<link rel="canonical" href="https://lanyards.app/@alice.test" />'
    );
    expect(html).toContain('<meta property="og:type" content="profile" />');
    expect(html).toContain(
      '<meta property="og:image" content="https://lanyards.app/og/p/did:plc:x.png" />'
    );
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image" />'
    );
    expect(html.indexOf('og:title')).toBeLessThan(html.indexOf('</head>'));
  });

  it('escapes hostile profile text', () => {
    const html = injectMeta(INDEX, {
      ...meta,
      title: '"><script>alert(1)</script>',
      description: "<img src=x onerror='alert(1)'>",
    });
    expect(html).not.toContain('<script>alert');
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html.match(/<title>/g)).toHaveLength(1);
  });
});

describe('defaultMeta', () => {
  it('describes Lanyards itself, with the default image', () => {
    expect(defaultMeta('https://next.lanyards.app')).toEqual({
      title: 'Lanyards',
      description: 'Your conference lanyard on the AT Protocol',
      canonical: 'https://next.lanyards.app/',
      image: 'https://next.lanyards.app/og/default.png',
      imageAlt: 'Lanyards',
      type: 'website',
    });
  });
});
