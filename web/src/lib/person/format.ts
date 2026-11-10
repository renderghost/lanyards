const PARTIAL_DATE = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(?:T.*)?$/;

const monthYear = new Intl.DateTimeFormat('en-GB', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const dayMonthYear = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Formats Sifa-style partial dates for people: '2024' → '2024',
 * '2024-03' → 'Mar 2024', '2024-03-07' → '7 Mar 2024'. Anything else is
 * returned unchanged.
 */
export function formatPartialDate(value: string): string {
  const match = PARTIAL_DATE.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  if (!month) return year ?? value;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day ?? 1))
  );
  if (Number.isNaN(date.getTime())) return value;
  return (day ? dayMonthYear : monthYear).format(date);
}

const graphemes = new Intl.Segmenter('en-GB', { granularity: 'grapheme' });

/** Shortens `text` to `max` user-perceived characters, adding '…'. */
export function truncateGraphemes(text: string, max: number): string {
  const segments = [...graphemes.segment(text)];
  if (segments.length <= max) return text;
  return `${segments
    .slice(0, max)
    .map((segment) => segment.segment)
    .join('')}…`;
}
