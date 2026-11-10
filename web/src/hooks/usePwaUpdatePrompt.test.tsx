import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notify } from '@/components/Toaster/notify';
import { AppI18nProvider } from '@/i18n/AppI18nProvider';
import { track } from '@/lib/analytics/analytics';

import { usePwaUpdatePrompt } from './usePwaUpdatePrompt';

const sw = vi.hoisted(() => ({
  needRefresh: false,
  updateServiceWorker: vi.fn(),
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [sw.needRefresh, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}));
vi.mock('@/components/Toaster/notify', () => ({
  notify: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));
vi.mock('@/lib/analytics/analytics', () => ({
  track: vi.fn(),
  captureError: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('usePwaUpdatePrompt', () => {
  it('stays quiet while the app is up to date', () => {
    sw.needRefresh = false;
    renderHook(() => usePwaUpdatePrompt(), { wrapper: AppI18nProvider });
    expect(notify.info).not.toHaveBeenCalled();
  });

  it('offers a reload when a new version is waiting', () => {
    sw.needRefresh = true;
    renderHook(() => usePwaUpdatePrompt(), { wrapper: AppI18nProvider });
    expect(notify.info).toHaveBeenCalledWith(
      'A new version of Lanyards is available',
      { action: { label: 'Reload', onClick: expect.any(Function) } }
    );
    const [, options] = vi.mocked(notify.info).mock.calls[0]!;
    options?.action?.onClick();
    expect(track).toHaveBeenCalledWith('pwa_update_applied');
    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true);
  });
});
