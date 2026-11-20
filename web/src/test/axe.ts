import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Fails the test with every axe violation found in `container`.
 * Colour contrast is excluded: jsdom cannot compute colours. Contrast is
 * enforced by the palette tests and by Playwright + axe in a real browser.
 * Frames aren't entered: jsdom can't run axe inside them, and a framed
 * page is checked on its own.
 *
 * `exclude` leaves out parts CSS would hide: jsdom applies no styles, so
 * it sees both of two parts that are never shown together.
 */
export async function expectNoAxeViolations(
  container: Element,
  { exclude = [] }: { exclude?: string[] } = {}
): Promise<void> {
  const context = exclude.length
    ? { include: [container], exclude: exclude.map((selector) => [selector]) }
    : container;
  const results = await axe.run(context, {
    rules: { 'color-contrast': { enabled: false } },
    iframes: false,
  });
  const violations = results.violations.map(
    (v) =>
      `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
  );
  expect(violations).toEqual([]);
}
