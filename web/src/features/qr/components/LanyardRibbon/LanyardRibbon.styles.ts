// The straps, printed in a colour that reads on them; the clasp is metal
// on any ground. Every class is written out in full: Tailwind only
// generates those.

// Decoration: anything it hangs over still takes the click.
export const ribbon = 'pointer-events-none overflow-visible';

export const print = 'text-[16px] font-bold uppercase tracking-[0.16em]';

/**
 * ink: the owner's strap colour, printed in the badge's label colour, on
 * the brand blue or ink (spec §8, #169). accent: the badge's own accent,
 * edged with a hairline, on a page that may be light or dark (#173).
 */
export const tones = {
  ink: {
    strap: 'fill-none stroke-qr-strap',
    print: 'fill-board-label',
    tab: 'fill-qr-strap',
    stitch: 'stroke-board-label',
    // The clasp's hook, open where the ground shows through.
    gap: 'fill-qr-ground',
    edge: undefined,
  },
  accent: {
    strap: 'fill-none stroke-accent',
    print: 'fill-on-accent',
    tab: 'fill-accent stroke-border-strong',
    stitch: 'stroke-on-accent',
    gap: 'fill-background',
    edge: 'fill-none stroke-border-strong',
  },
} as const;
