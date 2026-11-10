import { screen } from '@testing-library/react';
import jsQR from 'jsqr';
import { type Bitmap2D, correction, generate } from 'lean-qr';
import { toSvgPath } from 'lean-qr/extras/svg';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { QrCode } from './QrCode';

const URL = 'https://next.lanyards.app/d/did:plc:fixturealiceaaaaaaaaaaaa';

/** Paints the module matrix, with a 4-module quiet zone, and scans it. */
function scan(code: Bitmap2D): string | undefined {
  const scale = 4;
  const side = (code.size + 8) * scale;
  const pixels = new Uint8ClampedArray(side * side * 4).fill(255);
  for (let y = 0; y < code.size; y += 1) {
    for (let x = 0; x < code.size; x += 1) {
      if (!code.get(x, y)) continue;
      for (let dy = 0; dy < scale; dy += 1) {
        for (let dx = 0; dx < scale; dx += 1) {
          const px = (x + 4) * scale + dx;
          const py = (y + 4) * scale + dy;
          const at = (py * side + px) * 4;
          pixels[at] = 0;
          pixels[at + 1] = 0;
          pixels[at + 2] = 0;
        }
      }
    }
  }
  return jsQR(pixels, side, side)?.data;
}

const levelM = () =>
  generate(URL, {
    minCorrectionLevel: correction.M,
    maxCorrectionLevel: correction.M,
  });

describe('QrCode', () => {
  it('draws the level-M code for the URL, which scans back to it', () => {
    renderWithProviders(<QrCode value={URL} />);
    const code = levelM();
    expect(scan(code)).toBe(URL);
    const svg = screen.getByRole('img', { name: `QR code for ${URL}` });
    expect(svg.getAttribute('viewBox')).toBe(
      `-4 -4 ${code.size + 8} ${code.size + 8}`
    );
    expect(svg.querySelector('path')?.getAttribute('d')).toBe(toSvgPath(code));
  });

  it('is black on white in every colour scheme, for scanners', () => {
    renderWithProviders(<QrCode value={URL} />);
    const svg = screen.getByRole('img');
    expect(svg.querySelector('rect')?.getAttribute('fill')).toBe('#ffffff');
    expect(svg.querySelector('path')?.getAttribute('fill')).toBe('#000000');
    expect(svg.outerHTML).not.toMatch(/currentColor|dark:/);
  });

  it('is made on the device, without any network request', () => {
    const fetching = vi.spyOn(globalThis, 'fetch');
    renderWithProviders(<QrCode value={URL} />);
    expect(fetching).not.toHaveBeenCalled();
    fetching.mockRestore();
  });
});
