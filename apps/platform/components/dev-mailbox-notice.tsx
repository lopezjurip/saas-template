"use client";

import { useIsDevHost } from "~/hooks/use-is-dev-host";

interface DevMailboxNoticeProps {
  /**
   * If provided, the link deep-links into a Mailpit search filtered to messages
   * addressed to this recipient (`<NEXT_PUBLIC_DEV_MAILBOX_URL>/?q=to:<email>`).
   * If omitted, the link points at the Mailpit root.
   */
  email?: string;
}

export function DevMailboxNotice({ email }: DevMailboxNoticeProps) {
  const isDev = useIsDevHost();
  const mailbox = process.env["NEXT_PUBLIC_DEV_MAILBOX_URL"];
  if (!isDev || !mailbox) return null;

  const base = mailbox.replace(/\/$/, "");
  const href = email ? `${base}/?q=${encodeURIComponent(`to:${email}`)}` : base;

  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-yellow-400 bg-yellow-50 p-3 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
      <p className="text-xs font-semibold tracking-wide uppercase">Development only</p>
      <a href={href} target="_blank" rel="noreferrer" className="text-sm underline">
        Abrir bandeja de entrada local
      </a>
    </div>
  );
}
