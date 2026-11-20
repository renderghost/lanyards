/** `ui` in the app header; `badge` on the owner's badge (#129). */
export type ShowQrButtonTone = 'ui' | 'badge';

export type ShowQrButtonProps = {
  tone?: ShowQrButtonTone;
  className?: string;
};
