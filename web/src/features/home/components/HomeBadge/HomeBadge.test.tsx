import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { ARRIVAL_MEDIA, SWAY_MEDIA } from '@/features/qr/useLanyardSway';

import { HomeBadge } from './HomeBadge';

/** A mouse and no request for less motion, or not; a wide screen, or not. */
function pointer(fine: boolean, wide = false) {
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(930);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(760);
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches:
          (fine && query === SWAY_MEDIA) || (wide && query === ARRIVAL_MEDIA),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }) as unknown as MediaQueryList
  );
}

/** The element that turns, around the heading: its transform. */
function turned(heading: HTMLElement) {
  let element: HTMLElement | null = heading;
  while (element && !element.style.transform) element = element.parentElement;
  return element;
}

/** A mouse sweeping right across the badge's heading, low on the badge. */
function sweep(heading: HTMLElement) {
  for (let x = 100; x <= 600; x += 50) {
    fireEvent.pointerMove(heading, {
      pointerType: 'mouse',
      clientX: x,
      clientY: 400,
    });
    vi.advanceTimersByTime(16);
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('HomeBadge (#151)', () => {
  it('hangs in a clear sleeve from a lanyard printed lanyards.app (#170)', () => {
    pointer(false);
    const { container } = renderWithProviders(
      <HomeBadge headingId="welcome" />
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.closest('[data-sleeve]')).not.toBeNull();
    const straps = container.querySelectorAll('textPath');
    expect(straps).toHaveLength(2);
    for (const strap of straps) {
      expect(strap.textContent).toContain('lanyards.app');
    }
    // The old plain straps are gone: one lanyard, not two.
    expect(container.querySelectorAll('polygon')).toHaveLength(0);
  });

  it('sways on its clip as a mouse moves across the lanyard', () => {
    pointer(true);
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    renderWithProviders(<HomeBadge headingId="welcome" />);
    const heading = screen.getByRole('heading', { level: 1 });
    sweep(heading);
    const badge = turned(heading);
    expect(badge).not.toBeNull();
    // The badge turns in its sleeve, together, on the clasp (#170, #174).
    expect(badge?.querySelector('[data-sleeve]')).not.toBeNull();
    expect(badge?.style.transform).toMatch(
      /^translateX\([\d.]+px\) rotate\(-[\d.]+deg\)$/
    );
    vi.advanceTimersByTime(8000);
    expect(badge?.style.transform).toBe('');
  });

  it('hangs straight at rest, as a real badge does (#174)', () => {
    pointer(true);
    renderWithProviders(<HomeBadge headingId="welcome" />);
    const heading = screen.getByRole('heading', { level: 1 });
    const sleeve = heading.closest<HTMLElement>('[data-sleeve]');
    expect(sleeve?.style.transform).toBe('');
    expect(sleeve?.className).not.toMatch(/rotate-|animate-swing/);
  });

  it('swings in as it arrives on a wide screen, then settles (#174)', () => {
    pointer(false, true);
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    renderWithProviders(<HomeBadge headingId="welcome" />);
    const heading = screen.getByRole('heading', { level: 1 });
    vi.advanceTimersByTime(100);
    expect(turned(heading)?.querySelector('[data-sleeve]')).not.toBeNull();
    vi.advanceTimersByTime(8000);
    expect(turned(heading)).toBeNull();
  });

  it('hangs still for touch, or with reduced motion', () => {
    pointer(false);
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    renderWithProviders(<HomeBadge headingId="welcome" />);
    const heading = screen.getByRole('heading', { level: 1 });
    sweep(heading);
    expect(turned(heading)).toBeNull();
  });

  it('has a back, out of reach until it’s turned over (#175)', () => {
    pointer(false);
    const { rerender } = renderWithProviders(
      <HomeBadge headingId="welcome" back={<h2>Sign in here</h2>} />
    );
    const front = screen.getByRole('heading', { level: 1 });
    // Turned away, it's hidden from assistive technology too.
    expect(screen.queryByRole('heading', { name: 'Sign in here' })).toBeNull();
    const back = screen.getByRole('heading', {
      name: 'Sign in here',
      hidden: true,
    });
    const turning = front.closest('[data-face]');
    expect(turning).toHaveAttribute('data-face', 'front');
    expect(front.closest('[inert]')).toBeNull();
    expect(back.closest('[inert]')).not.toBeNull();
    // Both faces in one place, so they're always the same size.
    expect(turning).toContainElement(back);

    rerender(
      <HomeBadge headingId="welcome" face="back" back={<h2>Sign in here</h2>} />
    );
    expect(turning).toHaveAttribute('data-face', 'back');
    expect(front.closest('[inert]')).not.toBeNull();
    expect(back.closest('[inert]')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Sign in here' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('stays straight and still while turned over (#175)', () => {
    pointer(true, true);
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame'],
    });
    renderWithProviders(
      <HomeBadge headingId="welcome" face="back" back={<p>Form</p>} />
    );
    const heading = screen.getByRole('heading', { level: 1, hidden: true });
    sweep(heading);
    vi.advanceTimersByTime(100);
    expect(turned(heading)).toBeNull();
  });
});
