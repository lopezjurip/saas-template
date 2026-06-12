import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Keep in sync with .css files.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["tiny"], // text-tiny
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
