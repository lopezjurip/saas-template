import type { PostgrestError } from "@supabase/postgrest-js";

export type Result<T, E extends Error> = [T | null, E | null];

export function GOERR<T, E extends Error>(func: () => T): Result<T, E>;
export function GOERR<T, E extends Error>(promise: PromiseLike<T>): Promise<Result<T, E>>;
export function GOERR<T, E extends Error>(asyncFunc: () => Promise<T>): Promise<Result<T, E>>;
export function GOERR(parameter: any): any {
  if ("then" in parameter && "catch" in parameter) {
    return parameter.then((r: any) => [r, null]).catch((err: Error) => [null, err]);
  }

  try {
    const result = parameter();
    return result instanceof Promise ? GOERR(result) : [result, null];
  } catch (err) {
    return [null, err];
  }
}

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
 * In the version of supabase-js we're using, errors are objects instead of Errors,
 * so they have no stack trace.
 *
 * For example this:
 * ```ts
 * const { data } = await supabase
 *   .from("example")
 *   .select("example")
 *   .throwOnError();
 * ```
 * just logs:
 * ```
 *  ⨯ {
 *   code: '42P01',
 *   details: null,
 *   hint: null,
 *   message: 'relation "public.example" does not exist'
 * }
 * ```
 *
 * However, this:
 * ```ts
 * const { data, error } = await supabase
 *   .from("example")
 *   .select("example");
 * if (error) {
 *   throw new SupabaseError(error);
 * }
 * ```
 * logs instead:
 * ```
 *  ⨯ Error [SupabaseError]: {
 *    "code": "42P01",
 *    "details": null,
 *    "hint": null,
 *    "message": "relation \"public.example\" does not exist"
 *  }
 *      at exampleFunction (.../example.ts:15:10)
 *      at ...
 *      at ...
 *      at ...
 *    13 |     .select("example");
 *    14 |   if (error) {
 *  > 15 |     throw new SupabaseError(error);
 *       |          ^
 *    16 |   }
 *    17 |
 *    page: '/api/v1/example',
 *    [cause]: [Object]
 *  }
 * ```
 */
export class SupabaseError extends ErrorExtendable {
  public constructor(postgrestError: PostgrestError) {
    super(
      JSON.stringify(postgrestError, null, 2), // stringify so the object is printed in logs
      { cause: postgrestError }, // `cause` for programmatic usage
    );
  }
}

/** Ensures that what you throw will have stacktrace. */
export function ensureSupabaseErrorWithStack(source: Error | PostgrestError): Error {
  if (source instanceof Error) {
    return source;
  }
  return new SupabaseError(source);
}
