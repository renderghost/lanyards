import type { ReactNode } from 'react';

export type AppHeaderProps = {
  /**
   * A page's own controls, such as the customiser's Save and Reset: before
   * Show QR and Account, and the only ones in the top bar on phones.
   */
  actions?: ReactNode;
  /** Offer Sign in and Make your lanyard when signed out (#129). */
  signedOutActions?: boolean;
  className?: string;
};
