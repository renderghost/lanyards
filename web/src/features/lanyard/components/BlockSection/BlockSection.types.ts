import type { ReactNode } from 'react';

import type { SourceName } from '@/lib/sources/result';

export type BlockSectionProps = {
  /** The section's id, for links to it from elsewhere on the page. */
  id?: string;
  heading: string;
  status: 'loading' | 'error' | 'ready';
  /** Sources that failed; shown to the owner only. */
  failedSources?: SourceName[];
  /** The owner sees failures, retry and edit links. */
  owner: boolean;
  /**
   * Fetches the block's sources again. Content that crashed while
   * rendering is rendered again once this settles, with the fresh data.
   */
  onRetry?(): Promise<unknown> | void;
  /** The block's content threw while rendering. */
  onCrash?(error: unknown): void;
  /** Where the owner edits this block's data (Sifa, Bluesky). */
  editLinks?: { label: string; url: string }[];
  /** Before the name: the customiser's drag handle. */
  handle?: ReactNode;
  /** Under the name, e.g. "Hidden from visitors". */
  note?: string;
  /** After the Edit-on links: the customiser's block controls. */
  controls?: ReactNode;
  /** Only the header row, in a dashed frame (a hidden block). */
  collapsed?: boolean;
  children?: ReactNode;
  className?: string;
};
