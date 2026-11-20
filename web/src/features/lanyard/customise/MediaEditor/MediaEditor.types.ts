import type { MediaLink } from '@/lib/sources/lanyards/lanyards.types';

import type { UseKeptRecordsDraft } from '../../hooks/useKeptRecordsDraft';

export type MediaEditorProps = {
  /** The owner's podcasts and videos, as the Media block shows them. */
  items: MediaLink[];
  records: UseKeptRecordsDraft;
  disabled: boolean;
  /** The owner's talks on Sifa, for the form's hint about talk recordings. */
  talksUrl?: string;
  className?: string;
};
