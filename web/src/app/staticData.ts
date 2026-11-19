// Route options read by the root layout (TanStack Router `staticData`).
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    /**
     * The route renders its own AppHeader (with its own actions) and its
     * own <main>, so the root layout renders neither.
     */
    ownHeader?: boolean;
  }
}

export {};
