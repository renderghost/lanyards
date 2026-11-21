import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { Logo } from '@/components/Logo/Logo';
import { SignInForm } from '@/features/auth/components/SignInForm/SignInForm';
import { useSession } from '@/features/auth/session/useSession';

import { COVER } from './SignInFace.constants';
import * as styles from './SignInFace.styles';
import type { SignInFaceProps } from './SignInFace.types';

/**
 * The back of the homepage badge (#175): the sign-in form, with its handle
 * typeahead (#157), on the same badge as the welcome on its front.
 */
export function SignInFace({ returnTo }: SignInFaceProps) {
  const { t } = useLingui();
  const session = useSession();
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={styles.badge}>
      <div className={styles.cover}>
        <CoverPattern pattern={COVER} initials="L" />
      </div>
      <div className={styles.field}>
        <div className={styles.intro}>
          <div className={styles.logoBox}>
            <Logo fixed="blue" className={styles.logo} />
          </div>
          <h1 id={headingId} className={styles.heading}>
            {t`Sign in`}
          </h1>
          <p className={styles.lede}>
            {t`Use your handle from Bluesky or any other AT Protocol app. New here? Create an account, and it’s yours to take anywhere.`}
          </p>
        </div>
        <div className={styles.aside}>
          {session.status === 'signedOut' ? (
            <SignInForm returnTo={returnTo} className={styles.form} />
          ) : (
            <p role="status" className={styles.loading}>
              {t`Loading…`}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
