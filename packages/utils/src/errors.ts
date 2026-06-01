import { MIME_JSON } from "./http";

export class ErrorExtendable extends Error {
  public constructor(message?: string, options?: ErrorOptions) {
    super(message, options);

    // Set the prototype explicitly
    Object.setPrototypeOf(this, new.target.prototype);

    // Optionally set the name to the derived class name
    this.name = this.constructor.name;
  }

  /**
   * Guard to check if the error is an instance of a specific class.
   * @example
   * ```ts
   * if (ErrorExtendable.is(error, MyCustomError)) {
   *   // Handle MyCustomError
   * }
   * ```
   */
  public static is<T extends ErrorExtendable>(error: unknown, errorClass: new (...args: any[]) => T): error is T {
    return error instanceof errorClass;
  }
}

/** Same as `ErrorExtendable.is` */
export function ERROR_IS<T extends Error>(error: unknown, errorClass: new (...args: any[]) => T): error is T {
  return error instanceof errorClass;
}

/**
 * Error for a failed `fetch` response. Carries the HTTP status and URL so
 * callers can branch on `error.status` without reaching back to the `Response`.
 *
 * When the response is JSON, `ErrorFetch.from` also parses the body into `json`.
 * The generic `T` is a *soft* type — `json` is asserted, never validated — so
 * callers get an ergonomic shape without runtime guarantees. Narrow it yourself
 * if it matters.
 * @example
 * ```ts
 * const response = await fetch(url);
 * if (!response.ok) {
 *   throw await ErrorFetch.from<{ message: string }>(response);
 * }
 * ```
 */
export class ErrorFetch<T = unknown> extends ErrorExtendable {
  public readonly status: number;
  public readonly statusText: string;
  public readonly url: string;
  public readonly body: string | undefined;
  /** Parsed JSON body — only present when the response Content-Type is JSON. Soft-typed, unvalidated. */
  public readonly json: T | undefined;

  public constructor(
    init: { status: number; statusText: string; url: string; body?: string; json?: T },
    options?: ErrorOptions,
  ) {
    super(`HTTP ${init.status} ${init.statusText} (${init.url})`, options);
    this.status = init.status;
    this.statusText = init.statusText;
    this.url = init.url;
    this.body = init.body;
    this.json = init.json;
  }

  /**
   * Build an `ErrorFetch` from a `Response`, reading the body as text. When the
   * Content-Type is JSON, the body is also parsed into `json` (soft-typed `T`).
   */
  public static async from<T = unknown>(response: Response, options?: ErrorOptions): Promise<ErrorFetch<T>> {
    const body = await response
      .clone()
      .text()
      .catch(() => undefined);
    let json: T | undefined;
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes(MIME_JSON);
    if (body !== undefined && isJson) {
      try {
        json = JSON.parse(body) as T;
      } catch {
        json = undefined;
      }
    }
    return new ErrorFetch<T>(
      {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        body,
        json,
      },
      options,
    );
  }
}
