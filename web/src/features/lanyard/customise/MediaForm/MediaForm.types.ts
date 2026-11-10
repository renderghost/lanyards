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
  disabled?: boolean;
  className?: string;
};
