import type { Did } from '@atcute/lexicons';

export type LanyardPageProps = {
  did: Did;
  /** The handle in the URL, for messages before the profile loads. */
  handle?: string;
  /**
   * Shows the lanyard inside the customiser, as its owner or a visitor
   * would see it: no tab title, view tracking, shared context or actions.
   */
  preview?: 'owner' | 'visitor';
  className?: string;
};
