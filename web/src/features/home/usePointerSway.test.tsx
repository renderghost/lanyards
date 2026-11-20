import { fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MAX_ANGLE } from './sway';
import { SWAY_MEDIA, usePointerSway } from './usePointerSway';

function Lanyard() {
  const area = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  usePointerSway(area, badge);
  return (
    <div ref={area} data-testid="lanyard">
      <div ref={badge} data-testid="badge" />
    </div>
  );
}

let matches = true;
let onChange: (() => void) | undefined;

beforeEach(() => {
  matches = true;
  onChange = undefined;
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return query === SWAY_MEDIA && matches;
        },
        media: query,
        addEventListener: (_type: string, listener: () => void) => {
          onChange = listener;
        },
        removeEventListener: (_type: string, listener: () => void) => {
          if (onChange === listener) onChange = undefined;
        },
      }) as unknown as MediaQueryList
  );
  vi.useFakeTimers({
    toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Moves the pointer across the lanyard, a frame at a time. */
function sweep(pointerType: string, from: number, to: number, frames = 10) {
  const lanyard = screen.getByTestId('lanyard');
  for (let frame = 0; frame <= frames; frame += 1) {
    const clientX = from + ((to - from) * frame) / frames;
    fireEvent.pointerMove(lanyard, { pointerType, clientX, clientY: 100 });
    vi.advanceTimersByTime(16);
  }
}

/** The badge's drawn angle, in degrees; 0 when it has no transform. */
function angle() {
  const transform = screen.getByTestId('badge').style.transform;
  if (!transform) return 0;
  const match = /^rotate\((-?[\d.]+)deg\)$/.exec(transform);
  expect(match).not.toBeNull();
  return Number(match?.[1]);
}

describe('usePointerSway', () => {
  it('sways the badge the way a mouse moves across it', () => {
    render(<Lanyard />);
    sweep('mouse', 100, 500);
    vi.advanceTimersByTime(150);
    // Moving right swings the bottom right: an anticlockwise turn.
    expect(angle()).toBeLessThan(-0.2);
    expect(Math.abs(angle())).toBeLessThan(MAX_ANGLE);
  });

  it('comes to rest, straightens and stops animating', () => {
    render(<Lanyard />);
    sweep('mouse', 500, 100);
    expect(angle()).toBeGreaterThan(0);
    vi.advanceTimersByTime(8000);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves the badge alone for touch and pen', () => {
    render(<Lanyard />);
    sweep('touch', 100, 500);
    sweep('pen', 100, 500);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('leaves it alone with reduced motion, or with no fine pointer', () => {
    matches = false;
    render(<Lanyard />);
    sweep('mouse', 100, 500);
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('straightens at once when reduced motion is turned on mid-swing', () => {
    render(<Lanyard />);
    sweep('mouse', 100, 500);
    expect(angle()).not.toBe(0);
    matches = false;
    onChange?.();
    expect(screen.getByTestId('badge').style.transform).toBe('');
    expect(vi.getTimerCount()).toBe(0);
    sweep('mouse', 500, 100);
    expect(screen.getByTestId('badge').style.transform).toBe('');
  });

  it('starts afresh after the pointer leaves and comes back', () => {
    render(<Lanyard />);
    const lanyard = screen.getByTestId('lanyard');
    fireEvent.pointerMove(lanyard, { pointerType: 'mouse', clientX: 100 });
    fireEvent.pointerLeave(lanyard, { pointerType: 'mouse' });
    // Back in at the far side: not a sweep across the whole badge.
    fireEvent.pointerMove(lanyard, { pointerType: 'mouse', clientX: 900 });
    vi.advanceTimersByTime(300);
    expect(Math.abs(angle())).toBeLessThan(0.05);
  });

  it('lets go when it unmounts mid-swing', () => {
    const { unmount } = render(<Lanyard />);
    sweep('mouse', 100, 500);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    expect(onChange).toBeUndefined();
  });
});
