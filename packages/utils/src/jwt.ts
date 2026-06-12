/**
 * Decode the payload (second segment) of a JWT without verifying its signature.
 * Returns `null` for malformed input. Pure function — does not touch I/O or crypto.
 *
 * Use only for reading hook-injected claims from a token whose signature has
 * already been validated upstream (e.g. by Supabase `updateSession`).
 */
export function JWT_DECODE_PAYLOAD(token: string): unknown {
  const segment = token.split(".")[1];
  if (!segment) return null;
  try {
    const padded = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(segment.length / 4) * 4, "=");
    return JSON.parse(atob(padded));
  } catch {
    console.warn("[JWT_DECODE_PAYLOAD] failed to decode payload for token: %s", token);
    return null;
  }
}
