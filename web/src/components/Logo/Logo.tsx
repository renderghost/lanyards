import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { LOGO_DARK_SRC, LOGO_LIGHT_SRC, LOGO_SIZE_PX } from './Logo.constants';
import * as styles from './Logo.styles';
import type { LogoProps } from './Logo.types';

export function Logo({ className }: LogoProps) {
  const { t } = useLingui();
  return (
    <picture>
      <source srcSet={LOGO_DARK_SRC} media="(prefers-color-scheme: dark)" />
      <img
        src={LOGO_LIGHT_SRC}
        alt={t`Lanyards`}
        width={LOGO_SIZE_PX}
        height={LOGO_SIZE_PX}
        className={cn(styles.image, className)}
      />
    </picture>
  );
}
