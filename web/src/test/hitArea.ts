/** Tailwind's spacing unit, in pixels. */
const UNIT = 4;

const number = (pattern: RegExp, tokens: string[]) =>
  tokens
    .map((token) => pattern.exec(token))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1] ?? 1));

/**
 * The height of a control's pointer target, read from its Tailwind classes
 * (jsdom has no layout): its own height, or, with an absolutely positioned
 * ::before, the padding box (its height less the top and bottom borders)
 * plus the pseudo-element's overhang above and below.
 */
export function hitHeight(classes: string): number {
  const tokens = classes.split(/\s+/).filter(Boolean);
  const height = Math.max(
    0,
    ...number(/^(?:min-h|h|size)-(\d+(?:\.\d+)?)$/, tokens).map((n) => n * UNIT)
  );
  if (!tokens.includes('before:absolute')) return height;
  const border = Math.max(0, ...number(/^border(?:-y)?(?:-(\d))?$/, tokens));
  const overhang = Math.max(
    0,
    ...number(/^before:-inset(?:-y)?-(\d+(?:\.\d+)?)$/, tokens).map(
      (n) => n * UNIT
    )
  );
  return Math.max(height, height - 2 * border + 2 * overhang);
}
