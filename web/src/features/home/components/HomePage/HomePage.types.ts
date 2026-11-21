export type HomePageProps = {
  /** The badge's front, or its back with the sign-in form (#175). */
  face?: 'front' | 'back';
  /** Where signing in returns to, from the back. */
  returnTo?: string;
  className?: string;
};
