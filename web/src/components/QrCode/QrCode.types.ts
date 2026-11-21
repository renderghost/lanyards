import type { ReactNode } from 'react';

export type QrCodeProps = {
  /** The text to encode, normally a lanyard URL. */
  value: string;
  /**
   * A picture over the code's centre, such as the person's avatar (#169).
   * With one, the code uses level H error correction, so it still scans.
   */
  centre?: ReactNode;
  className?: string;
};
