import { useEffect, useRef } from "react";

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  { mod = false, enabled = true }: { mod?: boolean; enabled?: boolean } = {},
) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (event: KeyboardEvent) => {
      if (mod && !(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;
      event.preventDefault();
      handlerRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, mod, enabled]);
}
