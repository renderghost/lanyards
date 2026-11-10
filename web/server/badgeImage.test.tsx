// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { renderBadgePng } from './badgeImage.tsx';

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
