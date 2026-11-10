/** The customiser's own path, to come back to after sign-in or approval. */
export const CUSTOMISE_PATH = '/lanyard';

/** Where signed-out visitors are sent, returning here after sign-in. */
export const SIGN_IN_PATH = `/?returnTo=${encodeURIComponent(CUSTOMISE_PATH)}`;
