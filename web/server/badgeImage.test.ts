// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  badgeElement,
  badgeText,
  renderBadgePng,
  withoutEmoji,
} from './badgeImage.ts';

type Node = { type: string; props: Record<string, unknown> };

/** Every element's style in the tree satori renders. */
function styles(node: unknown): Record<string, unknown>[] {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(styles);
  const { props } = node as Node;
  return [
    (props.style as Record<string, unknown>) ?? {},
    ...styles(props.children),
  ];
}

/** Width and height from a PNG's IHDR chunk. */
const size = (png: Uint8Array) => {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

describe('renderBadgePng', () => {
  it('renders a 1200×630 PNG badge for a person', async () => {
    const png = await renderBadgePng({
      displayName: 'Ada Example',
      handle: 'alice.test',
      headline: 'Research Engineer building open research tools',
    });
    expect([...png.slice(0, 4)]).toEqual(PNG_SIGNATURE);
    expect(size(png)).toEqual({ width: 1200, height: 630 });
  });

  it('renders the default Lanyards badge', async () => {
    const png = await renderBadgePng(null);
    expect([...png.slice(0, 4)]).toEqual(PNG_SIGNATURE);
    expect(size(png)).toEqual({ width: 1200, height: 630 });
  });
}, 20_000);

// The brand (#128, #129): Rethink Sans, the brand ink, 1–3 px corners.
describe('the link-preview badge, in the brand', () => {
  const person = {
    displayName: 'Ada Example',
    handle: 'alice.test',
    headline: 'Research Engineer building open research tools',
  };

  it.each([
    ['a person', person],
    ['the default badge', null],
  ])('uses Rethink Sans and the brand ink for %s', (_name, input) => {
    const all = styles(badgeElement(input));
    expect(all[0]?.fontFamily).toBe('Rethink Sans');
    const colours = all.flatMap((style) =>
      [style.color, style.background].filter(Boolean)
    );
    expect(colours).toContain('#06011E');
    expect(colours).not.toContain('#1F1638');
    expect(colours).not.toContain('#5B4E80');
  });

  it.each([
    ['with an avatar', { ...person, avatarDataUri: 'data:image/png;base64,' }],
    ['with initials', person],
    ['the default badge', null],
  ])(
    'has corners of 1 or 3 px, round only for the avatar (%s)',
    (_n, input) => {
      for (const style of styles(badgeElement(input))) {
        if (style.borderRadius === undefined) continue;
        const round =
          style.borderRadius === '50%' && style.width === style.height;
        expect(round || [1, 3].includes(style.borderRadius as number)).toBe(
          true
        );
      }
    }
  );
});

describe('withoutEmoji', () => {
  // Rethink Sans has no emoji, so the badge would draw them as empty boxes.
  it.each([
    ['Researchers 🧑‍🚀', 'Researchers'],
    [
      'Make your research 🔬\neasy to discover',
      'Make your research\neasy to discover',
    ],
    ['🇬🇧 Ada Example', 'Ada Example'],
    ['Ada 👩🏽‍🔬 Example', 'Ada Example'],
    ['I ❤️ maps and ❤ tea', 'I maps and tea'],
    ['1️⃣ First', 'First'],
  ])('removes the emoji from %j', (text, expected) => {
    expect(withoutEmoji(text)).toBe(expected);
  });

  it.each([
    'Ada Example',
    'Zoë Müller-Ørsted',
    '王小明',
    'क्‍षमा',
    'Café © Ada™ ®',
    'Line one\nLine two',
  ])('keeps %j as it is', (text) => {
    expect(withoutEmoji(text)).toBe(text);
  });
});

describe('badgeText', () => {
  it('strips emoji from the name and headline', () => {
    expect(
      badgeText({
        displayName: 'Ada 🚀',
        handle: 'alice.test',
        headline: 'Research 🔬 engineer',
      })
    ).toEqual({
      displayName: 'Ada',
      handle: 'alice.test',
      headline: 'Research engineer',
    });
  });

  it('uses the handle when the name was only emoji', () => {
    expect(
      badgeText({ displayName: '🧑‍🚀✨', handle: 'alice.test' }).displayName
    ).toBe('alice.test');
  });

  it('drops a headline that was only emoji', () => {
    expect(
      badgeText({ displayName: 'Ada', handle: 'alice.test', headline: '🔬 🧪' })
    ).toEqual({ displayName: 'Ada', handle: 'alice.test' });
  });
});
