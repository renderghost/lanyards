import { screen } from '@testing-library/react';
import jsQR from 'jsqr';
import { type Bitmap2D, correction, generate } from 'lean-qr';
import { toSvgPath } from 'lean-qr/extras/svg';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { QrCode } from './QrCode';
import { CENTRE_SHARE } from './QrCode.constants';

const URL = 'https://lanyards.app/d/did:plc:fixturealiceaaaaaaaaaaaa';

/**
 * Paints the module matrix, with a 4-module quiet zone, and scans it.
 * `covered` blanks a centred disc that share of the width wide, as a
 * picture over the code's centre does.
 */
function scan(code: Bitmap2D, covered = 0): string | undefined {
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
  const radius = (side * covered) / 2;
  for (let py = 0; py < side; py += 1) {
    for (let px = 0; px < side; px += 1) {
      if (Math.hypot(px - side / 2, py - side / 2) > radius) continue;
      pixels.fill(255, (py * side + px) * 4, (py * side + px) * 4 + 3);
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

  // The Share badge puts the person's avatar over the centre (#169).
  it('takes a centre picture at level H, and still scans with it covering', () => {
    renderWithProviders(
      <QrCode value={URL} centre={<span data-testid="face" />} />
    );
    const code = generate(URL, {
      minCorrectionLevel: correction.H,
      maxCorrectionLevel: correction.H,
    });
    const svg = screen.getByRole('img', { name: `QR code for ${URL}` });
    expect(svg.getAttribute('viewBox')).toBe(
      `-4 -4 ${code.size + 8} ${code.size + 8}`
    );
    expect(svg.querySelector('path')?.getAttribute('d')).toBe(toSvgPath(code));
    expect(CENTRE_SHARE).toBeGreaterThanOrEqual(0.2);
    expect(scan(code, CENTRE_SHARE)).toBe(URL);
    // The picture is decoration: the code's label says what it is.
    const face = screen.getByTestId('face');
    expect(face.closest('[aria-hidden="true"]')).not.toBeNull();
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
