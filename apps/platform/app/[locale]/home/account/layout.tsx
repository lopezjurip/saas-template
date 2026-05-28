import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountMobileNav, AccountSidebar } from "./_components/sidebar";

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

export default async function AccountLayout(props: LayoutProps<"/[locale]/home/account">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect(`/${locale}/auth`);
  const email = user["email"] ?? "";

  return (
    <div className="acc-shell">
      <div className="acc-topbar">
        <Link href={`/${locale}/home`} className="acc-back">
          <ArrowLeft size={14} /> <span>Inicio</span>
        </Link>
        <span className="acc-crumb-sep">/</span>
        <span className="acc-crumb-current">Mi cuenta</span>
        <div style={{ flex: 1 }} />
        <Link href={`/${locale}/home/account/profile`} className="acc-topbar-user">
          <span className="user-menu-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
            {INITIALS_OF(email)}
          </span>
          <span>{email}</span>
          <span style={{ color: "var(--muted-foreground)" }}>
            <ChevronDown size={13} />
          </span>
        </Link>
      </div>

      <div className="acc-body">
        <div className="hidden md:block">
          <AccountSidebar locale={locale} />
        </div>
        <div className="md:hidden">
          <AccountMobileNav locale={locale} />
        </div>
        <main className="acc-main">{props.children}</main>
      </div>
    </div>
  );
}
