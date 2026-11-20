/**
 * A discussion's body (#134): the details, then the technical details in
 * a fenced block when the person chose to include them.
 */
export function feedbackBody(details: string, techDetails?: string): string {
  const text = details.trim();
  if (!techDetails) return text;
  const block = `---\n\n\`\`\`\n${techDetails}\n\`\`\``;
  return text ? `${text}\n\n${block}` : block;
}
