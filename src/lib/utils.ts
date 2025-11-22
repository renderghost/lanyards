import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines classnames using clsx and tailwind-merge
 * Handles conditional classes and merges Tailwind classes intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a work type string for human-readable display
 * Converts hyphenated lowercase to Title Case
 * Example: 'journal-article' → 'Journal Article'
 */
export function formatWorkType(type: string): string {
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
