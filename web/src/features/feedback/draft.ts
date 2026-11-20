import type { FeedbackValues } from './components/FeedbackForm/FeedbackForm.types';
import type { Screenshot } from './images';

/**
 * A feedback draft kept through the permission sign-in, which leaves the
 * app (#134). The tab's session storage outlives the round trip and goes
 * with the tab.
 */
const KEY = 'lanyards:feedback-draft';

type Stored = {
  type: string;
  title: string;
  details: string;
  techDetails: boolean;
  /** Each screenshot as a data URL, with its description. */
  screenshots: { data: string; alt: string }[];
  /** The screenshots didn't fit, so only the words were kept. */
  screenshotsDropped: boolean;
};

export type RestoredDraft = {
  values: FeedbackValues;
  screenshotsDropped: boolean;
};

const isEmpty = (values: FeedbackValues) =>
  !values.title.trim() &&
  !values.details.trim() &&
  values.screenshots.length === 0;

const dataUrlOf = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

function blobOf(dataUrl: string): Blob | null {
  const match = /^data:([^;,]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return null;
  const binary = atob(match[2] ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: match[1] });
}

function store(draft: Stored): boolean {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
    return true;
  } catch {
    // Full, or storage is blocked.
    return false;
  }
}

/**
 * Keeps the draft for after the sign-in. Screenshots are kept when they
 * fit; otherwise only the words are, and the restored draft says so.
 * Never throws: losing the draft mustn't stop the sign-in.
 */
export async function saveDraft(values: FeedbackValues): Promise<void> {
  if (isEmpty(values)) return;
  const words = {
    type: values.type,
    title: values.title,
    details: values.details,
    techDetails: values.techDetails,
  };
  let screenshots: Stored['screenshots'];
  try {
    screenshots = await Promise.all(
      values.screenshots.map(async (shot) => ({
        data: await dataUrlOf(shot.blob),
        alt: shot.alt,
      }))
    );
  } catch {
    screenshots = [];
  }
  const dropped = screenshots.length < values.screenshots.length;
  if (!dropped && store({ ...words, screenshots, screenshotsDropped: false })) {
    return;
  }
  store({
    ...words,
    screenshots: [],
    screenshotsDropped: values.screenshots.length > 0,
  });
}

const isStored = (value: unknown): value is Stored => {
  if (typeof value !== 'object' || value === null) return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.type === 'string' &&
    typeof draft.title === 'string' &&
    typeof draft.details === 'string' &&
    typeof draft.techDetails === 'boolean' &&
    typeof draft.screenshotsDropped === 'boolean' &&
    Array.isArray(draft.screenshots)
  );
};

/** The kept draft, if there is one; it stays until `clearDraft`. */
export function readDraft(): RestoredDraft | null {
  let stored: unknown;
  try {
    stored = JSON.parse(sessionStorage.getItem(KEY) ?? 'null');
  } catch {
    return null;
  }
  if (!isStored(stored)) return null;
  const screenshots: Screenshot[] = [];
  for (const { data, alt } of stored.screenshots) {
    const blob = typeof data === 'string' ? blobOf(data) : null;
    if (!blob) continue;
    screenshots.push({
      id: crypto.randomUUID(),
      blob,
      previewUrl: URL.createObjectURL(blob),
      alt: typeof alt === 'string' ? alt : '',
    });
  }
  return {
    values: {
      type: stored.type,
      title: stored.title,
      details: stored.details,
      techDetails: stored.techDetails,
      screenshots,
    },
    screenshotsDropped:
      stored.screenshotsDropped ||
      screenshots.length < stored.screenshots.length,
  };
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Storage is blocked: there's nothing kept to clear.
  }
}
