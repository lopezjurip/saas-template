import { URL_NEW } from "@packages/utils/url";

/**
 * Same-origin redirect-target resolver shared by every auth route that honours
 * `?next=…`: callback, confirm, magic-link verify, etc.
 *
 * The contract: only accept paths that resolve to the same origin as the incoming
 * request. Anything else (open redirect attempt, malformed value, missing param) falls
 * back to `${origin}/[locale]/home`. We deliberately do this in one place so every route
 * stays locked down and the fallback target can be changed in one edit.
 */
export function RESOLVE_AUTH_NEXT(raw: string | null, origin: string): string {
  const fallback = `${origin}/[locale]/home`;
  if (!raw) {
    return fallback;
  }
  try {
    const candidate = URL_NEW(raw, origin);
    if (candidate.origin !== origin) {
      return fallback;
    }
    return candidate.toString();
  } catch {
    return fallback;
  }
}
