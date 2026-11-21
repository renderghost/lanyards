import type { Ref } from 'react';

export type LanyardTone = 'ink' | 'accent';

export type LanyardRibbonProps = {
  /**
   * Printed along both straps, repeated: the person's handle (#169), or
   * Lanyards' own address (#170).
   */
  text: string;
  /** ink on the brand ground (the default); accent on a page (#173). */
  tone?: LanyardTone;
  /**
   * The drawing, for a lanyard that sways (#174): its straps are marked
   * data-strap, by side, and its tab and clasp are one data-tab group.
   */
  ref?: Ref<SVGSVGElement>;
  className?: string;
};
