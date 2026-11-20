import type { ReactNode } from 'react';

import {
  ARROW,
  BLADE,
  GLYPHS,
  INK,
  PIXEL_CELL,
  PIXEL_SHADOW,
  PIXELS,
  VIEW,
} from './CoverPattern.constants';
import type { PatternProps } from './CoverPattern.types';

const GROUND = 'var(--cover-ground)';
const MARK = 'var(--cover-mark)';
const PARTNER = 'var(--cover-partner)';

/** A tile repeated across the whole cover, at its own size. */
function Tiled({
  id,
  width,
  height,
  transform,
  children,
}: {
  id: string;
  width: number;
  height: number;
  transform?: string;
  children: ReactNode;
}) {
  return (
    <>
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternTransform={transform}
        >
          {children}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={GROUND} />
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </>
  );
}

/**
 * A drawing in the wide view, scaled to fill the cover. A narrower cover
 * crops it: by default to its middle, or to its right edge (`end`).
 */
function Composed({
  children,
  align = 'middle',
}: {
  children: ReactNode;
  align?: 'middle' | 'end';
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      preserveAspectRatio={`${align === 'end' ? 'xMax' : 'xMid'}YMid slice`}
      width="100%"
      height="100%"
    >
      {children}
    </svg>
  );
}

function Dots({ id }: PatternProps) {
  return (
    <Tiled id={id} width={24} height={24}>
      <circle cx={12} cy={12} r={7} fill={MARK} />
    </Tiled>
  );
}

function Stripes({ id }: PatternProps) {
  return (
    <Tiled id={id} width={40} height={40} transform="rotate(45)">
      <rect width={20} height={40} fill={MARK} />
    </Tiled>
  );
}

function Pixels({ id }: PatternProps) {
  const at = (cell: number, offset = 0) => cell * PIXEL_CELL + offset;
  return (
    <Tiled id={id} width={PIXEL_CELL * 12} height={PIXEL_CELL * 6}>
      {PIXELS.map(([x, y]) => (
        <rect
          key={`shadow-${x}-${y}`}
          x={at(x, PIXEL_SHADOW)}
          y={at(y, PIXEL_SHADOW)}
          width={PIXEL_CELL}
          height={PIXEL_CELL}
          fill={PARTNER}
        />
      ))}
      {PIXELS.map(([x, y]) => (
        <rect
          key={`pixel-${x}-${y}`}
          x={at(x)}
          y={at(y)}
          width={PIXEL_CELL}
          height={PIXEL_CELL}
          fill={MARK}
        />
      ))}
    </Tiled>
  );
}

function Arrows({ id }: PatternProps) {
  return (
    <Tiled id={id} width={64} height={64}>
      <path d={ARROW} transform="rotate(-45 32 32)" fill={MARK} />
    </Tiled>
  );
}

function Orb({ id }: PatternProps) {
  return (
    <Composed>
      <defs>
        <pattern
          id={id}
          width={18}
          height={18}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-45)"
        >
          <rect width={8} height={18} fill={MARK} />
        </pattern>
      </defs>
      <rect width={VIEW.width} height={VIEW.height} fill={GROUND} />
      <circle cx={880} cy={60} r={204} fill={`url(#${id})`} />
      <circle
        cx={520}
        cy={190}
        r={90}
        fill="none"
        stroke={PARTNER}
        strokeWidth={4}
      />
      <circle cx={170} cy={86} r={48} fill={PARTNER} />
    </Composed>
  );
}

function Symbols(_props: PatternProps) {
  return (
    <Composed>
      <rect width={VIEW.width} height={VIEW.height} fill={GROUND} />
      {GLYPHS.map(({ glyph, x, y, partner }) => (
        <text
          key={glyph}
          x={x}
          y={y}
          fontSize={250}
          fontWeight={800}
          fill={partner ? PARTNER : MARK}
        >
          {glyph}
        </text>
      ))}
    </Composed>
  );
}

function Hazard(_props: PatternProps) {
  return (
    <Composed>
      <rect width={VIEW.width} height={VIEW.height} fill="var(--accent)" />
      <polygon
        points="696,0 1200,0 1200,240 584,240"
        fill="#ffffff"
        fillOpacity={0.45}
      />
      <g transform="translate(860 120) scale(1.15)">
        <circle r={92} fill="var(--accent)" stroke={INK} strokeWidth={13} />
        {[0, 120, 240].map((angle) => (
          <path
            key={angle}
            d={BLADE}
            transform={`rotate(${angle})`}
            fill={INK}
          />
        ))}
        <circle r={12} fill={INK} />
      </g>
    </Composed>
  );
}

function Monogram({ initials }: PatternProps) {
  return (
    <Composed align="end">
      <rect width={VIEW.width} height={VIEW.height} fill={GROUND} />
      <text
        x={1210}
        y={330}
        textAnchor="end"
        fontSize={380}
        fontWeight={800}
        letterSpacing={-20}
        fill="none"
        stroke={PARTNER}
        strokeWidth={3}
      >
        {initials}
      </text>
      <text
        x={1180}
        y={300}
        textAnchor="end"
        fontSize={380}
        fontWeight={800}
        letterSpacing={-20}
        fill={MARK}
      >
        {initials}
      </text>
    </Composed>
  );
}

export const PATTERNS = {
  dots: Dots,
  stripes: Stripes,
  pixels: Pixels,
  orb: Orb,
  symbols: Symbols,
  hazard: Hazard,
  arrows: Arrows,
  monogram: Monogram,
} as const;
