// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { badgeText, renderBadgePng, withoutEmoji } from './badgeImage.ts';

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

describe('withoutEmoji', () => {
  // DM Sans has no emoji, so the badge would draw them as empty boxes.
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
