import { useLingui } from '@lingui/react/macro';
import { correction, generate } from 'lean-qr';
import { toSvgPath } from 'lean-qr/extras/svg';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import { DARK, LIGHT, QUIET_ZONE } from './QrCode.constants';
import * as styles from './QrCode.styles';
import type { QrCodeProps } from './QrCode.types';

/**
 * A QR code drawn on the device as SVG, at error correction level M, black
 * on white with a full quiet zone in every colour scheme (spec §7.6).
 */
export function QrCode({ value, className }: QrCodeProps) {
  const { t } = useLingui();
  const code = useMemo(
    () =>
      generate(value, {
        minCorrectionLevel: correction.M,
        maxCorrectionLevel: correction.M,
      }),
    [value]
  );
  const side = code.size + QUIET_ZONE * 2;

  return (
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
}
