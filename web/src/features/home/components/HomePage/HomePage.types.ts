import type { ReactNode } from 'react';

export type HomePageProps = {
  /** The sign-in form, where the old homepage had "Get started". */
  signIn: ReactNode;
  className?: string;
};
