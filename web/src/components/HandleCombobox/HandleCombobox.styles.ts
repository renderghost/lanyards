import type { HandleComboboxTone } from './HandleCombobox.types';

export const field = 'flex flex-col gap-1.5';

export const anchor = 'relative';

export const names = 'flex min-w-0 flex-col';

type ToneStyles = {
  label: string;
  input: string;
  inputInvalid: string;
  hint: string;
  error: string;
  menu: string;
  option: string;
  optionActive: string;
  avatar: string;
  displayName: string;
  handle: string;
};

export const tones: Record<HandleComboboxTone, ToneStyles> = {
  ui: {
    label: 'text-sm font-medium leading-5 text-ui-text',
    input:
      'min-h-11 w-full rounded-sm border border-ui-border-strong bg-ui-surface px-3 text-base leading-6 text-ui-text placeholder:text-ui-text-muted disabled:opacity-60',
    inputInvalid: 'border-2 border-ui-danger',
    hint: 'text-sm leading-5 text-ui-text-muted',
    error: 'text-sm font-medium leading-5 text-ui-danger',
    menu: 'absolute inset-x-0 top-[calc(100%+0.25rem)] z-10 flex max-h-80 flex-col overflow-y-auto rounded-sm border border-ui-border bg-ui-surface p-1 shadow-lg',
    option:
      'flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5',
    // The ring keeps the active option visible at 3:1, not by tint alone.
    optionActive: 'bg-ui-primary-subtle ring-1 ring-inset ring-ui-primary',
    avatar: 'size-8 shrink-0 rounded-full bg-ui-surface-muted',
    displayName: 'truncate text-sm font-medium leading-5 text-ui-text',
    handle: 'truncate text-sm leading-5 text-ui-text-muted',
  },
  accent: {
    label: 'text-sm font-medium leading-5 text-foreground',
    input:
      'min-h-11 w-full rounded-sm border border-border-strong bg-surface px-3 text-base leading-6 text-foreground disabled:opacity-60',
    inputInvalid: 'border-2 border-accent-text',
    hint: 'text-sm leading-5 text-muted-foreground',
    error: 'text-sm font-medium leading-5 text-foreground',
    menu: 'absolute inset-x-0 top-[calc(100%+0.25rem)] z-10 flex max-h-80 flex-col overflow-y-auto rounded-sm border border-border bg-surface p-1',
    option:
      'flex min-h-11 cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5',
    optionActive: 'bg-accent-subtle',
    avatar: 'size-8 shrink-0 rounded-full bg-accent-subtle',
    displayName: 'truncate text-sm font-medium leading-5 text-foreground',
    handle: 'truncate text-sm leading-5 text-muted-foreground',
  },
};
