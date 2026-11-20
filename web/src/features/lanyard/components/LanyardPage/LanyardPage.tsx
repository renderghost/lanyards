import { useLingui } from '@lingui/react/macro';
import { useLocation } from '@tanstack/react-router';
import { type ReactNode, useDeferredValue, useEffect } from 'react';

import { Button } from '@/components/Button/Button';
import { DEFAULT_ACCENT } from '@/design/accents';
import { useSession } from '@/features/auth/session/useSession';
import { useApplyAccent } from '@/hooks/useApplyAccent';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { profileId } from '@/lib/atproto/profileId';
import { track } from '@/lib/analytics/analytics';
import { BLOCK_SOURCES } from '@/lib/person/blocks';
import { boardCells } from '@/lib/person/hero';
import { usePersonView } from '@/lib/person/usePersonView';
import { useSharedContext } from '@/lib/person/useSharedContext';
import { cn } from '@/lib/utils';

import { BadgeHero } from '../BadgeHero/BadgeHero';
import { HeroActions } from '../HeroActions/HeroActions';
import { LanyardBlocks } from '../LanyardBlocks/LanyardBlocks';
import { LanyardNotice } from '../LanyardNotice/LanyardNotice';
import { LanyardProblem } from '../LanyardProblem/LanyardProblem';
import { LanyardSkeleton } from '../LanyardSkeleton/LanyardSkeleton';
import { LanyardSurface } from '../LanyardSurface/LanyardSurface';
import { SharedContextStrip } from '../SharedContextStrip/SharedContextStrip';
import { NO_UNAUTHENTICATED } from './LanyardPage.constants';
import * as styles from './LanyardPage.styles';
import type { LanyardPageProps } from './LanyardPage.types';

/** Someone's public lanyard: badge, shared context and blocks. */
export function LanyardPage({
  did,
  handle,
  preview,
  className,
}: LanyardPageProps) {
  const { t } = useLingui();
  const session = useSession();
  const location = useLocation();
  const view = usePersonView(did, preview ? { mode: preview } : {});
  // The badge is the page's largest paint: the blocks render just after
  // it, so they never hold it up (spec §2, LCP).
  const blocks = useDeferredValue(view.blocks, []);
  const shared = useSharedContext(did);
  const signedOut = session.status !== 'signedIn';
  const viewer = signedOut ? 'signedOut' : view.mode;
  const hasHero = Boolean(view.hero);
  const optedOut =
    signedOut &&
    view.profile.status === 'ready' &&
    view.profile.value.labels.includes(NO_UNAUTHENTICATED);
  const blocked = Boolean(shared.relationship?.blocked);

  useApplyAccent(view.configReady ? view.config.accent : DEFAULT_ACCENT);
  // Never put the name in the tab title (or history) when it isn't shown.
  useDocumentTitle(
    preview
      ? null
      : optedOut
        ? t`Sign in to see this lanyard`
        : blocked
          ? t`Lanyard unavailable`
          : (view.hero?.displayName ?? t`Lanyard`)
  );

  useEffect(() => {
    if (hasHero && !preview) track('lanyard_viewed', { viewer });
  }, [did, viewer, hasHero, preview]);

  // The lanyard keeps its own ground: the whole page when public; in the
  // customiser's preview, the canvas around it is that ground (#122).
  const frame = (content: ReactNode) =>
    preview ? content : <LanyardSurface>{content}</LanyardSurface>;

  if (view.profile.status === 'error') {
    return frame(
      <LanyardProblem
        error={view.profile.error}
        handle={handle}
        onRetry={() => view.retry('bluesky')}
      />
    );
  }

  // The hero waits briefly for Sifa and the owner's record (spec §7).
  if (!view.heroReady || !view.hero || shared.checkingBlock) {
    return frame(<LanyardSkeleton className={className} />);
  }

  if (optedOut) {
    const returnTo = encodeURIComponent(location.pathname);
    return frame(
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

  if (blocked) {
    return frame(
      <LanyardNotice heading={t`This lanyard isn't available to you.`} />
    );
  }

  return frame(
    <article className={cn(styles.page, className)}>
      <BadgeHero
        hero={view.hero}
        headingLevel={preview ? 2 : 1}
        boardPending={view.sifaPending ? boardCells(view.config) : undefined}
        // "+N more roles" goes to the Roles block, when it is shown (#130).
        rolesHref={
          view.blocks.some((block) => block.type === 'roles')
            ? '#roles'
            : undefined
        }
        actions={
          !preview && (
            <HeroActions did={did} handle={view.hero.handle} mode={view.mode} />
          )
        }
      />
      <div className={styles.column}>
        {!preview && (
          <SharedContextStrip
            mutual={shared.mutual}
            knownFollowers={shared.knownFollowers}
          />
        )}
        {view.configError && view.mode === 'owner' && (
          <div className={styles.problem} role="status">
            <p
              className={styles.text}
            >{t`Couldn't load your lanyard settings`}</p>
            <Button
              tone="accent"
              variant="secondary"
              onClick={() => view.retry('lanyards')}
            >
              {t`Retry`}
            </Button>
          </div>
        )}
        <LanyardBlocks
          blocks={blocks}
          owner={view.mode === 'owner'}
          profile={profileId(did, view.hero.handle)}
          onRetry={(type) =>
            Promise.allSettled(BLOCK_SOURCES[type].map(view.retry))
          }
        />
      </div>
    </article>
  );
}
