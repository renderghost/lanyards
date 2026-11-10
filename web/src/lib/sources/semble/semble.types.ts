export type SembleLink = {
  /** AT-URI of the network.cosmik.card record. */
  key: string;
  title: string;
  url: string;
  siteName?: string;
};

export type SembleCollection = {
  /** AT-URI of the network.cosmik.collection record. */
  key: string;
  name: string;
  description?: string;
  url: string;
  links: SembleLink[];
};
