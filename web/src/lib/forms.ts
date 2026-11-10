type FieldBlur = {
  currentTarget: Element;
  relatedTarget: EventTarget | null;
};

/**
 * True when a field loses focus to its own form's submit button. Checking
 * the field then would add an error above the button between mouse down
 * and mouse up, moving it so the click (and the submit) is lost; the
 * submit checks every field anyway.
 */
export function leavingForSubmit(event: FieldBlur): boolean {
  const next = event.relatedTarget;
  const field = event.currentTarget as HTMLInputElement;
  return (
    next instanceof HTMLButtonElement &&
    next.type === 'submit' &&
    next.form !== null &&
    next.form === field.form
  );
}
