// A block with a cover strip, in its own accent (spec §5.6, §6): the
// accents and covers a lanyard can wear, shown on the homepage (#145).
export const card =
  'flex flex-col overflow-hidden rounded-sm bg-surface shadow-block outline outline-1 -outline-offset-1 outline-border';

export const cover = 'relative h-24 md:h-28';

export const body = 'flex flex-col gap-3 px-5 pb-6 md:px-6';

/** Half the tile's height: the other half overlaps the cover. */
export const tileBox = 'h-6';

// In the accent fill, ringed in the surface, so it seems cut into the
// cover like the badge's avatar.
export const tile =
  'flex size-12 -translate-y-1/2 items-center justify-center rounded-sm bg-accent text-on-accent shadow-[0_0_0_4px_var(--surface)]';

export const icon = 'size-6';

export const title = 'text-[18px] font-[650] leading-6 text-foreground';

export const text = 'text-base leading-6 text-muted-foreground';
