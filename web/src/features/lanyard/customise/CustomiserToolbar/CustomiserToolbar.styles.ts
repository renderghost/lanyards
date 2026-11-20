// Phones only. Sticky at the foot of <main>, so it takes its own space and
// never covers what follows (the offline banner); it clears the home
// indicator in the installed app.
export const toolbar =
  'sticky bottom-0 z-30 flex items-center justify-around gap-2 border-t border-ui-border bg-ui-surface px-4 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] max-[25rem]:px-2 md:hidden';

export const icon = 'size-5 shrink-0';

// Five controls don't fit the narrowest phones with every word: there,
// Support is its icon, still named for screen readers (#134).
export const narrowLabel = 'max-[25rem]:sr-only';
