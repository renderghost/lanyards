export const link =
  'text-foreground underline-offset-4 hover:underline [overflow-wrap:anywhere]';

// On the public lanyard the link covers its card: a click anywhere opens
// it, while it stays the card's one link for keyboards and screen readers.
// Its focus ring shows on the card instead (CardItem).
export const stretched =
  'after:absolute after:inset-0 after:rounded-xl after:content-[""] focus-visible:outline-none';
