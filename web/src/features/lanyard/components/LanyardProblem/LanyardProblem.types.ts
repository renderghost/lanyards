import type { SourceError } from '@/lib/sources/result';

export type LanyardProblemProps = {
  error: SourceError;
  /** The handle that was asked for, when there was one. */
  handle?: string;
  onRetry(): void;
};
