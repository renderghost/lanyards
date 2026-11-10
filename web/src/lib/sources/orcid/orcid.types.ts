export type OrcidWork = {
  /** `orcid:<iD>/<put-code>`, as stored in a lanyard's `hidden`. */
  key: string;
  title: string;
  /** Normalised, e.g. '10.5555/12345680'. */
  doi?: string;
  year?: string;
  venue?: string;
  url?: string;
};
