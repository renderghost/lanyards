export type CodeRepo = {
  /** AT-URI of the repository manifest (or declaration, in the fallback). */
  key: string;
  name: string;
  description?: string;
  url: string;
  createdAt?: string;
};
