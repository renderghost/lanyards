import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LanyardRibbon } from './LanyardRibbon';

describe('LanyardRibbon (#169)', () => {
  it('prints the handle along both straps, as conference lanyards do', () => {
    const { container } = render(<LanyardRibbon text="@alice.test" />);
    const paths = container.querySelectorAll('textPath');
    expect(paths).toHaveLength(2);
    for (const path of paths) {
      expect(path.textContent).toContain('@alice.test');
      // Repeated, so the strap is printed all the way up.
      expect(path.textContent?.split('@alice.test').length).toBeGreaterThan(6);
      // Each strap's text follows its own band.
      const href = path.getAttribute('href') ?? '';
      expect(container.querySelector(href)?.tagName).toBe('path');
    }
  });

  it('is decoration: hidden from assistive technology', () => {
    const { container } = render(<LanyardRibbon text="@alice.test" />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps two ribbons on one page apart', () => {
    const { container } = render(
      <>
        <LanyardRibbon text="@a.test" />
        <LanyardRibbon text="@b.test" />
      </>
    );
    const ids = [...container.querySelectorAll('path[id]')].map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('wears the ink strap by default, as on the brand blue (#169)', () => {
    const { container } = render(<LanyardRibbon text="@alice.test" />);
    const straps = container.querySelectorAll('path[id]');
    for (const strap of straps) {
      expect(strap.getAttribute('class')).toContain('stroke-qr-strap');
    }
    expect(container.querySelector('[data-edge]')).toBeNull();
  });

  it('wears the accent, edged, on a page that may be light or dark (#173)', () => {
    const { container } = render(
      <LanyardRibbon text="@alice.test" tone="accent" />
    );
    const straps = container.querySelectorAll('path[id]');
    for (const strap of straps) {
      expect(strap.getAttribute('class')).toContain('stroke-accent');
    }
    for (const print of container.querySelectorAll('text')) {
      expect(print.getAttribute('class')).toContain('fill-on-accent');
    }
    // A hairline under each strap, so a pale accent reads on white.
    expect(container.querySelectorAll('[data-edge]')).toHaveLength(2);
  });
});
