import { useLingui } from '@lingui/react/macro';
import { useNavigate } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { HandleCombobox } from '@/components/HandleCombobox/HandleCombobox';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/utils';

import { SEARCH_FIELD_ID } from './LanyardNotFound.constants';
import * as styles from './LanyardNotFound.styles';
import type { LanyardNotFoundProps } from './LanyardNotFound.types';

/** "We couldn't find @handle", with a search to find the right person. */
export function LanyardNotFound({ handle, className }: LanyardNotFoundProps) {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  useDocumentTitle(t`Not found`);

  function search(event: FormEvent) {
    event.preventDefault();
    const target = query.trim().replace(/^@/, '').toLowerCase();
    if (!target) return;
    void navigate({ to: '/@{$handle}', params: { handle: target } });
  }

  return (
    <section className={cn(styles.page, className)}>
      <div className={styles.intro}>
        <h1 className={styles.heading}>
          {handle
            ? t`We couldn't find @${handle}`
            : t`We couldn't find that lanyard`}
        </h1>
        <p
          className={styles.hint}
        >{t`Check the spelling, or search for them.`}</p>
      </div>
      <form className={styles.form} onSubmit={search} role="search">
        <HandleCombobox
          id={SEARCH_FIELD_ID}
          label={t`Search for someone`}
          value={query}
          onChange={setQuery}
        />
        <Button type="submit">{t`Show lanyard`}</Button>
      </form>
    </section>
  );
}
