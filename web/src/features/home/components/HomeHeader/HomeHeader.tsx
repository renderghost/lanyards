import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';

import { Logo } from '@/components/Logo/Logo';
import { useSession } from '@/features/auth/session/useSession';
import { cn } from '@/lib/utils';

import * as styles from './HomeHeader.styles';
import type { HomeHeaderProps } from './HomeHeader.types';

/**
 * The header of the brand's own pages (#151): the logo and Sign in,
 * straight on the brand blue. They're only for people who aren't signed
 * in, so Sign in is all it offers; account creation is on the sign-in
 * page (#157).
 */
export function HomeHeader({ signIn = true, className }: HomeHeaderProps) {
  const { t } = useLingui();
  const session = useSession();

  return (
    <header className={cn(styles.header, className)}>
      <Link to="/" className={styles.homeLink}>
        <Logo fixed="lime" />
      </Link>
      {signIn && session.status === 'signedOut' && (
        <Link to="/sign-in" className={styles.signIn}>
          {t`Sign in`}
        </Link>
      )}
    </header>
  );
}
