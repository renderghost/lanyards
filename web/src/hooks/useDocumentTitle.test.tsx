import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDocumentTitle } from './useDocumentTitle';

describe('useDocumentTitle', () => {
  it('names the page, then the app', () => {
    renderHook(() => useDocumentTitle('Your account'));
    expect(document.title).toBe('Your account · Lanyards');
  });
});
