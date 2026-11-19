import { ChevronDown } from 'lucide-react';
import { Accordion as Primitive } from 'radix-ui';

import * as styles from './Accordion.styles';
import type { AccordionProps } from './Accordion.types';

/**
 * Stacked disclosures, any number open at once. Each title is a heading
 * holding a button that shows or hides its section.
 */
export function Accordion({
  items,
  defaultOpen = [],
  headingLevel = 3,
}: AccordionProps) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Primitive.Root
      type="multiple"
      defaultValue={defaultOpen}
      className={styles.root}
    >
      {items.map((item) => (
        <Primitive.Item key={item.id} value={item.id} className={styles.item}>
          <Primitive.Header asChild>
            <Heading className={styles.heading}>
              <Primitive.Trigger className={styles.trigger}>
                {item.title}
                <ChevronDown className={styles.chevron} aria-hidden="true" />
              </Primitive.Trigger>
            </Heading>
          </Primitive.Header>
          <Primitive.Content className={styles.content}>
            {item.content}
          </Primitive.Content>
        </Primitive.Item>
      ))}
    </Primitive.Root>
  );
}
