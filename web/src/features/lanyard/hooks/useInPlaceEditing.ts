import { useEffect, useRef, useState } from 'react';

/** The open form's key while a new record is being added. */
export const ADDING = 'adding';
/** The focus target for the Add button. */
export const ADD_BUTTON = 'add';

/**
 * One kept-record list edited through a dialog (#118): at most one form
 * open, a record's or the new one's. The dialog hands focus back to what
 * opened it; after a delete, focus moves to a control that stays. Each
 * change is announced.
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
    (targets.current.get(key) ?? targets.current.get(ADD_BUTTON))?.focus();
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
    start(key: string) {
      setOpen(key);
    },
    /** Closes the form, saying `message`; the dialog returns focus. */
    close(message?: string) {
      setOpen(null);
      if (message) setAnnouncement(message);
    },
    /** Moves focus to `focusOn` once rendered, saying `message`. */
    moveFocus(focusOn: string, message?: string) {
      pending.current = focusOn;
      if (message) setAnnouncement(message);
    },
  };
}
