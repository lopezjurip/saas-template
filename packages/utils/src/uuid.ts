/** Valid UUID */
export const UUID_ZERO = "00000000-0000-0000-0000-000000000000";

export const UUID_REGEX = /*#__PURE__*/ /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Show last N characters of a UUID.
 * UUID are composed of 32 hexadecimal characters, in parts: 8-4-4-4-12
 *
 * Keep in mind UUIDv7 are lexicographically sortable, so the first characters are very similar and the last characters are more entropic.
 *
 * @example
 * UUID_FORMAT("01986610-a18a-7738-95de-8e8daec01fb8", { n: 8, strategy: "first", dots: true }) // "01986610..."
 */
export function UUID_FORMAT(
  uuid: string,
  {
    n = 6,
    strategy = "last",
    dots = false,
  }: { n?: number; strategy?: "first" | "last" | "middle"; dots?: boolean } = {},
): string {
  if (!uuid || uuid.length < n) {
    return uuid;
  }
  /** Remove dashes for consistent formatting */
  const uuid_cleaned = uuid.replace(/-/g, "");
  const dots_string = dots ? "..." : "";
  switch (strategy) {
    case "first":
      return `${uuid_cleaned.slice(0, n)}${dots_string}`;
    case "last":
      return `${dots_string}${uuid_cleaned.slice(-n)}`;
    case "middle": {
      const start = Math.floor((uuid_cleaned.length - n) / 2);
      return `${dots_string}${uuid_cleaned.slice(start, start + n)}${dots_string}`;
    }
  }
}
