import type { ReactNode } from 'react';

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

export type AccordionProps = {
  items: AccordionItem[];
  /** Ids of the sections that start open. */
  defaultOpen?: string[];
  headingLevel?: 2 | 3;
};
