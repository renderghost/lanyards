export const BLUESKY_BASE_URL = 'https://bsky.app/profile';

export const formatCount = (count?: number): string => {
  if (count === undefined) return '0';
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};
