import type { ReactNode } from 'react';

import type { SourceName } from '@/lib/sources/result';

export type BlockSectionProps = {
  heading: string;
  status: 'loading' | 'error' | 'ready';
  /** Sources that failed; shown to the owner only. */
  failedSources?: SourceName[];
  /** The owner sees failures, retry and edit links. */
  owner: boolean;
  onRetry?(): void;
  /** Where the owner edits this block's data (Sifa, Bluesky). */
  editLinks?: { label: string; url: string }[];
  children?: ReactNode;
  className?: string;
};
