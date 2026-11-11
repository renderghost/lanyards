import type { BlockStatus } from '@/lib/person/blocks';
import type { LanyardConfig, RenderableBlockType } from '@/lib/person/config';

export type BlockEditorProps = {
  config: LanyardConfig;
  statuses: Partial<Record<RenderableBlockType, BlockStatus>>;
  /**
   * The owner's handle, or DID when it doesn't verify (see profileId), for
   * links to edit their data on Sifa or Bluesky.
   */
  profile: string;
  disabled?: boolean;
  onChange(patch: (config: LanyardConfig) => LanyardConfig): void;
  onRetry(type: RenderableBlockType): void;
  className?: string;
};
