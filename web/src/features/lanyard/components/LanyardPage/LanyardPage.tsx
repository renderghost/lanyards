import { useLingui } from '@lingui/react/macro';
import { useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';

import { DEFAULT_ACCENT } from '@/design/accents';
import { useSession } from '@/features/auth/session/useSession';
import { useApplyAccent } from '@/hooks/useApplyAccent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { track } from '@/lib/analytics/analytics';
import { usePersonView } from '@/lib/person/usePersonView';
import { useSharedContext } from '@/lib/person/useSharedContext';
import { cn } from '@/lib/utils';

import { BadgeHero } from '../BadgeHero/BadgeHero';
import { LanyardNotice } from '../LanyardNotice/LanyardNotice';
import { LanyardProblem } from '../LanyardProblem/LanyardProblem';
import { LanyardSkeleton } from '../LanyardSkeleton/LanyardSkeleton';
import { SharedContextStrip } from '../SharedContextStrip/SharedContextStrip';
import { NO_UNAUTHENTICATED } from './LanyardPage.constants';
import * as styles from './LanyardPage.styles';
import type { LanyardPageProps } from './LanyardPage.types';

/** Someone's public lanyard: badge, shared context and blocks. */
export function LanyardPage({ did, handle, className }: LanyardPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const location = useLocation();
  const view = usePersonView(did);
  const shared = useSharedContext(did);
  const signedOut = session.status !== 'signedIn';
  const viewer = signedOut ? 'signedOut' : view.mode;
  const hasHero = Boolean(view.hero);

  useApplyAccent(view.configReady ? view.config.accent : DEFAULT_ACCENT);
  useDocumentTitle(view.hero?.displayName ?? t`Lanyard`);

  useEffect(() => {
    if (hasHero) track('lanyard_viewed', { viewer });
  }, [did, viewer, hasHero]);

  if (view.profile.status === 'error') {
    return (
      <LanyardProblem
        error={view.profile.error}
        handle={handle}
        onRetry={() => view.retry('bluesky')}
      />
    );
  }

  if (view.profile.status === 'loading' || !view.hero) {
    return <LanyardSkeleton className={className} />;
  }

  if (signedOut && view.profile.value.labels.includes(NO_UNAUTHENTICATED)) {
    const returnTo = encodeURIComponent(location.pathname);
    return (
      <LanyardNotice heading={t`Sign in to see this lanyard`}>
        <p className={styles.text}>
          {t`This person has chosen to show their lanyard only to people who are signed in.`}
        </p>
        <a href={`/?returnTo=${returnTo}`} className={styles.link}>
          {t`Sign in`}
        </a>
      </LanyardNotice>
    );
  }

  if (shared.relationship?.blocked) {
    return <LanyardNotice heading={t`This lanyard isn't available to you.`} />;
  }

  return (
    <article className={cn(styles.page, className)}>
      <BadgeHero hero={view.hero} />
      <SharedContextStrip
        mutual={shared.mutual}
        knownFollowers={shared.knownFollowers}
      />
    </article>
  );
}
