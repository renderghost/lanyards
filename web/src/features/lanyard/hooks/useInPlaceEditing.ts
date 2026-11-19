import { useEffect, useRef, useState } from 'react';

/** The open form's key while a new record is being added. */
export const ADDING = 'adding';
/** The focus target for the Add button. */
export const ADD_BUTTON = 'add';
/** The focus target for whichever form is open. */
const FORM = 'form';

/**
 * One kept-record list edited in place (#118): at most one form open, a
 * record's or the new one's. Focus moves into the form when it opens, and
 * back to a control that stays when it closes; each change is announced.
 */
export function useInPlaceEditing() {
  const [open, setOpen] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const targets = useRef(new Map<string, HTMLElement>());
  /** Where focus goes once the next render is on screen. */
  const pending = useRef<string | null>(null);

  useEffect(() => {
    const key = pending.current;
    if (key === null) return;
    pending.current = null;
    // A record whose Edit went away (merged with another link) hands focus
    // to Add, which is always there.
    const node = targets.current.get(key) ?? targets.current.get(ADD_BUTTON);
    const field = node?.querySelector<HTMLElement>('input, select, textarea');
    (field ?? node)?.focus();
  });

  return {
    /** The open form: a record's key, ADDING, or null. */
    open,
    announcement,
    /** A ref for a focus target: a record's Edit button, or ADD_BUTTON. */
    target: (key: string) => (node: HTMLElement | null) => {
      if (node) targets.current.set(key, node);
      else targets.current.delete(key);
    },
    /** A ref for the open form's wrapper. */
    form: (node: HTMLElement | null) => {
      if (node) targets.current.set(FORM, node);
      else targets.current.delete(FORM);
    },
    start(key: string) {
      setOpen(key);
      pending.current = FORM;
    },
    /** Closes the form; focus goes to `focusOn`, and `message` is said. */
    finish(focusOn: string, message?: string) {
      setOpen(null);
      pending.current = focusOn;
      if (message) setAnnouncement(message);
    },
  };
}
