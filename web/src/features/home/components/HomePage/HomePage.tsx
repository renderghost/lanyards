import { useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';

import { CoverPattern } from '@/components/CoverPattern/CoverPattern';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import { BenefitList } from '../BenefitList/BenefitList';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import { HomeBadge } from '../HomeBadge/HomeBadge';
import { HomeBoard } from '../HomeBoard/HomeBoard';
import { HomeHeader } from '../HomeHeader/HomeHeader';
import { HomeSection } from '../HomeSection/HomeSection';
import { BENEFITS, FEATURES, LINKS, PARADOX } from './HomePage.constants';
import * as styles from './HomePage.styles';
import type { HomePageProps } from './HomePage.types';

/**
 * The homepage for people who aren't signed in: the old site's homepage
 * (#145) in the new design language. It makes its case and points to the
 * sign-in page (#157). It wears brand blue whatever lanyard was last open,
 * and draws its own header on that blue (#151).
 */
export function HomePage({ className }: HomePageProps) {
  const { t, i18n } = useLingui();
  const headingId = useId();
  const ctaId = useId();

  return (
    <div data-accent="blue" className={cn(styles.page, className)}>
      <HomeHeader />
      <main className={styles.main}>
        <section aria-labelledby={headingId}>
          <HomeBadge headingId={headingId} />
        </section>

        <div className={styles.body}>
          <div className={styles.column}>
            <HomeSection
              eyebrow={t`Get started`}
              heading={t`Everything you work on, in one link`}
              intro={t`Sign in with your Bluesky handle, or any AT Protocol account, and Lanyards gathers your publications, talks, affiliations and profiles into one lanyard to share anywhere: on a conference badge, in an email signature, on a slide.`}
            >
              <div className={styles.start}>
                <Link to="/sign-in" className={styles.startLink}>
                  {t`Sign in to get started`}
                </Link>
                <ExternalLink
                  href={LINKS.docs}
                  tone="accent"
                  className={styles.startMore}
                >
                  {t`Learn more`}
                </ExternalLink>
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
                  <Link to="/sign-in" className={styles.bannerLink}>
                    {t`Create your lanyard`}
                  </Link>
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
      </main>
    </div>
  );
}
