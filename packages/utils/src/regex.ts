/**
 * Regex to validate credit card numbers with or without spaces or dashes.
 * @example
 * REGEX_CREDIT_CARD.test("1234-5678-1234-5678"); // true
 */
export const REGEX_CREDIT_CARD = /*#__PURE__*/ /^(?:\d{4}[\s-]?){3}\d{4}$/;
