'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BlueskyStatsProps } from './BlueskyStats.types';
import { styles } from './BlueskyStats.styles';
import { BLUESKY_BASE_URL, formatCount } from './BlueskyStats.constants';

export default function BlueskyStats({
  handle,
  followersCount,
  followsCount,
  postsCount,
}: BlueskyStatsProps) {
  const stats = [
    {
      label: 'followers',
      value: formatCount(followersCount),
      href: `${BLUESKY_BASE_URL}/${handle}/followers`,
    },
    {
      label: 'following',
      value: formatCount(followsCount),
      href: `${BLUESKY_BASE_URL}/${handle}/follows`,
    },
    {
      label: 'posts',
      value: formatCount(postsCount),
      href: `${BLUESKY_BASE_URL}/${handle}`,
    },
  ];

  return (
    <div className={cn(styles.container)}>
      {stats.map((stat) => (
        <div key={stat.label} className={cn(styles.stat)}>
          <Link
            href={stat.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(styles.statNumber)}
          >
            {stat.value}
          </Link>
          <span className={cn(styles.statLabel)}>{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
