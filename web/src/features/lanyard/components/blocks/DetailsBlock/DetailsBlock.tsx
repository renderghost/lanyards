import { useLingui } from '@lingui/react/macro';

import { cn } from '@/lib/utils';

import { ItemFrame } from '../ItemFrame/ItemFrame';
import { itemTitle } from '../itemTitle';
import * as styles from './DetailsBlock.styles';
import type { DetailsBlockProps } from './DetailsBlock.types';

const languageNames = new Intl.DisplayNames(['en-GB'], { type: 'language' });

const languageName = (code: string) => {
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
};

/** Location and languages, from Sifa. */
export function DetailsBlock({ items, className }: DetailsBlockProps) {
  const { t, i18n } = useLingui();
  const details = items[0];
  if (!details) return null;
  return (
    <ItemFrame
      itemKey={details.key}
      title={itemTitle('details', details, i18n)}
    >
      <dl className={cn(styles.list, className)}>
        {details.location && (
          <>
            <dt className={styles.term}>{t`Location`}</dt>
            <dd className={styles.value}>{details.location}</dd>
          </>
        )}
        {details.languages.length > 0 && (
          <>
            <dt className={styles.term}>{t`Languages`}</dt>
            <dd className={styles.value}>
              {details.languages.map(languageName).join(', ')}
            </dd>
          </>
        )}
      </dl>
    </ItemFrame>
  );
}
