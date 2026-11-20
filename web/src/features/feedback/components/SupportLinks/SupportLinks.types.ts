export type SupportLinksProps = {
  /** Show "Beta support" as its heading; off where a sheet already says it. */
  heading?: boolean;
  /** Called as feedback opens, e.g. to close the sheet these are in. */
  onChoose?(): void;
  /** Where focus goes when feedback closes; the button itself by default. */
  returnFocus?(): void;
  className?: string;
};
