import { useLingui } from '@lingui/react/macro';
import { useRouter } from '@tanstack/react-router';

import { Button } from '@/components/Button/Button';
import { useSession } from '@/features/auth/session/useSession';
import { useProfile } from '@/lib/atproto/useProfile';
import { cn } from '@/lib/utils';

import * as styles from './AccountCard.styles';
import type { AccountCardProps } from './AccountCard.types';

export function AccountCard({ className }: AccountCardProps) {
  const { t } = useLingui();
  const session = useSession();
  const router = useRouter();
  const did = session.status === 'signedIn' ? session.session.did : undefined;
  const profile = useProfile(did);

  return (
    <section className={cn(styles.card, className)}>
      {profile.data ? (
        <div className={styles.identity}>
          {profile.data.avatar ? (
            <img src={profile.data.avatar} alt="" className={styles.avatar} />
          ) : (
            <span className={styles.avatar} aria-hidden="true" />
          )}
          <div className={styles.names}>
            <p className={styles.displayName}>
              {profile.data.displayName ?? profile.data.handle}
            </p>
            {profile.data.displayName && (
              <p className={styles.handle}>@{profile.data.handle}</p>
            )}
          </div>
        </div>
      ) : (
        <p role="status" className={styles.status}>
          {profile.isError
            ? t`We couldn't load your profile.`
            : t`Loading your profile…`}
        </p>
      )}
      <Button
        variant="secondary"
        // Signed out, the homepage (#172), not a page asking to sign in.
        onClick={() => void session.signOut(() => router.navigate({ to: '/' }))}
      >
        {t`Sign out`}
      </Button>
    </section>
  );
}
