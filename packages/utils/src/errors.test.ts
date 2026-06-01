import { describe, expect, it } from "vitest";
import { ERROR_IS, ErrorExtendable, ErrorFetch } from "./errors";

class CustomError extends ErrorExtendable {}
class OtherError extends ErrorExtendable {}

describe("ErrorExtendable", () => {
  it("should be an instance of Error", () => {
    const error = new ErrorExtendable("boom");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ErrorExtendable);
  });

  it("should set the message", () => {
    const error = new ErrorExtendable("boom");
    expect(error.message).toBe("boom");
  });

  it("should default the name to the derived class name", () => {
    expect(new ErrorExtendable().name).toBe("ErrorExtendable");
    expect(new CustomError().name).toBe("CustomError");
  });

  it("should keep instanceof working through the subclass chain", () => {
    const error = new CustomError("boom");
    expect(error).toBeInstanceOf(CustomError);
    expect(error).toBeInstanceOf(ErrorExtendable);
    expect(error).toBeInstanceOf(Error);
  });

  it("should forward the cause option", () => {
    const cause = new Error("root");
    const error = new ErrorExtendable("boom", { cause });
    expect(error.cause).toBe(cause);
  });

  describe("is", () => {
    it("should return true for a matching class", () => {
      const error: unknown = new CustomError("boom");
      expect(ErrorExtendable.is(error, CustomError)).toBe(true);
    });

    it("should return true for a parent class", () => {
      const error: unknown = new CustomError("boom");
      expect(ErrorExtendable.is(error, ErrorExtendable)).toBe(true);
    });

    it("should return false for an unrelated class", () => {
      const error: unknown = new CustomError("boom");
      expect(ErrorExtendable.is(error, OtherError)).toBe(false);
    });

    it("should return false for non-error values", () => {
      expect(ErrorExtendable.is("boom", CustomError)).toBe(false);
      expect(ErrorExtendable.is(null, CustomError)).toBe(false);
      expect(ErrorExtendable.is(undefined, CustomError)).toBe(false);
      expect(ErrorExtendable.is({}, CustomError)).toBe(false);
    });

    it("should narrow the type when true", () => {
      const error: unknown = new CustomError("boom");
      if (ErrorExtendable.is(error, CustomError)) {
        expect(error.message).toBe("boom");
      } else {
        throw new Error("expected guard to pass");
      }
    });
  });
});

describe("ERROR_IS", () => {
  it("should return true for a matching class", () => {
    const error: unknown = new CustomError("boom");
    expect(ERROR_IS(error, CustomError)).toBe(true);
  });

  it("should work with plain Error subclasses", () => {
    class PlainError extends Error {}
    const error: unknown = new PlainError("boom");
    expect(ERROR_IS(error, PlainError)).toBe(true);
    expect(ERROR_IS(error, Error)).toBe(true);
  });

  it("should return false for an unrelated class", () => {
    const error: unknown = new CustomError("boom");
    expect(ERROR_IS(error, OtherError)).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(ERROR_IS("boom", Error)).toBe(false);
    expect(ERROR_IS(null, Error)).toBe(false);
    expect(ERROR_IS(undefined, Error)).toBe(false);
  });

  it("should narrow the type when true", () => {
    const error: unknown = new CustomError("boom");
    if (ERROR_IS(error, CustomError)) {
      expect(error.message).toBe("boom");
    } else {
      throw new Error("expected guard to pass");
    }
  });
});

describe("ErrorFetch", () => {
  it("should be an ErrorExtendable", () => {
    const error = new ErrorFetch({ status: 500, statusText: "Internal Server Error", url: "https://x.test/a" });
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ErrorExtendable);
    expect(error).toBeInstanceOf(ErrorFetch);
    expect(error.name).toBe("ErrorFetch");
  });

  it("should expose status, statusText, url and body", () => {
    const error = new ErrorFetch({
      status: 404,
      statusText: "Not Found",
      url: "https://x.test/missing",
      body: "nope",
    });
    expect(error.status).toBe(404);
    expect(error.statusText).toBe("Not Found");
    expect(error.url).toBe("https://x.test/missing");
    expect(error.body).toBe("nope");
  });

  it("should build a descriptive message", () => {
    const error = new ErrorFetch({ status: 403, statusText: "Forbidden", url: "https://x.test/secret" });
    expect(error.message).toBe("HTTP 403 Forbidden (https://x.test/secret)");
    expect(error.body).toBeUndefined();
  });

  it("should forward the cause option", () => {
    const cause = new Error("socket reset");
    const error = new ErrorFetch({ status: 502, statusText: "Bad Gateway", url: "https://x.test" }, { cause });
    expect(error.cause).toBe(cause);
  });

  it("should be detectable via the is guard", () => {
    const error: unknown = new ErrorFetch({ status: 500, statusText: "Internal Server Error", url: "https://x.test" });
    expect(ErrorExtendable.is(error, ErrorFetch)).toBe(true);
  });

  describe("from", () => {
    it("should read status, statusText, url and body from a Response", async () => {
      const response = new Response("boom", {
        status: 500,
        statusText: "Internal Server Error",
      });
      Object.defineProperty(response, "url", { value: "https://x.test/fail" });

      const error = await ErrorFetch.from(response);
      expect(error.status).toBe(500);
      expect(error.statusText).toBe("Internal Server Error");
      expect(error.url).toBe("https://x.test/fail");
      expect(error.body).toBe("boom");
    });

    it("should not consume the original response body", async () => {
      const response = new Response("payload", { status: 400 });
      await ErrorFetch.from(response);
      expect(response.bodyUsed).toBe(false);
      await expect(response.text()).resolves.toBe("payload");
    });

    it("should forward the cause option", async () => {
      const cause = new Error("root");
      const response = new Response(null, { status: 503 });
      const error = await ErrorFetch.from(response, { cause });
      expect(error.cause).toBe(cause);
    });

    it("should parse the body into json when Content-Type is JSON", async () => {
      const response = new Response(JSON.stringify({ message: "nope", code: 7 }), {
        status: 400,
        statusText: "Bad Request",
        headers: { "content-type": "application/json" },
      });
      Object.defineProperty(response, "url", { value: "https://x.test/json" });

      const error = await ErrorFetch.from<{ message: string; code: number }>(response);
      expect(error.body).toBe('{"message":"nope","code":7}');
      expect(error.json).toEqual({ message: "nope", code: 7 });
      expect(error.json?.message).toBe("nope");
    });

    it("should parse json when Content-Type carries a charset", async () => {
      const response = new Response('{"ok":false}', {
        status: 400,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
      const error = await ErrorFetch.from(response);
      expect(error.json).toEqual({ ok: false });
    });

    it("should leave json undefined when Content-Type is not JSON", async () => {
      const response = new Response('{"ok":false}', {
        status: 400,
        headers: { "content-type": "text/plain" },
      });
      const error = await ErrorFetch.from(response);
      expect(error.body).toBe('{"ok":false}');
      expect(error.json).toBeUndefined();
    });

    it("should leave json undefined when there is no Content-Type", async () => {
      const response = new Response('{"ok":false}', { status: 400 });
      const error = await ErrorFetch.from(response);
      expect(error.json).toBeUndefined();
    });

    it("should leave json undefined when the JSON body is malformed", async () => {
      const response = new Response("not json", {
        status: 502,
        headers: { "content-type": "application/json" },
      });
      const error = await ErrorFetch.from(response);
      expect(error.body).toBe("not json");
      expect(error.json).toBeUndefined();
    });
  });
});
