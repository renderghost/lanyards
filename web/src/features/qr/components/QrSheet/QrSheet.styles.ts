export const overlay = 'fixed inset-0 z-40 bg-background';

// Portrait: name, code and actions in one column. Landscape (a phone on
// its side): the code on the left, as tall as the screen allows but at
// most half its width, with the name and actions centred beside it.
export const content =
  'fixed inset-0 z-50 grid content-center justify-items-center gap-6 overflow-y-auto bg-background px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] focus:outline-none landscape:grid-cols-[auto_minmax(0,20rem)] landscape:grid-rows-[1fr_auto_auto_1fr] landscape:content-stretch landscape:justify-center landscape:gap-x-6';

export const heading =
  'flex flex-col items-center gap-2 landscape:col-start-2 landscape:row-start-2';

export const title =
  'text-center font-serif text-3xl leading-tight text-foreground [overflow-wrap:anywhere] landscape:text-2xl';

export const description =
  'text-center text-lg leading-7 text-muted-foreground';

export const code =
  'w-full max-w-80 landscape:col-start-1 landscape:row-span-4 landscape:row-start-1 landscape:size-[min(20rem,calc(100dvh-3rem),50vw)] landscape:self-center';

export const actions =
  'flex w-full max-w-80 flex-col gap-3 landscape:col-start-2 landscape:row-start-3';

export const action = 'w-full';
