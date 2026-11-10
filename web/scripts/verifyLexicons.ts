/**
 * Compares a local lexicon document with its published copy and returns the
 * JSON paths that differ. The `$type` a com.atproto.lexicon.schema record
 * carries at its top level is ignored.
 */
export function compareLexicon(local: object, published: object): string[] {
  const { $type: _type, ...rest } = published as Record<string, unknown>;
  return diff(local, rest, '');
}

function diff(a: unknown, b: unknown, path: string): string[] {
  if (isObject(a) && isObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    return [...keys].flatMap((key) =>
      diff(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        join(path, key)
      )
    );
  }
  return Object.is(a, b) ? [] : [path];
}

const isObject = (value: unknown): value is object =>
  typeof value === 'object' && value !== null;

const join = (path: string, key: string) => (path ? `${path}.${key}` : key);
