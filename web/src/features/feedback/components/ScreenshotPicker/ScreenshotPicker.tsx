import { useLingui } from '@lingui/react/macro';
import { Camera, ImagePlus } from 'lucide-react';
import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/Button/Button';
import { captureError } from '@/lib/analytics/analytics';
import { cn } from '@/lib/utils';

import {
  canCaptureScreen,
  isAccepted,
  MAX_SCREENSHOTS,
  prepareImage,
  type Screenshot,
} from '../../images';
import { ACCEPT, ALT_MAX_LENGTH } from './ScreenshotPicker.constants';
import * as styles from './ScreenshotPicker.styles';
import type { ScreenshotPickerProps } from './ScreenshotPicker.types';

const imagesIn = (data: DataTransfer | null): File[] =>
  [...(data?.items ?? [])]
    .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
    .map((item) => item.getAsFile())
    .filter((file): file is File => file !== null);

/**
 * Up to four screenshots for feedback (#134): chosen, pasted anywhere in
 * the form, dropped, or captured from the screen on desktop. Each is
 * re-encoded on arrival to what will be sent, and has its own alt text.
 */
export function ScreenshotPicker({
  value,
  onChange,
  capture,
  className,
}: ScreenshotPickerProps) {
  const { t } = useLingui();
  const id = useId();
  const root = useRef<HTMLFieldSetElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());
  /** The screenshots as last rendered, for adds that finish later. */
  const latest = useRef(value);
  useLayoutEffect(() => {
    latest.current = value;
  }, [value]);
  /** Where focus goes once a removal has rendered. */
  const focusAfterRemove = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  async function add(files: File[]) {
    setError(null);
    const images = files.filter((file) => isAccepted(file.type));
    if (images.length < files.length) {
      setError(t`Choose PNG, JPEG, WebP or GIF images`);
    }
    const room = MAX_SCREENSHOTS - latest.current.length;
    if (images.length > room) setError(t`Up to 4 screenshots`);
    const taken = images.slice(0, Math.max(0, room));
    if (taken.length === 0) return;

    setPreparing(true);
    try {
      const prepared = await Promise.all(
        taken.map(async (file) => {
          const blob = await prepareImage(file);
          return {
            id: crypto.randomUUID(),
            blob,
            previewUrl: URL.createObjectURL(blob),
            alt: '',
          } satisfies Screenshot;
        })
      );
      onChange([...latest.current, ...prepared]);
    } catch (cause) {
      captureError(cause, { source: 'feedback-image' });
      setError(t`Couldn't use that image. Please try another.`);
    } finally {
      setPreparing(false);
    }
  }

  // Pasting an image anywhere in the form attaches it; text pastes as text.
  const onPaste = useEffectEvent((event: Event) => {
    const files = imagesIn((event as ClipboardEvent).clipboardData);
    if (files.length === 0) return;
    event.preventDefault();
    void add(files);
  });
  useEffect(() => {
    const scope = root.current?.closest('form') ?? root.current;
    if (!scope) return;
    scope.addEventListener('paste', onPaste);
    return () => scope.removeEventListener('paste', onPaste);
  }, []);

  useEffect(() => {
    const index = focusAfterRemove.current;
    if (index === null) return;
    focusAfterRemove.current = null;
    const next = value[Math.min(index, value.length - 1)];
    (next ? removeButtons.current.get(next.id) : addButton.current)?.focus();
  }, [value]);

  function remove(index: number) {
    const gone = value[index];
    if (gone) URL.revokeObjectURL(gone.previewUrl);
    focusAfterRemove.current = index;
    onChange(value.filter((_, at) => at !== index));
  }

  function describe(index: number, alt: string) {
    onChange(value.map((shot, at) => (at === index ? { ...shot, alt } : shot)));
  }

  async function captureNow() {
    if (!capture) return;
    try {
      const blob = await capture();
      await add([new File([blob], 'screen.png', { type: blob.type })]);
    } catch (cause) {
      // Choosing not to share isn't a failure.
      if (cause instanceof DOMException && cause.name === 'NotAllowedError') {
        return;
      }
      captureError(cause, { source: 'feedback-capture' });
      setError(t`Couldn't capture the screen. Please try again.`);
    }
  }

  const full = value.length >= MAX_SCREENSHOTS;

  return (
    <fieldset
      ref={root}
      className={cn(styles.fieldset, className)}
      aria-describedby={error ? `${hintId} ${errorId}` : hintId}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void add([...event.dataTransfer.files]);
      }}
    >
      <legend className={styles.legend}>{t`Screenshots (optional)`}</legend>
      <p id={hintId} className={styles.hint}>
        {t`Up to 4. Choose, paste or drop images.`}
      </p>
      <input
        ref={fileInput}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          event.target.value = '';
          void add(files);
        }}
      />
      <div className={styles.actions}>
        <Button
          ref={addButton}
          variant="secondary"
          disabled={full}
          onClick={() => fileInput.current?.click()}
        >
          <ImagePlus aria-hidden="true" className={styles.icon} />
          {t`Add screenshots`}
        </Button>
        {capture && canCaptureScreen() && (
          <Button
            variant="secondary"
            disabled={full}
            onClick={() => void captureNow()}
          >
            <Camera aria-hidden="true" className={styles.icon} />
            {t`Capture this screen`}
          </Button>
        )}
      </div>
      {preparing && (
        <p role="status" className={styles.status}>
          {t`Preparing screenshot…`}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {value.length > 0 && (
        <ul className={styles.list}>
          {value.map((shot, index) => {
            const number = index + 1;
            const altId = `${id}-alt-${shot.id}`;
            return (
              <li key={shot.id} className={styles.item}>
                <img
                  src={shot.previewUrl}
                  alt={t`Screenshot ${number}`}
                  className={styles.thumbnail}
                />
                <div className={styles.fields}>
                  <label htmlFor={altId} className={styles.label}>
                    {t`Describe screenshot ${number}`}
                  </label>
                  <input
                    id={altId}
                    type="text"
                    maxLength={ALT_MAX_LENGTH}
                    value={shot.alt}
                    onChange={(event) => describe(index, event.target.value)}
                    className={styles.input}
                  />
                </div>
                <Button
                  ref={(button) => {
                    if (button) removeButtons.current.set(shot.id, button);
                    else removeButtons.current.delete(shot.id);
                  }}
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  {t`Remove screenshot ${number}`}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}
