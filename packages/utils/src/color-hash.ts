import ColorHash from "color-hash";

/**
 * Create a deterministic color based on a string.
 * @example
 * const color = COLOR_HASH.hex(profile_id);
 */
export const COLOR_HASH = /*#__PURE__*/ new ColorHash();
