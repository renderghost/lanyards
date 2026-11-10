/**
 * Test utility: reads the custom properties declared for a selector in a
 * stylesheet. Only rules at the top level are considered, unless `media` is
 * given, in which case only rules inside that exact `@media` block count.
 * Selector lists match when any of their selectors equals `selector`.
 */
export function readCssVars(
  css: string,
  selector: string,
  media?: string
): Record<string, string> {
  const source = stripComments(css);
  const scope = media ? mediaBody(source, media) : topLevelOnly(source);
  const vars: Record<string, string> = {};

  for (const rule of rules(scope)) {
    const selectors = rule.prelude.split(',').map((s) => normalise(s));
    if (!selectors.includes(normalise(selector))) continue;
    for (const declaration of rule.body.split(';')) {
      const match = declaration.match(/^\s*(--[\w-]+)\s*:\s*([\s\S]+?)\s*$/);
      if (match?.[1] && match[2]) vars[match[1]] = match[2];
    }
  }
  return vars;
}

type Rule = { prelude: string; body: string };

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function normalise(selector: string): string {
  return selector.trim().replace(/\s+/g, ' ').replace(/"/g, "'");
}

/** Splits a block of CSS into its direct child rules. */
function rules(css: string): Rule[] {
  const result: Rule[] = [];
  let depth = 0;
  let start = 0;
  let preludeEnd = -1;
  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    if (char === '{') {
      if (depth === 0) preludeEnd = i;
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        result.push({
          prelude: css.slice(start, preludeEnd).trim(),
          body: css.slice(preludeEnd + 1, i),
        });
        start = i + 1;
      }
    } else if (char === ';' && depth === 0) {
      start = i + 1;
    }
  }
  return result;
}

function topLevelOnly(css: string): string {
  return rules(css)
    .filter((rule) => !rule.prelude.startsWith('@'))
    .map((rule) => `${rule.prelude}{${rule.body}}`)
    .join('\n');
}

function mediaBody(css: string, media: string): string {
  const wanted = `@media ${media}`.replace(/\s+/g, ' ');
  return rules(css)
    .filter((rule) => rule.prelude.replace(/\s+/g, ' ') === wanted)
    .map((rule) => rule.body)
    .join('\n');
}
