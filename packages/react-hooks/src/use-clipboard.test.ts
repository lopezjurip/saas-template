import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useClipboard } from "./use-clipboard";

const mockWriteText = vi.fn();

beforeEach(() => {
  mockWriteText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
});

describe("useClipboard", () => {
  it("copies text, calls writeText, and sets copied to true", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(mockWriteText).toHaveBeenCalledWith("hello");
    expect(result.current.copied).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it("resets copied after resetDelay", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useClipboard({ resetDelay: 1000 }));

    await act(async () => {
      await result.current.copy("hello");
    });
    expect(result.current.copied).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.copied).toBe(false);

    vi.useRealTimers();
  });

  it("sets error and keeps copied false when writeText rejects", async () => {
    const err = new Error("Clipboard unavailable");
    mockWriteText.mockRejectedValue(err);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("hello");
    });

    expect(result.current.copied).toBe(false);
    expect(result.current.error).toBe(err);
  });

  it("clears a previous error on successful copy", async () => {
    mockWriteText.mockRejectedValueOnce(new Error("fail")).mockResolvedValue(undefined);

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copy("first");
    });
    expect(result.current.error).not.toBeNull();

    await act(async () => {
      await result.current.copy("second");
    });
    expect(result.current.error).toBeNull();
    expect(result.current.copied).toBe(true);
  });
});
