"use client";

import { INITIALS_OF } from "@packages/utils/string";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ROUTE } from "~/lib/route";

/**
 * Bottom-left floating user pill seen on /home. Click expands a popover with
 * profile / settings / sign-out — these route to the matching /home/account sections.
 */
export function UserMenu({ locale, name, email }: { locale: string; name: string; email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4.5 left-4.5 z-5 flex flex-col gap-1">
      {open && (
        <div
          role="menu"
          className="absolute bottom-[calc(100%+8px)] left-0 flex w-55 flex-col gap-px rounded-md border bg-popover p-1 text-popover-foreground shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <div className="flex items-center gap-2.5 px-2.5 pt-2 pb-1.5">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-sm/normal font-semibold tracking-[-0.01em] text-primary-foreground">
              {INITIALS_OF(name || email)}
            </span>
            <span className="flex min-w-0 flex-col leading-[1.2]">
              <strong className="text-sm/normal font-medium text-foreground">{name || "Sin nombre"}</strong>
              <span className="text-xs text-muted-foreground">{email}</span>
            </span>
          </div>
          <div className="flex flex-col border-b py-1">
            <Link
              href={ROUTE("/[locale]/home/account/profile", { locale })}
              className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm/normal text-foreground hover:bg-accent"
            >
              Mi perfil
            </Link>
            <Link
              href={ROUTE("/[locale]/home/account/security", { locale })}
              className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm/normal text-foreground hover:bg-accent"
            >
              Inicio de sesión
            </Link>
          </div>
          <div className="flex flex-col py-1">
            <Link
              href={ROUTE("/[locale]/auth/logout", { locale })}
              className="flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm/normal text-destructive hover:bg-accent"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2.5 rounded-full border bg-background py-1.5 pr-2.5 pl-1.5 text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-accent"
      >
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold tracking-[-0.01em] text-primary-foreground">
          {INITIALS_OF(name || email)}
        </span>
        <span className="flex flex-col items-start pr-1.5 leading-[1.15]">
          <span className="whitespace-nowrap text-[12.5px] font-medium text-foreground">{name || "Sin nombre"}</span>
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">{email}</span>
        </span>
        <span className="mr-1 text-muted-foreground">
          <ChevronDown size={14} />
        </span>
      </button>
    </div>
  );
}
