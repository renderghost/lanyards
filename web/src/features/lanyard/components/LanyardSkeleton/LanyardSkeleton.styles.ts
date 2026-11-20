// The badge's shape while it loads (spec §7): cover, field and board, at
// the badge's sizes, so nothing jumps when it arrives.

export const page =
  'flex w-full max-w-[70rem] flex-col items-center gap-10 self-center px-4 py-8 sm:px-6 sm:py-10';

export const badge =
  '@container flex w-full flex-col overflow-hidden rounded-sm shadow-badge outline outline-1 -outline-offset-1 outline-border';

const pulse = 'motion-safe:animate-pulse';

export const cover = `h-30 bg-subtle @min-[40rem]:h-60 ${pulse}`;

export const field =
  'flex flex-col gap-4 bg-accent-subtle px-5 pb-6 @min-[40rem]:px-12 @min-[40rem]:pb-10';

export const avatarBox = 'h-12 @min-[40rem]:h-17';

export const avatar = `block size-24 -translate-y-1/2 rounded-full bg-subtle shadow-[0_0_0_6px_var(--accent-subtle)] @min-[40rem]:size-34 ${pulse}`;

export const name = `h-14 w-3/4 max-w-[36rem] rounded-xs bg-subtle @min-[40rem]:h-24 ${pulse}`;

export const line = `h-6 w-1/2 max-w-[20rem] rounded-xs bg-subtle ${pulse}`;

export const board = 'h-[5.5rem] bg-badge-ink';

export const srOnly = 'sr-only';
