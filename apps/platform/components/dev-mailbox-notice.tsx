"use client";

import { useIsDevHost } from "~/hooks/use-is-dev-host";

interface DevMailboxNoticeProps {
  /**
   * If provided, the link deep-links into the per-mailbox view at
   * `<NEXT_PUBLIC_DEV_MAILBOX_URL>/m/<local-part>` (Inbucket convention).
   * If omitted, the link points at the Inbucket root.
   */
  email?: string;
}

/**
 * Yellow "Development only" callout linking to the local Inbucket mailbox.
 * Renders only when both:
 *   - the host looks like a dev host (see `useIsDevHost`)
 *   - `NEXT_PUBLIC_DEV_MAILBOX_URL` is set
 *
 * Drop this next to any UI that says "we sent you an email" so devs can grab the
 * email locally without leaving the browser.
 */
export function DevMailboxNotice({ email }: DevMailboxNoticeProps) {
  const isDev = useIsDevHost();
  const mailbox = process.env.NEXT_PUBLIC_DEV_MAILBOX_URL;
  if (!isDev || !mailbox) return null;

  const href = email ? `${mailbox.replace(/\/$/, "")}/m/${encodeURIComponent(email.split("@")[0] ?? email)}` : mailbox;

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
      <p className="text-xs font-semibold tracking-wide uppercase">Development only</p>
      <a href={href} target="_blank" rel="noreferrer" className="text-sm underline">
        Abrir bandeja de entrada local
      </a>
    </div>
  );
}
