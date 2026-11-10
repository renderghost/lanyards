import { useLingui } from '@lingui/react/macro';

import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary';
import { captureError } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import { BlockSection } from '../BlockSection/BlockSection';
import { BLOCK_COMPONENTS, BLOCK_HEADINGS } from './LanyardBlocks.constants';
import * as styles from './LanyardBlocks.styles';
import type { LanyardBlocksProps } from './LanyardBlocks.types';

/**
 * The lanyard's blocks, each behind its own error boundary, so one broken
 * block never takes the page down (spec §12.3).
 */
export function LanyardBlocks({
  blocks,
  owner,
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
          <ErrorBoundary
            key={block.type}
            onError={(error) =>
              captureError(error, { source: `block:${block.type}` })
            }
          >
            <BlockSection
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
              onRetry={() => onRetry(block.type)}
            >
              {block.status === 'ready' && (
                <Items items={block.items as never[]} />
              )}
            </BlockSection>
          </ErrorBoundary>
        );
      })}
    </div>
  );
}
