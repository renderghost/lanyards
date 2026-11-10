import type { WebAddressError } from '@/lib/validation';

export type WebLinkValues = { url: string; title: string };

export type WebLinkErrors = {
  url?: WebAddressError;
  title?: 'tooLong';
};

export type WebLinkFormProps = {
  disabled?: boolean;
  className?: string;
};
