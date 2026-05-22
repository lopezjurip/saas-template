import { useCallback, useState } from "react";

interface UseClipboardOptions {
  /** Milliseconds before `copied` resets to false. Default: 2000 */
  resetDelay?: number;
}

interface UseClipboardReturn {
  copy: (text: string) => Promise<void>;
  copied: boolean;
  error: Error | null;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardReturn {
  const { resetDelay = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setError(null);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setCopied(false);
      }
    },
    [resetDelay],
  );

  return { copy, copied, error };
}
