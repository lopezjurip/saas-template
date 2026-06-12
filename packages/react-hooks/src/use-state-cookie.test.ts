import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useStateCookie } from "./use-state-cookie";

afterEach(() => {
  for (const pair of document.cookie.split(";")) {
    const name = pair.split("=")[0]?.trim();
    // biome-ignore lint/suspicious/noDocumentCookie: test-only cleanup; expiring cookies needs a direct write.
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
});

describe("useStateCookie", () => {
  /**
   * Renders the SSR-provided initial value without reading the cookie.
   * No cookie set, yet the hook honors the provided initial value (no client-side read).
   */
  it("renders the SSR-provided initial value without reading the cookie", () => {
    const { result } = renderHook(() => useStateCookie("humane_sidebar_w", 260));
    expect(result.current[0]).toBe(260);
    expect(document.cookie).not.toContain("humane_sidebar_w");
  });

  /**
   * Updates state and writes the cookie on set.
   */
  it("updates state and writes the cookie on set", () => {
    const { result } = renderHook(() => useStateCookie("humane_sidebar_w", 260, { maxAgeMs: 1000 }));
    act(() => result.current[1](320));
    expect(result.current[0]).toBe(320);
    expect(document.cookie).toContain("humane_sidebar_w=320");
  });

  /**
   * Supports functional updates against the latest value.
   */
  it("supports functional updates against the latest value", () => {
    const { result } = renderHook(() => useStateCookie("humane_sidebar_w", 260));
    act(() => result.current[1]((prev) => prev + 40));
    expect(result.current[0]).toBe(300);
    expect(document.cookie).toContain("humane_sidebar_w=300");
  });
});
