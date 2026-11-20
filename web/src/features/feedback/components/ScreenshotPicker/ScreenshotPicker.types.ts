import type { Screenshot } from '../../images';

export type ScreenshotPickerProps = {
  value: Screenshot[];
  onChange(next: Screenshot[]): void;
  /**
   * Captures the screen as an image, hiding whatever covers it first. The
   * Capture button shows only with it, and where the browser can capture.
   */
  capture?: () => Promise<Blob>;
  className?: string;
};
