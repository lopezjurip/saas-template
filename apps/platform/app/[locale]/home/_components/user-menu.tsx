"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function INITIALS_OF(name: string | null | undefined): string {
  if (!name) return "?";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "?"
  );
}

// Bottom-left floating user pill seen on /home. Click expands a popover with
// profile / settings / sign-out — these route to the matching /home/account sections.
export function UserMenu({ locale, name, email }: { locale: string; name: string; email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="user-menu">
      {open && (
        <div className="user-menu-pop" role="menu">
          <div className="user-menu-pop-head">
            <span className="user-menu-avatar">{INITIALS_OF(name || email)}</span>
            <span className="info">
              <strong>{name || "Sin nombre"}</strong>
              <span>{email}</span>
            </span>
          </div>
          <div className="group">
            <Link href={`/${locale}/home/account/profile`} className="user-menu-item">
              Mi perfil
            </Link>
            <Link href={`/${locale}/home/account/security`} className="user-menu-item">
              Inicio de sesión
            </Link>
          </div>
          <div className="group">
            <Link href={`/${locale}/auth/logout`} className="user-menu-item danger">
              Cerrar sesión
            </Link>
          </div>
        </div>
      )}
      <button
        type="button"
        className="user-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="user-menu-avatar">{INITIALS_OF(name || email)}</span>
        <span className="user-menu-body">
          <span className="user-menu-name">{name || "Sin nombre"}</span>
          <span className="user-menu-mail">{email}</span>
        </span>
        <span className="user-menu-caret">
          <ChevronDown size={14} />
        </span>
      </button>
    </div>
  );
}
