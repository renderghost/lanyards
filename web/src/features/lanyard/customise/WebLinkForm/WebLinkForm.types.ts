import type { LinkFields } from '../../hooks/useKeptRecordsDraft';
import type { WebAddressError } from '@/lib/validation';

export type WebLinkValues = { url: string; title: string };

export type WebLinkErrors = {
  url?: WebAddressError;
  title?: 'tooLong';
};

export type WebLinkFormProps = {
  /** Gets a valid link; the form itself writes nothing. */
  onSubmit(fields: LinkFields): void;
  /** Editing: the link's current fields (the button then says Update link). */
  initial?: LinkFields;
  onCancel?(): void;
  disabled?: boolean;
  className?: string;
};
