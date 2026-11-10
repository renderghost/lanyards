export type PermissionNoticeProps = {
  /** Where to come back to after approving. */
  returnTo: string;
  /**
   * Move focus to the notice when it appears, for a notice shown in answer
   * to an action (such as pressing Follow), so the change is announced.
   */
  focusOnShow?: boolean;
  className?: string;
};
