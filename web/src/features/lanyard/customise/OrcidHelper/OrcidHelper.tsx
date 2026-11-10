import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { useId, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { TextField } from '@/components/TextField/TextField';
import { notify } from '@/components/Toaster/notify';
import { track } from '@/lib/analytics/analytics';
import { CANONICAL_ORIGIN } from '@/lib/atproto/endpoints';
import { EDIT_LINKS } from '@/lib/person/editLinks';
import { sourceQueryOptions } from '@/lib/person/sourceQuery';
import { queryKeys } from '@/lib/query/keys';
import { fetchOrcidVerified } from '@/lib/sources/orcid/orcid';
import { cn } from '@/lib/utils';

import { ORCID_EDIT_URL } from './OrcidHelper.constants';
import * as styles from './OrcidHelper.styles';
import type { OrcidHelperProps } from './OrcidHelper.types';

/**
 * Helps the owner verify their ORCID iD two ways: Sifa links to ORCID, and
 * their ORCID record links back to their lanyard (spec §7.2), which earns
 * their publications the ORCID tick.
 */
export function OrcidHelper({
  did,
  handle,
  orcidId,
  className,
}: OrcidHelperProps) {
  const { t } = useLingui();
  const headingId = useId();
  const [announcement, setAnnouncement] = useState('');
  const backLink = `${CANONICAL_ORIGIN}/d/${did}`;
  // The same query the lanyard's publications use, but needed here whether
  // or not that block is shown.
  const check = useQuery({
    queryKey: queryKeys.source('orcid', did, orcidId ?? ''),
    enabled: Boolean(orcidId),
    ...sourceQueryOptions((signal) =>
      fetchOrcidVerified(orcidId ?? '', did, signal)
    ),
  });

  if (orcidId === undefined) return null;

  if (orcidId === null) {
    const [sifa] = EDIT_LINKS.links(handle);
    return (
      <section
        aria-labelledby={headingId}
        className={cn(styles.section, className)}
      >
        <h3 id={headingId} className={styles.heading}>
          {t`ORCID iD`}
        </h3>
        <p className={styles.text}>
          {t`Add your ORCID iD on Sifa to show verified publications.`}
        </p>
        {sifa && (
          <ExternalLink href={sifa.url} className={styles.link}>
            {t`Open Sifa`}
          </ExternalLink>
        )}
      </section>
    );
  }

  async function checkAgain() {
    const result = await check.refetch();
    if (result.isError) {
      setAnnouncement(t`Couldn't reach ORCID. Please try again.`);
      return;
    }
    const verified = result.data === true;
    setAnnouncement(
      verified
        ? t`Verified. Your publications now show the ORCID tick.`
        : t`Not verified yet. ORCID can take a few minutes to update.`
    );
    track('orcid_checked', { verified });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(backLink);
      notify.success(t`Link copied`);
    } catch {
      notify.error(t`Couldn't copy the link. Please try again.`);
    }
  }

  const pending = check.status === 'pending';
  const verified = check.data === true;
  return (
    <section
      aria-labelledby={headingId}
      className={cn(styles.section, className)}
    >
      <h3 id={headingId} className={styles.heading}>
        {pending || verified ? t`ORCID iD` : t`Verify your ORCID iD`}
      </h3>
      {pending ? (
        <p className={styles.text}>{t`Checking your ORCID iD…`}</p>
      ) : verified ? (
        <p className={styles.verified}>
          <BadgeCheck aria-hidden="true" className={styles.tick} />
          {t`Your ORCID iD is verified`}
        </p>
      ) : (
        <>
          <p className={styles.text}>
            {t`Add this link to the Websites & social links section of your ORCID record:`}
          </p>
          <TextField
            label={t`Link to add`}
            name="orcidBackLink"
            value={backLink}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          <div className={styles.actions}>
            <Button variant="secondary" onClick={() => void copy()}>
              {t`Copy link`}
            </Button>
            <ExternalLink href={ORCID_EDIT_URL} className={styles.link}>
              {t`Open ORCID`}
            </ExternalLink>
            <Button
              variant="secondary"
              loading={check.isFetching}
              onClick={() => void checkAgain()}
            >
              {t`Check again`}
            </Button>
          </div>
        </>
      )}
      <p aria-live="polite" className={styles.status}>
        {announcement}
      </p>
    </section>
  );
}
