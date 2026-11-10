import { useEffect } from 'react';

const APP_NAME = 'Lanyards';

/** Sets the browser tab title to "<page> · Lanyards" (WCAG 2.4.2). */
export function useDocumentTitle(page: string): void {
  useEffect(() => {
    document.title = `${page} · ${APP_NAME}`;
  }, [page]);
}
