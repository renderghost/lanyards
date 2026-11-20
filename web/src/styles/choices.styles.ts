// Native checkboxes and radios, drawn in the UI tokens rather than left to
// the browser, whose dark-mode controls are a grey of their own. Each
// keeps its native role, keyboard handling and focus ring.

/** A tick, cut out by clip-path, scaled in when checked. */
export const checkbox =
  "grid size-5 shrink-0 cursor-pointer appearance-none place-content-center rounded-xs border border-ui-border-strong bg-ui-surface before:size-3 before:scale-0 before:bg-ui-on-primary before:content-[''] before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0%,43%_62%)] checked:border-ui-primary checked:bg-ui-primary checked:before:scale-100 disabled:cursor-not-allowed disabled:opacity-60";

/** Checked, a thick ring in the primary colour around the surface. */
export const radio =
  'size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-ui-border-strong bg-ui-surface checked:border-[6px] checked:border-ui-primary disabled:cursor-not-allowed disabled:opacity-60';
