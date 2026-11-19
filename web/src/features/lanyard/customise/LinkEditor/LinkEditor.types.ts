import type { LinkItem } from '@/lib/person/personView.types';

import type { UseKeptRecordsDraft } from '../../hooks/useKeptRecordsDraft';

export type LinkEditorProps = {
  /** The Links block's items: the owner's own, Sifa's and Bluesky's. */
  items: LinkItem[];
  records: UseKeptRecordsDraft;
  disabled: boolean;
  className?: string;
};
