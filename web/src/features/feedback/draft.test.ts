import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearDraft, readDraft, saveDraft } from './draft';
import type { Screenshot } from './images';

const KEY = 'lanyards:feedback-draft';

const shot = (bytes: number[], alt: string): Screenshot => ({
  id: 'a',
  blob: new Blob([new Uint8Array(bytes)], { type: 'image/webp' }),
  previewUrl: 'blob:old',
  alt,
});

const values = (screenshots: Screenshot[] = []) => ({
  type: 'bug',
  title: 'The badge overlaps',
  details: 'At 320 px.',
  techDetails: true,
  screenshots,
});

const bytesOf = (blob: Blob) =>
  new Promise<number[]>((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve([...new Uint8Array(reader.result as ArrayBuffer)]);
    reader.readAsArrayBuffer(blob);
  });

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:restored');
});

afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe('feedback drafts (#134)', () => {
  it('keeps a draft, screenshots included, through the sign-in', async () => {
    await saveDraft(values([shot([1, 2, 3], 'The QR sheet')]));
    const draft = readDraft();
    expect(draft?.screenshotsDropped).toBe(false);
    expect(draft?.values).toMatchObject({
      type: 'bug',
      title: 'The badge overlaps',
      details: 'At 320 px.',
      techDetails: true,
    });
    const [restored] = draft?.values.screenshots ?? [];
    expect(restored?.alt).toBe('The QR sheet');
    expect(restored?.previewUrl).toBe('blob:restored');
    expect(restored?.blob.type).toBe('image/webp');
    expect(await bytesOf(restored!.blob)).toEqual([1, 2, 3]);
  });

  it('keeps the words when the screenshots are too big to keep', async () => {
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (
      this: Storage,
      key: string,
      value: string
    ) {
      if (value.includes('data:')) {
        throw new DOMException('Full', 'QuotaExceededError');
      }
      setItem.call(this, key, value);
    });
    await saveDraft(values([shot([1, 2, 3], 'x')]));
    const draft = readDraft();
    expect(draft?.values.title).toBe('The badge overlaps');
    expect(draft?.values.screenshots).toEqual([]);
    expect(draft?.screenshotsDropped).toBe(true);
  });

  it('keeps nothing for an empty draft', async () => {
    await saveDraft({
      type: '',
      title: ' ',
      details: '',
      techDetails: false,
      screenshots: [],
    });
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(readDraft()).toBeNull();
  });

  it('forgets a draft once it’s been put back', async () => {
    await saveDraft(values());
    clearDraft();
    expect(readDraft()).toBeNull();
  });

  it('ignores a draft it can’t read', () => {
    sessionStorage.setItem(KEY, '{not json');
    expect(readDraft()).toBeNull();
    sessionStorage.setItem(KEY, JSON.stringify({ title: 42 }));
    expect(readDraft()).toBeNull();
  });
});
