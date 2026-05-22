/** Validates a slug: lowercase alphanumeric, hyphens allowed in the middle, 3–40 characters. */
export const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]{1,38}[a-z0-9])?$/;

/**
 * URL Safe (TODO: be sure)
 * @see https://jasonwatmore.com/vanilla-js-slugify-a-string-in-javascript
 */
export function SLUGIFY(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}
