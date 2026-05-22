/**
 * See: https://www.bram.us/2020/04/27/colors-in-css-hello-space-separated-functional-color-notations/
 */
export function RGB_FROM_HEX(hex: string) {
  const [, r, g, b] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)!;
  return [Number.parseInt(r!, 16), Number.parseInt(g!, 16), Number.parseInt(b!, 16)] as const;
}
export function RGBA_FROM_HEX(hex: string) {
  const [, r, g, b, a] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex)!;
  return [Number.parseInt(r!, 16), Number.parseInt(g!, 16), Number.parseInt(b!, 16), Number.parseInt(a!, 16)] as const;
}

/**
 * Note: Alpha has range `[0, 255]`
 */
export function HEX_TO_RGBA(hex: string, alpha?: number): [number, number, number, number] {
  const [r, g, b, a] = RGBA_FROM_HEX(hex);
  return [r, g, b, alpha || a * 255]; // TODO: 256?
}

export function PERCENTAGE_TO_HEX(percentage: number): string {
  return Math.floor(percentage * 255).toString(16);
}

/** Pixel GIF code adapted from https://stackoverflow.com/a/33919020/266535 */
const KEYS = /*#__PURE__*/ "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

function RGB_TRIPLET(e1: number, e2: number, e3: number) {
  return (
    KEYS.charAt(e1 >> 2) +
    KEYS.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
    KEYS.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
    KEYS.charAt(e3 & 63)
  );
}

/**
 * From: https://github.com/vercel/next.js/blob/canary/examples/image-component/pages/color.js
 */
export function DATAURL_FROM_RGB(r: number, g: number, b: number) {
  const str = RGB_TRIPLET(0, r, g) + RGB_TRIPLET(b, 255, 255);
  return `data:image/gif;base64,R0lGODlhAQABAPAA${str}/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;
}
