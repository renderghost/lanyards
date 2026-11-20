/** A UserInput image's size limit (#134). */
export const MAX_IMAGE_BYTES = 1_000_000;

export const MAX_SCREENSHOTS = 4;

export const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;

/** The longest side a screenshot keeps: sharp on any screen we'd show. */
const MAX_SIDE = 2560;

const QUALITIES = [0.85, 0.7, 0.55];
const SCALE_STEP = 0.75;
const SCALE_QUALITY = 0.7;
const MIN_SCALE = 0.2;

/** A screenshot on its way into feedback: already re-encoded to send. */
export type Screenshot = {
  id: string;
  blob: Blob;
  /** An object URL for its thumbnail; revoked when it's removed. */
  previewUrl: string;
  alt: string;
};

/** No size and quality we try brings the image under the limit. */
export class ImageTooLargeError extends Error {
  override name = 'ImageTooLargeError';
}

export const isAccepted = (type: string): boolean =>
  (ACCEPTED_TYPES as readonly string[]).includes(type);

/**
 * The first encoding under `maxBytes`: at full size, stepping the quality
 * down, then smaller and smaller, to a fifth of the size at most.
 */
export async function fitUnder(
  maxBytes: number,
  encode: (scale: number, quality: number) => Promise<Blob>
): Promise<Blob> {
  for (const quality of QUALITIES) {
    const blob = await encode(1, quality);
    if (blob.size <= maxBytes) return blob;
  }
  for (let scale = SCALE_STEP; scale >= MIN_SCALE; scale *= SCALE_STEP) {
    const blob = await encode(scale, SCALE_QUALITY);
    if (blob.size <= maxBytes) return blob;
  }
  throw new ImageTooLargeError();
}

function toBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Could not encode the image')),
      type,
      quality
    );
  });
}

/**
 * The image re-encoded to send: WebP (JPEG where the browser can't write
 * WebP), at most 2,560 px on its longest side, under 1 MB. Re-encoding
 * also drops its metadata, such as where a photo was taken.
 */
export async function prepareImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const base = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    let type = 'image/webp';
    const encode = async (scale: number, quality: number) => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * base * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * base * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('No canvas to encode the image with');
      if (type === 'image/jpeg') {
        // JPEG has no transparency: put see-through areas on white.
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      let blob = await toBlob(canvas, type, quality);
      if (blob.type !== type) {
        // The browser can't write WebP (it fell back to PNG): use JPEG.
        type = 'image/jpeg';
        blob = await encode(scale, quality);
      }
      return blob;
    };
    return await fitUnder(MAX_IMAGE_BYTES, encode);
  } finally {
    bitmap.close();
  }
}

/** Desktop browsers that can capture a tab or the screen. */
export function canCaptureScreen(): boolean {
  return typeof navigator.mediaDevices?.getDisplayMedia === 'function';
}

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/**
 * One frame of what the person chooses to share, as a PNG: the browser
 * asks them first, and preferably offers the current tab. Sharing stops
 * as soon as the frame is taken.
 */
export async function captureScreen(): Promise<Blob> {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { displaySurface: 'browser' },
    audio: false,
    preferCurrentTab: true,
  } as DisplayMediaStreamOptions);
  try {
    const video = document.createElement('video');
    video.muted = true;
    video.srcObject = stream;
    await video.play();
    // Let a frame or two arrive, without whatever was just hidden.
    await nextFrame();
    await nextFrame();
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return await toBlob(canvas, 'image/png', 1);
  } finally {
    for (const track of stream.getTracks()) track.stop();
  }
}
