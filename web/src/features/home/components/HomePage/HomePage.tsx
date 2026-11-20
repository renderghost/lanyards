import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';

import { Button } from '@/components/Button/Button';
import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { FIELD_ID } from '@/features/auth/components/SignInForm/SignInForm.constants';
import { cn } from '@/lib/utils';

import { BenefitList } from '../BenefitList/BenefitList';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import { HomeBadge } from '../HomeBadge/HomeBadge';
import { HomeBoard } from '../HomeBoard/HomeBoard';
import { HomeSection } from '../HomeSection/HomeSection';
import { SampleLanyard } from '../SampleLanyard/SampleLanyard';
import {
  BENEFITS,
  FEATURES,
  LINKS,
  PARADOX,
  SAMPLE_HANDLE,
} from './HomePage.constants';
import * as styles from './HomePage.styles';
import type { HomePageProps } from './HomePage.types';

/**
 * The homepage for people who aren't signed in: the old site's homepage
 * (#145) in the new design language, with sign-in where its "Get started"
 * button was. It wears brand blue whatever lanyard was last open.
 */
export function HomePage({ signIn, className }: HomePageProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  const ctaId = useId();

  // Focusing the handle field scrolls the sign-in form into view.
  const toSignIn = () => document.getElementById(FIELD_ID)?.focus();

  return (
    <div data-accent="blue" className={cn(styles.page, className)}>
      <section aria-labelledby={headingId}>
        <HomeBadge headingId={headingId} />
      </section>

      <div className={styles.body}>
        <div className={styles.column}>
          <HomeSection eyebrow={t`Sign in or sign up`} heading={t`Get started`}>
            <div className={styles.start}>
              <div className={styles.signIn}>
                {signIn}
                <ExternalLink
                  href={LINKS.docs}
                  tone="accent"
                  className={styles.learnMore}
                >
                  {t`Learn more`}
                </ExternalLink>
              </div>
              <SampleLanyard handle={SAMPLE_HANDLE} />
            </div>
          </HomeSection>

          <HomeSection
            eyebrow={t`The problem`}
            heading={t`The visibility paradox`}
            intro={t`Career progression demands comprehensive online presence, but maintaining it is administratively overwhelming.`}
          >
            <HomeBoard
              rows={PARADOX.map((point) => ({
                title: i18n._(point.title),
                text: i18n._(point.text),
              }))}
            />
          </HomeSection>

          <HomeSection
            eyebrow={t`What you get`}
            heading={t`One link, everything visible`}
            intro={t`Lanyards pulls together your complete scholarly presence with zero maintenance overhead.`}
          >
            <div className={styles.threeColumns}>
              {FEATURES.map((feature) => (
                <FeatureCard
                  key={feature.title.id}
                  icon={feature.icon}
                  accent={feature.accent}
                  cover={feature.cover}
                  initials={feature.initials}
                  title={i18n._(feature.title)}
                  text={i18n._(feature.text)}
                />
              ))}
            </div>
          </HomeSection>

          <HomeSection
            eyebrow={t`Why Lanyards`}
            heading={t`Built for researchers`}
            intro={t`Powerful tools designed for academic needs, not corporate networking.`}
          >
            <BenefitList
              benefits={BENEFITS.map((benefit) => ({
                title: i18n._(benefit.title),
                text: i18n._(benefit.text),
              }))}
            />
          </HomeSection>

          <section aria-labelledby={ctaId} className={styles.cta}>
            <div className={styles.ctaCover}>
              <CoverPattern pattern="symbols" initials="L" />
            </div>
            <div className={styles.ctaField}>
              <h2 id={ctaId} className={styles.ctaHeading}>
                {t`Ready to simplify your research presence?`}
              </h2>
              <p className={styles.ctaIntro}>
                {t`Join researchers building their professional identity on open infrastructure.`}
              </p>
              <div className={styles.actions}>
                <Button tone="badge" size="lg" onClick={toSignIn}>
                  {t`Create your lanyard`}
                </Button>
                <ExternalLink
                  href={LINKS.bluesky}
                  tone="badge"
                  className={styles.secondaryLink}
                >
                  {t`Follow on Bluesky`}
                </ExternalLink>
              </div>
            </div>
          </section>
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerText}>{t`Built on the AT Protocol`}</p>
          <div className={styles.footerLinks}>
            <ExternalLink
              href={LINKS.docs}
              tone="accent"
              className={styles.footerLink}
            >
              {t`Documentation`}
            </ExternalLink>
            <ExternalLink
              href={LINKS.github}
              tone="accent"
              className={styles.footerLink}
            >
              {t`GitHub`}
            </ExternalLink>
            <ExternalLink
              href={LINKS.contact}
              tone="accent"
              className={styles.footerLink}
            >
              {t`Contact`}
            </ExternalLink>
          </div>
        </footer>
      </div>
    </div>
  );
}
