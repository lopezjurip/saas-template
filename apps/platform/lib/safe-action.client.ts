import { ErrorExtendable } from "@packages/utils/errors";
import type { FlattenedValidationErrors, SafeActionResult } from "next-safe-action";

// Framework-agnostic on purpose (no server/client imports) so both Server
// Actions and client components can unwrap action results from the same place.

/**
 * Base class for errors produced when unwrapping a `next-safe-action` result.
 * Subclasses discriminate the two failure modes a `SafeActionResult` can carry.
 */
export class ErrorSafeAction extends ErrorExtendable {
  /**
   * Collapse a `SafeActionResult` into a Go-style `[data, error]` tuple.
   *
   * On success the data is returned with its existence already asserted (the
   * caller can index it directly). On failure the error is an `ErrorSafeActionServer`
   * (the action threw / `handleServerError` ran), an `ErrorSafeActionValidation`
   * (input failed schema validation — carries the flattened `formErrors` /
   * `fieldErrors`) or an `ErrorSafeActionEmpty` (idle/empty result).
   *
   * @example
   * const [data, error] = await ErrorSafeAction.unwrap(actionThatReturnsData());
   * if (error instanceof ErrorSafeActionServer) {}
   * if (error instanceof ErrorSafeActionValidation) error.fieldErrors["email"];
   * const value = data["value"]; // existence is already asserted.
   */
  public static async unwrap<ShapedErrors extends FlattenedValidationErrors<any>, Data>(
    result: Promise<SafeActionResult<string, any, ShapedErrors, Data>>,
  ): Promise<
    | [data: Data, error: undefined]
    | [data: undefined, error: ErrorSafeActionServer | ErrorSafeActionValidation<ShapedErrors> | ErrorSafeActionEmpty]
  > {
    const outcome = await result;
    if (outcome.validationErrors !== undefined) {
      return [undefined, new ErrorSafeActionValidation(outcome.validationErrors)];
    }
    if (outcome.serverError !== undefined) {
      return [undefined, new ErrorSafeActionServer(outcome.serverError)];
    }
    if (outcome.data !== undefined) {
      return [outcome.data, undefined];
    }
    return [undefined, new ErrorSafeActionEmpty()];
  }
}

/** The action threw or its server-side handler returned an error message. */
export class ErrorSafeActionServer extends ErrorSafeAction {
  public readonly serverError: string;

  public constructor(serverError: string, options?: ErrorOptions) {
    super(serverError, options);
    this.serverError = serverError;
  }
}

/**
 * The action input failed schema validation. The server flattens validation errors
 * (`defaultValidationErrorsShape: "flattened"`), so this carries the flattened shape:
 * `formErrors` (global, non-field errors) and `fieldErrors` (keyed by input field).
 * `validationErrors` keeps the raw object for callers that want it whole.
 */
export class ErrorSafeActionValidation<
  T extends FlattenedValidationErrors<any> = FlattenedValidationErrors<any>,
> extends ErrorSafeAction {
  public readonly validationErrors: T;
  public readonly formErrors: T["formErrors"];
  public readonly fieldErrors: T["fieldErrors"];

  public constructor(validationErrors: T, options?: ErrorOptions) {
    const { formErrors, fieldErrors } = validationErrors;
    super(formErrors.length > 0 ? formErrors.join(" ") : "[ErrorSafeActionValidation] validation error", options);
    this.validationErrors = validationErrors;
    this.formErrors = formErrors;
    this.fieldErrors = fieldErrors;
  }
}

export class ErrorSafeActionEmpty extends ErrorSafeAction {
  public constructor() {
    super("[ErrorSafeActionEmpty] got empty response.");
  }
}
