import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { IdCard, QrCode, SlidersHorizontal } from 'lucide-react';

import { useSession } from '@/features/auth/session/useSession';
import { useOwnPaths } from '@/hooks/useOwnPaths';
import { OWN_PAGE_ACTIVE } from '@/lib/person/ownPaths';
import { useProfile } from '@/lib/atproto/useProfile';
import { cn } from '@/lib/utils';

import * as styles from './MobileNav.styles';
import type { MobileNavProps } from './MobileNav.types';

/**
 * On phones, signed in (#150): Customise, View, Share and Account at the
 * foot of every page. Share comes first in weight: wide and filled.
 */
export function MobileNav({ className }: MobileNavProps) {
  const { t } = useLingui();
  const session = useSession();
  const did = session.status === 'signedIn' ? session.session.did : undefined;
  const profile = useProfile(did);
  const own = useOwnPaths();
  if (!own) return null;

  const byDid = own.id.startsWith('did:');

  return (
    <nav
      aria-label={t`Your Lanyards`}
      // Keeps focused controls scrolled clear of it (see index.css).
      data-bottom-toolbar=""
      className={cn(styles.bar, className)}
    >
      <Link
        to="/$handle/edit"
        params={{ handle: own.id }}
        activeOptions={OWN_PAGE_ACTIVE}
        className={styles.tab}
      >
        <SlidersHorizontal aria-hidden="true" className={styles.icon} />
        {t`Customise`}
      </Link>
      {byDid ? (
        <Link
          to="/d/$did"
          params={{ did: own.id }}
          activeOptions={OWN_PAGE_ACTIVE}
          className={styles.tab}
        >
          <IdCard aria-hidden="true" className={styles.icon} />
          {t`View`}
        </Link>
      ) : (
        <Link
          to="/$handle"
          params={{ handle: own.id }}
          activeOptions={OWN_PAGE_ACTIVE}
          className={styles.tab}
        >
          <IdCard aria-hidden="true" className={styles.icon} />
          {t`View`}
        </Link>
      )}
      <Link
        to="/$handle/share"
        params={{ handle: own.id }}
        className={styles.showQr}
      >
        <QrCode aria-hidden="true" className={styles.icon} />
        {t`Share`}
      </Link>
      <Link
        to="/settings"
        aria-label={t`Your account`}
        activeOptions={OWN_PAGE_ACTIVE}
        className={styles.tab}
      >
        {profile.data?.avatar ? (
          <img src={profile.data.avatar} alt="" className={styles.avatar} />
        ) : (
          <span aria-hidden="true" className={styles.avatar} />
        )}
        {t`Account`}
      </Link>
    </nav>
  );
}
