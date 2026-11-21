import { describe, expect, it } from 'vitest';

import { buttonClassName } from './buttonClassName';

// A link that looks like a button (#162) gets the button's classes, merged
// as the button merges them, so a size's padding wins over the base's.
describe('buttonClassName', () => {
  it('is the ui primary button at the default size', () => {
    const classes = buttonClassName().split(' ');
    expect(classes).toContain('bg-ui-primary');
    expect(classes).toContain('min-h-11');
  });

  it('keeps one value per property, the most specific winning', () => {
    const classes = buttonClassName({
      tone: 'badge',
      size: 'lg',
      className: 'px-3 text-sm leading-5',
    }).split(' ');
    expect(classes).toContain('bg-badge-button');
    expect(classes).toContain('px-3');
    expect(classes).not.toContain('px-4');
    expect(classes).not.toContain('px-6');
    expect(classes).toContain('text-sm');
    expect(classes).not.toContain('text-lg');
    // The badge tone's weight, not the base's.
    expect(classes).toContain('font-semibold');
    expect(classes).not.toContain('font-medium');
  });
});
