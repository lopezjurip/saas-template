"use client";

import { HREF_FORMAT } from "@packages/utils/url";
import { toast } from "sonner";
import { APEX_HOSTNAME } from "~/lib/constants";
import { isDevHost } from "~/lib/dev-host";

/**
 * In local dev, surface a toast linking to the Mailpit inbox so you can grab the
 * magic link / OTP without leaving the app. No-op in non-dev hosts or when
 * `NEXT_PUBLIC_DEV_MAILBOX_URL` is unset.
 *
 * @example notifyDevMailbox(email)
 */
export function notifyDevMailbox(email?: string): void {
  if (!isDevHost(APEX_HOSTNAME)) return;
  const mailbox = process.env["NEXT_PUBLIC_DEV_MAILBOX_URL"];
  if (!mailbox) return;

  const base = mailbox.replace(/\/$/, "");
  const href = HREF_FORMAT(base, undefined, email ? { q: `to:${email}` } : undefined);

  toast.info("Development only", {
    description: "Abre la bandeja local para obtener el enlace mágico.",
    duration: 30_000,
    action: {
      label: "Abrir bandeja",
      onClick: () => window.open(href, "_blank", "noopener,noreferrer"),
    },
  });
}
