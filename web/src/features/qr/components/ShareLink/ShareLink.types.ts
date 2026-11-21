/** `ui` in the app header; `badge` on the owner's badge (#129). */
export type ShareLinkTone = 'ui' | 'badge';

export type ShareLinkProps = {
  tone?: ShareLinkTone;
  className?: string;
};
