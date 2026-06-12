import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useCookieStore } from "./use-cookie-store";

afterEach(() => {
  // Clear cookies jsdom may have retained between tests.
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]?.trim();
    // biome-ignore lint/suspicious/noDocumentCookie: test-only cleanup; expiring cookies needs a direct write.
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
});

describe("useCookieStore", () => {
  /**
   * Returns a stable reference across renders.
   */
  it("returns a stable reference across renders", () => {
    const { result, rerender } = renderHook(() => useCookieStore());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  /**
   * Writes a cookie via the polyfill (jsdom has no native Cookie Store).
   */
  it("writes a cookie via the polyfill (jsdom has no native Cookie Store)", () => {
    const { result } = renderHook(() => useCookieStore());
    result.current.set("humane_locale", "es");
    expect(document.cookie).toContain("humane_locale=es");
  });

  /**
   * URL-encodes the value.
   */
  it("url-encodes the value", () => {
    const { result } = renderHook(() => useCookieStore());
    result.current.set("k", "a b");
    expect(document.cookie).toContain("k=a%20b");
  });
});
