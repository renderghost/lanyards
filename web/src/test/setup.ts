import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterAll, afterEach } from 'vitest';

import { server } from './msw';

// Without Vitest globals, Testing Library cannot register its own cleanup.
afterEach(() => {
  cleanup();
});

// Listen before any test module is imported: clients such as atcute's
// simpleFetchHandler capture fetch when their module loads.
server.listen({ onUnhandledFrame: 'error' });
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

// jsdom lacks matchMedia; components that follow the system colour scheme
// (e.g. the toaster) need it.
// Server tests run in the node environment, which has no window.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// jsdom has no layout: Radix menus and switches measure with ResizeObserver
// and use pointer capture and scrollIntoView, which it lacks.
if (typeof window !== 'undefined') {
  window.ResizeObserver ??= class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
  Element.prototype.hasPointerCapture ??= () => false;
  Element.prototype.setPointerCapture ??= () => undefined;
  Element.prototype.releasePointerCapture ??= () => undefined;
  Element.prototype.scrollIntoView ??= () => undefined;
}
