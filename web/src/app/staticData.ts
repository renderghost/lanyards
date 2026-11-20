// Route options read by the root layout (TanStack Router `staticData`).
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /**
     * The route renders its own AppHeader (with its own actions) and its
     * own <main>, so the root layout renders neither.
     */
    ownHeader?: boolean;
    /**
     * The app header offers signed-out visitors Sign in and Make your
     * lanyard (lanyard pages, #129).
     */
    signedOutActions?: boolean;
    /**
     * The route fills the screen itself (Show QR, #150): the root layout
     * renders no header, no <main> and no navigation around it.
     */
    fullScreen?: boolean;
  }
}

export {};
