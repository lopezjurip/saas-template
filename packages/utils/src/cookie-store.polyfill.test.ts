import { afterEach, describe, expect, it, vi } from "vitest";
import { cookieStorePolyfill } from "./cookie-store.polyfill";

function stubDocument(): { written: string } {
  const sink = { written: "" };
  vi.stubGlobal("document", {
    set cookie(value: string) {
      sink.written = value;
    },
  });
  return sink;
}

describe("cookieStorePolyfill.set", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("writes document.cookie with a Max-Age derived from expires", async () => {
    const sink = stubDocument();
    await cookieStorePolyfill.set({ name: "k", value: "v", expires: Date.now() + 60_000, sameSite: "lax" });
    expect(sink.written).toMatch(/^k=v; Path=\/; Max-Age=(59|60); SameSite=Lax$/);
  });

  it("omits Max-Age for a session cookie (expires: null)", async () => {
    const sink = stubDocument();
    await cookieStorePolyfill.set({ name: "k", value: "v", expires: null });
    expect(sink.written).toBe("k=v; Path=/; SameSite=Lax");
  });

  it("maps sameSite none to Secure", async () => {
    const sink = stubDocument();
    await cookieStorePolyfill.set({ name: "k", value: "v", expires: null, sameSite: "none" });
    expect(sink.written).toContain("SameSite=None; Secure");
  });

  it("persists a bare two-arg set via the document.cookie sink", async () => {
    const sink = stubDocument();
    await cookieStorePolyfill.set("k", "a b");
    expect(sink.written).toContain("k=a%20b");
  });
});

describe("cookieStorePolyfill.get", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("reads and url-decodes a named cookie, returning null when absent", async () => {
    vi.stubGlobal("document", { cookie: "humane_locale=es; k=a%20b" });
    expect(await cookieStorePolyfill.get("humane_locale")).toEqual({ name: "humane_locale", value: "es" });
    expect(await cookieStorePolyfill.get("k")).toEqual({ name: "k", value: "a b" });
    expect(await cookieStorePolyfill.get("missing")).toBeNull();
    expect(await cookieStorePolyfill.get({ name: "humane_locale" })).toEqual({ name: "humane_locale", value: "es" });
  });
});
