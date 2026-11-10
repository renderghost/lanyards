import { useEffect } from 'react';

const APP_NAME = 'Lanyards';

/**
 * Sets the browser tab title to "<page> · Lanyards" (WCAG 2.4.2). `null`
 * leaves it alone, for content embedded in a page that sets its own.
 */
export function useDocumentTitle(page: string | null): void {
  useEffect(() => {
    if (page !== null) document.title = `${page} · ${APP_NAME}`;
  }, [page]);
}
