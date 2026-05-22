declare module "color-hash" {
  interface ColorHashOptions {
    lightness?: number | number[];
    saturation?: number | number[];
    hue?: number | { min: number; max: number };
    hash?: (str: string) => number;
  }

  class ColorHash {
    constructor(options?: ColorHashOptions);
    hsl(str: string): [number, number, number];
    rgb(str: string): [number, number, number];
    hex(str: string): string;
  }

  export default ColorHash;
}
