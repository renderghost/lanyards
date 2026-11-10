import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * After client-side navigation, moves focus to the new page's main heading
 * so keyboard and screen-reader users land on, and hear, the new content.
 * The first load is left alone.
 */
export function useFocusOnNavigation(): void {
  const router = useRouter();

  useEffect(
    () =>
      router.subscribe('onResolved', (event) => {
        if (!event.fromLocation || !event.pathChanged) return;
        requestAnimationFrame(() => {
          const heading = document.querySelector<HTMLElement>('main h1');
          if (!heading) return;
          heading.tabIndex = -1;
          heading.focus();
        });
      }),
    [router]
  );
}
