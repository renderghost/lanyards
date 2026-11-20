// The brand's own page (#145), in the lanyard's palette pinned to brand
// blue: the hanging badge edge to edge, then sections in billboard type,
// then a billboard to close. Bold like the badge; quiet where it reads.
export const page = 'flex flex-1 flex-col bg-background text-foreground';

export const body =
  'flex w-full flex-col items-center gap-20 px-4 pb-16 pt-14 md:gap-28 md:px-8 md:pt-20';

/** As wide as a person's hero (spec §7). */
export const column = 'flex w-full max-w-[70rem] flex-col gap-20 md:gap-28';

export const start =
  'grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_375px] md:gap-16';

export const signIn = 'flex flex-col gap-4';

export const learnMore =
  'self-start text-base font-medium leading-6 underline-offset-4';

export const threeColumns = 'grid gap-5 md:grid-cols-3 md:gap-6';

/** The closing billboard: a cover, then the accent field. */
export const cta =
  '@container flex flex-col overflow-hidden rounded-sm bg-accent text-on-accent shadow-badge';

export const ctaCover = 'relative h-24 @min-[40rem]:h-36';

export const ctaField =
  'flex flex-col gap-6 px-5 py-8 @min-[40rem]:px-12 @min-[40rem]:py-12';

export const ctaHeading =
  'max-w-[16ch] text-[clamp(2.25rem,8cqi,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]';

export const ctaIntro =
  'max-w-[40ch] text-xl font-medium leading-7 tracking-[-0.01em]';

export const actions = 'flex flex-wrap gap-3';

/** Follow on Bluesky: the badge's secondary button, as a link. */
export const secondaryLink =
  'inline-flex min-h-11 items-center justify-center rounded-sm border-2 border-on-accent px-4 text-base font-semibold leading-6 text-on-accent no-underline hover:bg-on-accent/10 hover:no-underline focus-visible:outline-(--focus-ring-on-accent)';

export const footer =
  'flex w-full max-w-[70rem] flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row';

export const footerText =
  'text-xs font-bold uppercase leading-4 tracking-[0.14em] text-muted-foreground';

export const footerLinks = 'flex flex-wrap justify-center gap-6';

export const footerLink = 'text-sm leading-5 underline-offset-4';
