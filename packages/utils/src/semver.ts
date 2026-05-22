export const SEMVER_REGEX = /^([<>=~^]+)?(.+)$/;

/**
 * Compare two semver strings and return true if the challenge version satisfies the base version.
 * @example
 * ```ts
 * console.log(SEMVER_SATISFY("<1.2.3", "1.2.2"));   // true
 * console.log(SEMVER_SATISFY("<=1.2.3", "1.2.3"));  // true
 * console.log(SEMVER_SATISFY(">1.2.3", "1.3.0"));   // true
 * console.log(SEMVER_SATISFY("=1.2.3", "1.2.3"));   // true
 * console.log(SEMVER_SATISFY("^0.2.3", "0.2.5"));   // true
 * ```
 */
export function SEMVER_SATISFY(base: string, challenge: string): boolean {
  const match = base.match(SEMVER_REGEX);
  if (!match) {
    return false;
  }

  const [, op = "", ver] = match;
  const b = PARSE(ver!);
  const c = PARSE(challenge);

  switch (op) {
    case "~":
      return c[0] === b[0] && c[1] === b[1] && COMPARE(c, b) >= 0;
    case "^":
      // @ts-expect-error
      if (b[0]! > 0) return c[0] === b[0] && COMPARE(c, b) >= 0;
      // @ts-expect-error
      if (b[1]! > 0) return c[0] === b[0] && c[1] === b[1] && COMPARE(c, b) >= 0;
      return COMPARE(c, b) === 0;
    case ">":
      return COMPARE(c, b) > 0;
    case ">=":
      return COMPARE(c, b) >= 0;
    case "<":
      return COMPARE(c, b) < 0;
    case "<=":
      return COMPARE(c, b) <= 0;
    case "=":
      return COMPARE(c, b) === 0;
    default:
      return challenge === base;
  }
}

function PARSE(v: string) {
  const parts = v.split(".");
  // Normalize to 3 components, padding with "0" if needed
  while (parts.length < 3) {
    parts.push("0");
  }
  return parts;
}

function COMPARE(a: string[], b: string[]) {
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? "") < (b[i] ?? "")) return -1;
    if ((a[i] ?? "") > (b[i] ?? "")) return 1;
  }
  return 0;
}
