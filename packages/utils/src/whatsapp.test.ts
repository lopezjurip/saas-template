import { describe, expect, it } from "vitest";
import { WHATSAPP_URL } from "./whatsapp";

describe("WHATSAPP_URL", () => {
  it("adds + prefix to bare digits", () => {
    const url = WHATSAPP_URL("56990511003");
    expect(url.pathname).toBe("/+56990511003");
    expect(url.searchParams.get("text")).toBeNull();
  });

  it("normalizes phone that already has + prefix", () => {
    const url = WHATSAPP_URL("+56990511003");
    expect(url.pathname).toBe("/+56990511003");
  });

  it("strips spaces and dashes", () => {
    const url = WHATSAPP_URL("+56 990 511-003");
    expect(url.pathname).toBe("/+56990511003");
  });

  it("includes text as query param", () => {
    const url = WHATSAPP_URL("56990511003", "Hola mundo");
    expect(url.searchParams.get("text")).toBe("Hola mundo");
  });

  it("omits text param when not provided", () => {
    const url = WHATSAPP_URL("18159892069");
    expect(url.searchParams.has("text")).toBe(false);
  });

  it("returns a valid wa.me URL", () => {
    const url = WHATSAPP_URL("56990511003", "test");
    expect(url.hostname).toBe("wa.me");
    expect(url.protocol).toBe("https:");
  });
});
