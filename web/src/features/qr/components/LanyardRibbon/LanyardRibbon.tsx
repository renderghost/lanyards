import { useId } from 'react';

import { cn } from '@/lib/utils';

import {
  EDGE,
  METAL,
  REPEATS,
  SEPARATOR,
  STRAPS,
  VIEW,
} from './LanyardRibbon.constants';
import * as styles from './LanyardRibbon.styles';
import type { LanyardRibbonProps } from './LanyardRibbon.types';

const SIDES = ['left', 'right'] as const;

/**
 * A lanyard (#169): two straps printed with `text`, meeting at a sewn tab
 * above a swivel ring and a clasp. The clasp's hook ends at the bottom
 * edge, to go through the slot of the badge below.
 */
export function LanyardRibbon({
  text,
  tone = 'ink',
  className,
}: LanyardRibbonProps) {
  const id = useId();
  const colours = styles.tones[tone];
  const printed = text
    ? Array.from({ length: REPEATS }, () => text).join(SEPARATOR)
    : '';

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      className={cn(styles.ribbon, className)}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" x2="1">
          {METAL.map((colour, index) => (
            <stop
              key={colour}
              offset={index / (METAL.length - 1)}
              stopColor={colour}
            />
          ))}
        </linearGradient>
      </defs>
      {colours.edge &&
        SIDES.map((side) => (
          <path
            key={side}
            data-edge
            d={STRAPS[side]}
            strokeWidth={STRAPS.width + EDGE * 2}
            className={colours.edge}
          />
        ))}
      {SIDES.map((side) => (
        <g key={side}>
          <path
            id={`${id}-${side}`}
            d={STRAPS[side]}
            strokeWidth={STRAPS.width}
            className={colours.strap}
          />
          <text
            dominantBaseline="central"
            className={cn(styles.print, colours.print)}
          >
            <textPath href={`#${id}-${side}`}>{printed}</textPath>
          </text>
        </g>
      ))}
      <rect
        x="126"
        y="140"
        width="68"
        height="26"
        rx="2"
        strokeWidth={colours.edge ? EDGE : 0}
        className={colours.tab}
      />
      <path
        d="M131 148 H189"
        strokeWidth="1"
        strokeDasharray="3 2"
        className={colours.stitch}
      />
      <circle
        cx="160"
        cy="176"
        r="7.5"
        fill="none"
        stroke={`url(#${id}-metal)`}
        strokeWidth="3.5"
      />
      <rect
        x="154"
        y="182"
        width="12"
        height="9"
        rx="2"
        fill={`url(#${id}-metal)`}
      />
      <path
        d="M152 191 h16 v10 a8 8 0 0 1 -16 0 z"
        fill={`url(#${id}-metal)`}
      />
      <path d="M157 196 h6 v5 a3 3 0 0 1 -6 0 z" className={colours.gap} />
    </svg>
  );
}
