export type BlogPost = {
  /** AT-URI of the site.standard.document record. */
  key: string;
  title: string;
  url: string;
  publicationName?: string;
  publishedAt: string;
};
