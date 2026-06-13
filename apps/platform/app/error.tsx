"use client";

import { SystemMessage } from "~/components/system-message";

export default function ErrorBoundary({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <SystemMessage kind="error" reset={reset} />;
}
