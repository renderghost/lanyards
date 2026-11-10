import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSession } from '@/features/auth/session/useSession';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

import { AccountCard } from '../AccountCard/AccountCard';
import { SIGN_IN_PATH } from './SettingsPage.constants';
import * as styles from './SettingsPage.styles';
import type { SettingsPageProps } from './SettingsPage.types';

export function SettingsPage({ className }: SettingsPageProps) {
  const { t } = useLingui();
  const router = useRouter();
  const session = useSession();
  const signedOut = session.status === 'signedOut';
  useDocumentTitle(t`Your account`);

  useEffect(() => {
    if (signedOut) router.history.replace(SIGN_IN_PATH);
  }, [signedOut, router]);

  if (session.status !== 'signedIn') {
    return (
      <p role="status" className={styles.loading}>
        {t`Loading…`}
      </p>
    );
  }

  return (
    <section className={cn(styles.page, className)}>
      <h1 className={styles.heading}>{t`Your account`}</h1>
      <AccountCard />
    </section>
  );
}
