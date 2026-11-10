import { segmentize } from '@atcute/bluesky-richtext-segmenter';
import { Link } from '@tanstack/react-router';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cn } from '@/lib/utils';

import * as styles from './RichText.styles';
import type { RichTextProps } from './RichText.types';

type Feature = { $type?: string; uri?: unknown; did?: unknown };

/**
 * Bluesky post text with its facets: links become safe external links and
 * mentions link to the person's lanyard. Text is never parsed as HTML.
 */
export function RichText({ text, facets, className }: RichTextProps) {
  const segments = segmentize<Feature>(text, facets as never);
  return (
    <p className={cn(styles.text, className)}>
      {segments.map((segment, index) => {
        const feature = segment.features?.[0];
        if (
          feature?.$type === 'app.bsky.richtext.facet#link' &&
          typeof feature.uri === 'string'
        ) {
          return (
            <ExternalLink key={index} href={feature.uri}>
              {segment.text}
            </ExternalLink>
          );
        }
        if (
          feature?.$type === 'app.bsky.richtext.facet#mention' &&
          typeof feature.did === 'string'
        ) {
          return (
            <Link
              key={index}
              to="/d/$did"
              params={{ did: feature.did }}
              className={styles.mention}
            >
              {segment.text}
            </Link>
          );
        }
        return <span key={index}>{segment.text}</span>;
      })}
    </p>
  );
}
