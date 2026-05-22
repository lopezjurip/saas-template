import type { Maybe } from "@packages/utils/maybe";
import { NUMBER_STRICT } from "./number";

/**
 * Do not check for valid RUT, just check if it matches the regex.
 * @example
> r.test("18.523.312-5")
true
> r.test("18.523.312-K")
true
> r.test("18.523.312K")
true
> r.test("18.523312K")
true
> r.test("18.523312K ")
 */
export const RUT_REGEX = /*#__PURE__*/ /^(\d{1,3}(?:\.?\d{1,3}){2}-?[\dkK])$/;

/** '18.525.562-k' -> '18525562K' */
export function RUT_NORMALIZE(rut: string): string {
  return rut
    .replace(/^0+|[^0-9kK]+/g, "")
    .trim()
    .toUpperCase();
}

export function RUT_NORMALIZE_SAFE(rut: Maybe<string>): string {
  return rut ? RUT_NORMALIZE(rut) : "";
}

/**
 * Make sure to `RUT_NORMALIZE` first.
 */
export function RUT_VALIDATE(rut: Maybe<string>): rut is string {
  if (!rut) {
    return false;
  }
  // if it starts with 0 we return false
  // so a rut like 00000000-0 will not pass
  if (/^0+/.test(rut)) {
    return false;
  }

  if (!RUT_REGEX.test(rut)) {
    return false;
  }

  let t: number = Number.parseInt(rut.slice(0, -1), 10);
  let m: number = 0;
  let s: number = 1;

  while (t > 0) {
    s = (s + (t % 10) * (9 - (m++ % 6))) % 11;
    t = Math.floor(t / 10);
  }

  const v: string = s > 0 ? `${s - 1}` : "K";
  return v === rut.slice(-1);
}

export type RUTFormatOptions = {
  dots?: boolean;
  dash?: boolean;
  uppercase?: boolean;
};

/** Must be a valid RUT. Make sure to `RUT_NORMALIZE` and `RUT_VALIDATE` first. */
export function RUT_FORMAT(rut: string, { dots = true, dash = true, uppercase = true }: RUTFormatOptions = {}): string {
  const parts = [
    rut.slice(-10, -7),
    rut.length > 7 ? "." : "",
    rut.slice(-7, -4),
    rut.length > 4 ? "." : "",
    rut.slice(-4, -1),
    rut.length > 1 && dash ? "-" : "",
    uppercase ? rut.slice(-1).toUpperCase() : rut.slice(-1).toLowerCase(),
  ];

  const result = parts.join("");

  if (!dots) {
    return result.replace(/\./g, "");
  }

  return result;
}

export type RUTValidatorDigit = "K" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

/**
 * Chilean NIN (Rol Único Tributario).
 */
export class RUT {
  /** The numeric part of the RUT (no validator digit) */
  public readonly numbers: string;

  /** The validator digit of the RUT, can be "K" (uppercase) */
  public readonly dv: RUTValidatorDigit;

  public constructor(rut: string) {
    const cleanedRut = RUT_NORMALIZE(rut);

    this.numbers = cleanedRut.slice(0, -1);
    this.dv = cleanedRut.slice(-1) as RUTValidatorDigit;
  }

  public static fromParts(numbers: string | number, dv: string) {
    return new RUT(`${numbers}${dv}`);
  }

  public static readonly fraccionalNumbers = "77565459";
  public static readonly fraccionalDv = "7";

  public static Fraccional() {
    return RUT.fromParts(RUT.fraccionalNumbers, RUT.fraccionalDv);
  }

  public isValid() {
    return RUT_VALIDATE(this.normalized);
  }

  public throwIfInvalid() {
    if (!this.isValid()) {
      throw new Error(`[RUT] Invalid RUT: ${this.normalized}`); // improvement: create custom Error class
    }
    return this;
  }

  public isSiiJuridical() {
    return NUMBER_STRICT(this.numbers) > 50_000_000;
  }

  isFraccional() {
    return this.numbers === RUT.fraccionalNumbers;
  }

  /**
   * The formatted RUT with dots and dash and uppercase validator digit (K).
   * @example
   * new RUT("18523312-K").formatted() // "18.523.312-K"
   */
  public formatted(formatOptions?: RUTFormatOptions) {
    return RUT_FORMAT(this.normalized, formatOptions);
  }

  /**
   * The full normalized RUT (including validator digit uppercase)
   * @example
   * new RUT("18.523.312-5").rut // "185233125"
   * new RUT("18.523.312-K").rut // "18523312K"
   */
  public get normalized() {
    return `${this.numbers}${this.dv}`;
  }

  public toString() {
    return this.normalized;
  }

  public static sorted(ruts: RUT[]) {
    return ruts.toSorted((a, b) => NUMBER_STRICT(a.numbers) - NUMBER_STRICT(b.numbers));
  }
}
