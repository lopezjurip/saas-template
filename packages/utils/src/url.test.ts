import { describe, expect, it } from "vitest";
import { EMAIL_NORMALIZE, EMAIL_REGEX, HREF_FORMAT, URL_FORMAT, URL_NEW, URL_PARSE_HASH, UUID_REGEX } from "../src/url";

describe("NEW_URL", () => {
  it("should create a new URL with default values", () => {
    const url = URL_NEW("https://example.com");
    expect(url.href).toBe("https://example.com/");
  });

  it("should create a new URL with specified base URL", () => {
    const base = "https://example.com";
    const url = URL_NEW("/path", base);
    expect(url.href).toBe("https://example.com/path");
  });

  it("should create a new URL with overwritten parts", () => {
    const url = URL_NEW("https://example.com", undefined, {
      pathname: "/new-path",
      search: "?param=value",
    });
    expect(url.href).toBe("https://example.com/new-path?param=value");
  });

  describe("replace option", () => {
    const base = "https://example.com";

    it("replaces a single segment", () => {
      const url = URL_NEW("/[locale]/home", base, { replace: { locale: "es-CL" } });
      expect(url.href).toBe("https://example.com/es-CL/home");
    });

    it("replaces multiple segments", () => {
      const url = URL_NEW("/[locale]/t/[tenant_slug]", base, {
        replace: { locale: "es-CL", tenant_slug: "acme" },
      });
      expect(url.href).toBe("https://example.com/es-CL/t/acme");
    });

    it("replaces all occurrences of the same segment", () => {
      const url = URL_NEW("/[locale]/x/[locale]", base, { replace: { locale: "en-US" } });
      expect(url.href).toBe("https://example.com/en-US/x/en-US");
    });

    it("URL-encodes replacement values with special characters", () => {
      const url = URL_NEW("/[locale]/u/[slug]", base, { replace: { locale: "es-CL", slug: "hello world" } });
      expect(url.href).toBe("https://example.com/es-CL/u/hello%20world");
    });

    it("accepts numeric replacement values", () => {
      const url = URL_NEW("/orgs/[id]", base, { replace: { id: 42 } });
      expect(url.href).toBe("https://example.com/orgs/42");
    });

    it("leaves unreplaced segments intact", () => {
      const url = URL_NEW("/[locale]/[unknown]", base, { replace: { locale: "pt-BR" } });
      expect(url.href).toBe("https://example.com/pt-BR/[unknown]");
    });

    it("combines replace with params (query string)", () => {
      const url = URL_NEW("/[locale]/search", base, {
        replace: { locale: "en-US" },
        params: { q: "hello" },
      });
      expect(url.href).toBe("https://example.com/en-US/search?q=hello");
    });

    it("ignores replace when url is a URL object", () => {
      const input = new URL("https://example.com/[locale]/home");
      const url = URL_NEW(input, undefined, { replace: { locale: "es-CL" } });
      expect(url.pathname).toBe("/[locale]/home");
    });
  });
});

describe("FORMAT_URL", () => {
  it("should format URL with default options", () => {
    const url = new URL("https://example.com/path?param=value#hash");
    const formattedUrl = URL_FORMAT(url);
    expect(formattedUrl).toBe("https://example.com/path?param=value#hash");
  });

  it("should format URL with specified options", () => {
    const url = new URL("https://example.com/path?param=value#hash");
    let formattedUrl = URL_FORMAT(url, { protocol: true, hostname: true, pathname: true, search: false });
    expect(formattedUrl).toBe("https://example.com/path");

    formattedUrl = URL_FORMAT(url, { protocol: true, hostname: true, pathname: true, search: true });
    expect(formattedUrl).toBe("https://example.com/path?param=value");

    formattedUrl = URL_FORMAT(url, { protocol: true, hostname: true, pathname: true, search: true, hash: true });
    expect(formattedUrl).toBe("https://example.com/path?param=value#hash");

    formattedUrl = URL_FORMAT(url, { protocol: true, hostname: true, pathname: false, search: true, hash: true });
    expect(formattedUrl).toBe("https://example.com?param=value#hash");

    formattedUrl = URL_FORMAT(url, { protocol: true, hostname: true, pathname: false, search: false, hash: true });
    expect(formattedUrl).toBe("https://example.com#hash");

    formattedUrl = URL_FORMAT(url, { protocol: true, hostname: true, pathname: false, search: false, hash: false });
    expect(formattedUrl).toBe("https://example.com");

    formattedUrl = URL_FORMAT(url, { protocol: true, hostname: false, pathname: false, search: false, hash: false });
    expect(formattedUrl).toBe("https://"); // TODO: should be "https", "https://", or "https:"?
  });
});

