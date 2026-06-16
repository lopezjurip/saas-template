import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AccountMobileNav, AccountSidebar } from "./_components/sidebar";

export default async function AccountLayout(props: LayoutProps<"/home/account">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");
  const { t } = await getRosetta(LOCALES);

  return (
    <div className="bg-background relative flex min-h-svh w-full flex-col">
      <div className="bg-background flex min-w-0 shrink-0 items-center gap-2.5 border-b px-4 py-2.5 sm:px-4.5">
        <Link
          href={ROUTE("/")}
          aria-label="SaaS Template"
          className="inline-flex shrink-0 transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
        <span className="text-muted-foreground hidden text-sm/normal opacity-30 sm:inline">|</span>
        <Link
          href={ROUTE("/home")}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex shrink-0 items-center gap-1.5 rounded-md py-1 pr-2 pl-1.5 text-xs font-medium no-underline"
        >
          <ArrowLeft size={14} /> <span>{t("home")}</span>
        </Link>
        <span className="text-muted-foreground hidden text-sm/normal opacity-50 sm:inline">/</span>
        <span className="text-foreground hidden text-sm/normal font-medium sm:inline">{t("my_account")}</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-[232px_1fr] md:grid-rows-1">
        <div className="hidden md:block">
          <AccountSidebar />
        </div>
        <div className="md:hidden">
          <AccountMobileNav />
        </div>
        <main className="overflow-auto px-8 py-7">{props.children}</main>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  home: "Inicio",
  my_account: "Mi cuenta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  home: "Home",
  my_account: "My account",
};

const LOCALE_PT: typeof LOCALE_ES = {
  home: "Início",
  my_account: "Minha conta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
