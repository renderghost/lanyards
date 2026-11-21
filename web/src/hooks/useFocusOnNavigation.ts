import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

/**
 * After client-side navigation, moves focus to the new page's main heading
 * so keyboard and screen-reader users land on, and hear, the new content:
 * the first one within reach. The first load is left alone.
 */
export function useFocusOnNavigation(): void {
  const router = useRouter();

  useEffect(
    () =>
      router.subscribe('onResolved', (event) => {
        if (!event.fromLocation || !event.pathChanged) return;
        requestAnimationFrame(() => {
          // The first within reach: a badge turned over keeps its other
          // face in the page, inert (#175).
          const heading = [
            ...document.querySelectorAll<HTMLElement>('main h1'),
          ].find((candidate) => !candidate.closest('[inert]'));
          if (!heading) return;
          heading.tabIndex = -1;
          heading.focus();
        });
      }),
    [router]
  );
}