describe("FORMAT_HREF", () => {
  it("should format href with no params", () => {
    const href = "/dashboard";
    const formattedHref = HREF_FORMAT(href);
    expect(formattedHref).toBe("/dashboard");
  });

  it("should format href with params", () => {
    const href = "/dashboard/[tenant]";
    const params = { tenant: "foo" };
    const formattedHref = HREF_FORMAT(href, params);
    expect(formattedHref).toBe("/dashboard/foo");
  });

  it("should format href with multiple params", () => {
    const href = "/dashboard/[tenant]/[id]";
    const params = { tenant: "foo", id: "123" };
    const formattedHref = HREF_FORMAT(href, params);
    expect(formattedHref).toBe("/dashboard/foo/123");
  });

  it("should format and encode params", () => {
    const href = "/dashboard/[tenant]";
    const params = { tenant: "foo bar" };
    const formattedHref = HREF_FORMAT(href, params);
    expect(formattedHref).toBe("/dashboard/foo%20bar");
  });

  it("should format and add query params", () => {
    const href = "/dashboard/[tenant]";
    const params = { tenant: "foo" };
    const query = { ref: "bar", utm_source: "newsletter" };
    const formattedHref = HREF_FORMAT(href, params, query);
    expect(formattedHref).toBe("/dashboard/foo?ref=bar&utm_source=newsletter");
  });
});

describe("UUID_REGEX", () => {
  it("should match a valid UUID", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000";
    expect(UUID_REGEX.test(uuid)).toBe(true);
  });

  it("should not match an invalid UUID", () => {
    const uuid = "550e8400-e29b-41d4-a716-44665544000";
    expect(UUID_REGEX.test(uuid)).toBe(false);
  });
});

describe("EMAIL_REGEX", () => {
  it("should match a valid gmail email", () => {
    const email = "patricio@gmail.com";
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it("should match a valid email", () => {
    const email = "patricio@fraccional.cl";
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it("should match a valid email with plus sign", () => {
    const email = "patricio+test@fraccional.cl";
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it("should match a valid email with subdomain", () => {
    const email = "patricio@email.fraccional.cl";
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });

  it("should match a valid email with rare domain", () => {
    const email = "patricio@fraccional.ventures";
    expect(EMAIL_REGEX.test(email)).toBe(true);
  });
});

describe("EMAIL_NORMALIZE", () => {
  it("should normalize email by trimming and lowercasing", () => {
    const email = "  PATricio@FRACCIONAL.CL  ";
    const normalized = EMAIL_NORMALIZE(email);
    expect(normalized).toBe("patricio@fraccional.cl");
  });

  it("should remove + tags from email", () => {
    const email = "patricio+test@fraccional.cl";
    const normalized = EMAIL_NORMALIZE(email);
    expect(normalized).toBe("patricio@fraccional.cl");
  });
});

describe("URL_PARSE_HASH", () => {
  it("should parse hash parameters from a URL", () => {
    const url = new URL("https://example.com/path#mobile_app=true&access_token=abc123");
    const params = URL_PARSE_HASH(url);
    expect(params.get("mobile_app")).toBe("true");
    expect(params.get("access_token")).toBe("abc123");
  });
});
