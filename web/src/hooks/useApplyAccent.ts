import { useEffect } from 'react';

import { type Accent, applyAccent, DEFAULT_ACCENT } from '@/design/accents';

/** Applies an accent palette while the calling component is mounted. */
export function useApplyAccent(accent: Accent): void {
  useEffect(() => {
    applyAccent(accent);
    return () => applyAccent(DEFAULT_ACCENT);
  }, [accent]);
}
