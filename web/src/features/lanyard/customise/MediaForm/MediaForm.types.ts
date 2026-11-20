import type { MediaFields } from '../../hooks/useKeptRecordsDraft';
import type { WebAddressError } from '@/lib/validation';

export type MediaValues = {
  url: string;
  platform: string;
  title: string;
  description: string;
  type: string;
};

export type MediaErrors = {
  url?: WebAddressError;
  platform?: 'required';
  title?: 'tooLong';
  description?: 'tooLong';
};

export type MediaFormProps = {
  /** Gets a valid entry; the form itself writes nothing. */
  onSubmit(fields: MediaFields): void;
  /** Editing: the entry's current fields (the button then says Update). */
  initial?: MediaFields;
  /** The owner's talks on Sifa, where recordings of talks belong (#132). */
  talksUrl?: string;
  onCancel?(): void;
  disabled?: boolean;
  className?: string;
};
