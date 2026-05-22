function stringify(
  val: any, // intentionally broad to mirror JS behavior
  allowUndefined?: boolean,
): string | number | null | undefined {
  const type_of = typeof val;

  if (type_of === "string") return JSON.stringify(val)!;
  if (val === true) return "true";
  if (val === false) return "false";
  if (val === null) return "null";

  if (Array.isArray(val)) {
    let str = "[";
    const max = val.length - 1;
    let i = 0;
    for (i = 0; i < max; i++) {
      str += `${stringify(val[i], false)},`;
    }
    if (max > -1) {
      str += stringify(val[i], false);
    }
    return `${str}]`;
  }

  // Objects (including functions) — arrays already handled above
  if (type_of === "object" || type_of === "function") {
    if (val && typeof val.toJSON === "function") {
      return stringify(val.toJSON(), allowUndefined);
    }

    const keys = Object.keys(val ?? {}).sort();
    const max = keys.length;
    let str = "";
    let i = 0;

    while (i < max) {
      const key = keys[i];
      const propVal = stringify((val as any)[key as string], true);
      if (propVal !== undefined) {
        if (i && str !== "") {
          str += ",";
        }
        str += `${JSON.stringify(key)!}:${propVal}`;
      }
      i++;
    }
    return `{${str}}`;
  }

  // Primitives other than string/boolean/null handled above
  switch (type_of) {
    // @ts-expect-error
    case "function": // unreachable due to object/func block, kept for parity
    case "undefined":
      return allowUndefined ? undefined : null;
    default:
      // Match original intent without throwing on non-numbers.
      return Number.isFinite(val) ? (val as number) : null;
  }
}

/**
 * Useful for stable stringification of objects.
 * From https://github.com/streamich/fastest-stable-stringify
 */
export function STRINGIFY_STABLE(obj: unknown): string {
  return `${stringify(obj, false)}`;
}
