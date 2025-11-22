import { clsx, type ClassValue } from 'clsx';
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

/**
 * Formats a date string to MM/DD/YYYY format (US style)
 * Example: '2024-03-15' → '03/15/2024'
 */
export function formatDateUS(dateString: string): string {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Extracts display URL from a full URL (removes protocol, shows domain + path)
 * Example: 'https://www.example.com/page' → 'www.example.com/page'
 */
export function formatDisplayURL(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.host + urlObj.pathname.replace(/\/$/, '');
  } catch {
    return url;
  }
}
