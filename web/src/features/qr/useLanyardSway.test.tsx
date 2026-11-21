import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LanyardRibbon } from './components/LanyardRibbon/LanyardRibbon';
import { MAX_ANGLE, MAX_SHIFT } from './lanyardPhysics';
import { ARRIVAL_MEDIA, SWAY_MEDIA, useLanyardSway } from './useLanyardSway';

function Lanyard({
  enabled = true,
  arrive = false,
  hidden = false,
}: {
  enabled?: boolean;
  arrive?: boolean;
  /** Not drawn yet: as a dialog's content, a render after it opens. */
  hidden?: boolean;
}) {
  const [area, setArea] = useState<HTMLDivElement | null>(null);
  const [sleeve, setSleeve] = useState<HTMLDivElement | null>(null);
  const [ribbon, setRibbon] = useState<SVGSVGElement | null>(null);
  useLanyardSway({ area, sleeve, ribbon, enabled, arrive });
  if (hidden) return null;
  return (
    <div ref={setArea} data-testid="lanyard">
      <LanyardRibbon ref={setRibbon} text="@alice.test" />
      <div ref={setSleeve} data-testid="badge" />
    </div>
  );
}

/** Which media queries match: a mouse, motion, a wide window. */
let media: Record<string, boolean> = {};
const listeners = new Set<() => void>();

beforeEach(() => {
  media = { [SWAY_MEDIA]: true, [ARRIVAL_MEDIA]: true };
  listeners.clear();
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return media[query] ?? false;
        },
        media: query,
        addEventListener: (_type: string, listener: () => void) => {
          listeners.add(listener);
        },
        removeEventListener: (_type: string, listener: () => void) => {
          listeners.delete(listener);
        },
      }) as unknown as MediaQueryList
  );
  // jsdom lays nothing out: give the sleeve the Share badge's size.
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(350);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(560);
  vi.useFakeTimers({
    toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const changeMedia = (query: string, matches: boolean) => {
  media[query] = matches;
  for (const listener of [...listeners]) listener();
};

/** Moves the pointer across the lanyard, a frame at a time. */
function sweep(
  pointerType: string,
  from: number,
  to: number,
  { frames = 10, clientY = 300 } = {}
) {
  const lanyard = screen.getByTestId('lanyard');
  for (let frame = 0; frame <= frames; frame += 1) {
    const clientX = from + ((to - from) * frame) / frames;
    fireEvent.pointerMove(lanyard, { pointerType, clientX, clientY });
    vi.advanceTimersByTime(16);
  }
}

const TRANSFORM = /^translateX\((-?[\d.]+)px\) rotate\((-?[\d.]+)deg\)$/;

/** The badge as drawn: its shift in px and its CSS turn in degrees. */
function badge() {
  const transform = screen.getByTestId('badge').style.transform;
  if (!transform) return { shift: 0, turn: 0 };
  const match = TRANSFORM.exec(transform);
  expect(match).not.toBeNull();
  return { shift: Number(match?.[1]), turn: Number(match?.[2]) };
}

const tab = () => document.querySelector('[data-tab]');

describe('useLanyardSway (#174)', () => {
  it('swings the badge, and its lanyard, the way a mouse moves', () => {
    render(<Lanyard />);
    sweep('mouse', 100, 500);
    vi.advanceTimersByTime(60);
    // Moving right swings the foot right: an anticlockwise CSS turn.
    const { shift, turn } = badge();
    expect(turn).toBeLessThan(-0.2);
    expect(Math.abs(turn)).toBeLessThan(MAX_ANGLE);
    // The tab, and the badge's clasp with it, follow a little, and the
    // straps' feet with them. jsdom draws nothing: a px is a unit.
    expect(shift).toBeGreaterThan(0);
    expect(shift).toBeLessThan(MAX_SHIFT);
    const moved = /^translate\(([\d.]+) 0\)$/.exec(
      tab()?.getAttribute('transform') ?? ''
    );
    expect(Number(moved?.[1])).toBeCloseTo(shift, 1);
    const left = document.querySelector('path[data-strap="left"]');
    expect(left?.getAttribute('d')).toMatch(/^M-130 -410 L15\d/);
  });

  it('sways a lanyard drawn a render after it starts, as in a dialog', () => {
    const { rerender } = render(<Lanyard hidden />);
    rerender(<Lanyard />);
    sweep('mouse', 100, 500);
    vi.advanceTimersByTime(60);
    expect(badge().turn).toBeLessThan(-0.2);
  });

  it('comes to rest, straightens and stops animating', () => {
    render(<Lanyard />);
    sweep('mouse', 500, 100);
    expect(badge().turn).toBeGreaterThan(0);
    vi.advanceTimersByTime(8000);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(tab()?.hasAttribute('transform')).toBe(false);
    expect(
      document.querySelector('path[data-strap="left"]')?.getAttribute('d')
    ).toBe('M-130 -410 L150 150');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves it alone for touch and pen', () => {
    render(<Lanyard />);
    sweep('touch', 100, 500);
    sweep('pen', 100, 500);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves it alone with reduced motion, or with no fine pointer', () => {
    media[SWAY_MEDIA] = false;
    render(<Lanyard />);
    sweep('mouse', 100, 500);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('straightens at once when reduced motion is turned on mid-swing', () => {
    render(<Lanyard />);
    sweep('mouse', 100, 500);
    expect(badge().turn).not.toBe(0);
    changeMedia(SWAY_MEDIA, false);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(tab()?.hasAttribute('transform')).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    sweep('mouse', 500, 100);
    expect(screen.getByTestId('badge').style.transform).toBe('');
  });

  it('starts afresh after the pointer leaves and comes back', () => {
    render(<Lanyard />);
    const lanyard = screen.getByTestId('lanyard');
    fireEvent.pointerMove(lanyard, {
      pointerType: 'mouse',
      clientX: 100,
      clientY: 300,
    });
    fireEvent.pointerLeave(lanyard, { pointerType: 'mouse' });
    // Back in at the far side: not a sweep across the whole badge.
    fireEvent.pointerMove(lanyard, {
      pointerType: 'mouse',
      clientX: 900,
      clientY: 300,
    });
    vi.advanceTimersByTime(300);
    expect(Math.abs(badge().turn)).toBeLessThan(0.05);
  });

  it('stays straight and still while turned off, as for a form', () => {
    const { rerender } = render(<Lanyard />);
    sweep('mouse', 100, 500);
    expect(badge().turn).not.toBe(0);
    rerender(<Lanyard enabled={false} />);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
    sweep('mouse', 500, 100);
    expect(screen.getByTestId('badge').style.transform).toBe('');
  });

  it('swings in as it arrives, then settles, on a wide screen', () => {
    render(<Lanyard arrive />);
    vi.advanceTimersByTime(100);
    expect(Math.abs(badge().turn)).toBeGreaterThan(1);
    vi.advanceTimersByTime(8000);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('arrives still with reduced motion, or on a phone', () => {
    media[ARRIVAL_MEDIA] = false;
    render(<Lanyard arrive />);
    vi.advanceTimersByTime(100);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('does nothing where the sleeve has no box of its own', () => {
    // The Share screen, sideways: the screen itself is the badge.
    render(<Lanyard arrive />);
    screen.getByTestId('badge').style.display = 'contents';
    sweep('mouse', 100, 500);
    vi.advanceTimersByTime(8000);
    sweep('mouse', 500, 100);
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByTestId('badge').style.transform).toBe('');
  });

  it('lets go when it unmounts mid-swing', () => {
    const { unmount } = render(<Lanyard />);
    sweep('mouse', 100, 500);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(listeners.size).toBe(0);
  });
});
