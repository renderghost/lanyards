import { useLingui } from '@lingui/react/macro';

import { captureError } from '@/lib/analytics/analytics';
import { EDIT_LINKS } from '@/lib/person/editLinks';
import { cn } from '@/lib/utils';

import { BlockSection } from '../BlockSection/BlockSection';
import { BLOCK_COMPONENTS, BLOCK_HEADINGS } from './LanyardBlocks.constants';
import * as styles from './LanyardBlocks.styles';
import type { LanyardBlocksProps } from './LanyardBlocks.types';

/**
 * The lanyard's blocks. Each block contains its own rendering failures
 * (see BlockSection), so one broken block never takes the page down.
 */
export function LanyardBlocks({
  blocks,
  owner,
  profile,
  onRetry,
  className,
}: LanyardBlocksProps) {
  const { i18n } = useLingui();
  if (blocks.length === 0) return null;
  return (
    <div className={cn(styles.blocks, className)}>
      {blocks.map((block) => {
        const Items = BLOCK_COMPONENTS[block.type];
        return (
          <BlockSection
            key={block.type}
            heading={i18n._(BLOCK_HEADINGS[block.type])}
            status={block.status}
            failedSources={
              block.status === 'error'
                ? block.sources
                : block.status === 'ready'
                  ? block.failedSources
                  : []
            }
            owner={owner}
            editLinks={
              owner && profile
                ? EDIT_LINKS[block.type](profile).map((link) => ({
                    label: i18n._(link.label),
                    url: link.url,
                  }))
                : undefined
            }
            onRetry={() => onRetry(block.type)}
            onCrash={(error) =>
              captureError(error, { source: `block:${block.type}` })
            }
          >
            {block.status === 'ready' && (
              <Items items={block.items as never[]} />
            )}
          </BlockSection>
        );
      })}
    </div>
  );
}
