import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { SWAY_MEDIA } from '../../usePointerSway';
import { HomeBadge } from './HomeBadge';

/** A mouse and no request for less motion, or not. */
function pointer(fine: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: fine && query === SWAY_MEDIA,
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

/** A mouse sweeping right across the badge's heading. */
function sweep(heading: HTMLElement) {
  for (let x = 100; x <= 600; x += 50) {
    fireEvent.pointerMove(heading, { pointerType: 'mouse', clientX: x });
    vi.advanceTimersByTime(16);
  }
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('HomeBadge (#151)', () => {
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
    expect(badge?.style.transform).toMatch(/^rotate\(-[\d.]+deg\)$/);
    // It turns about its clip, at the top, as the arrival swing does.
    expect(badge?.className).toMatch(/(^|\s)origin-top(\s|$)/);
    vi.advanceTimersByTime(8000);
    expect(badge?.style.transform).toBe('');
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
});
