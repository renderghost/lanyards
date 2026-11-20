import type { ReactNode } from 'react';

export type CustomiserSidebarProps = {
  /** The style sidebar while editing; nothing when viewing as public. */
  children?: ReactNode;
  className?: string;
};
