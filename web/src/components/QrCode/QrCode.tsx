import { useLingui } from '@lingui/react/macro';
import { correction, generate } from 'lean-qr';
import { toSvgPath } from 'lean-qr/extras/svg';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import { DARK, LIGHT, QUIET_ZONE } from './QrCode.constants';
import * as styles from './QrCode.styles';
import type { QrCodeProps } from './QrCode.types';

/**
 * A QR code drawn on the device as SVG, black on white with a full quiet
 * zone in every colour scheme (spec §7.6). Error correction is level M, or
 * level H under a centre picture, so the code still scans (#169).
 */
export function QrCode({ value, centre, className }: QrCodeProps) {
  const { t } = useLingui();
  const level = centre ? correction.H : correction.M;
  const code = useMemo(
    () =>
      generate(value, { minCorrectionLevel: level, maxCorrectionLevel: level }),
    [value, level]
  );
  const side = code.size + QUIET_ZONE * 2;

  const svg = (
    <svg
      role="img"
      aria-label={t`QR code for ${value}`}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${side} ${side}`}
      shapeRendering="crispEdges"
      className={cn(styles.svg, className)}
    >
      <rect
        x={-QUIET_ZONE}
        y={-QUIET_ZONE}
        width={side}
        height={side}
        fill={LIGHT}
      />
      <path d={toSvgPath(code)} fill={DARK} />
    </svg>
  );
  if (!centre) return svg;
  return (
    <div className={styles.frame}>
      {svg}
      <div aria-hidden="true" className={styles.centre}>
        {centre}
      </div>
    </div>
  );
}
