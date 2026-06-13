import type { RefObject } from "react";
import { useEffect } from "react";

/**
 * Close or trigger handler when click occurs outside ref element or Escape is pressed.
 * @example
 * const ref = useRef(null);
 * useClickOutside(ref, () => setOpen(false), open);
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) return;
    function onDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) handler();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") handler();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [enabled, handler, ref]);
}
