import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { Logo } from "@packages/ui-common/logo";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AccountMobileNav, AccountSidebar } from "./_components/sidebar";

export default async function AccountLayout(props: LayoutProps<"/[locale]/home/account">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect("/[locale]/auth");
  const email = user["email"] ?? "";
  const { t } = await getRosetta(LOCALES);

  return (
    <div className="bg-background relative flex min-h-svh w-full flex-col">
      <div className="bg-background flex shrink-0 items-center gap-2.5 border-b px-4.5 py-2.5">
        <Link
          href={ROUTE("/[locale]", { locale })}
          aria-label="SaaS Template"
          className="inline-flex shrink-0 transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>
        <span className="text-muted-foreground text-sm/normal opacity-30">|</span>
        <Link
          href={ROUTE("/[locale]/home", { locale })}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-md py-1 pr-2 pl-1.5 text-[12.5px] font-medium no-underline"
        >
          <ArrowLeft size={14} /> <span>{t("home")}</span>
        </Link>
        <span className="text-muted-foreground text-sm/normal opacity-50">/</span>
        <span className="text-foreground text-sm/normal font-medium">{t("my_account")}</span>
        <div className="flex-1" />
        <Link
          href={ROUTE("/[locale]/home/account/profile", { locale })}
          className="text-foreground bg-background hover:bg-accent inline-flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-2 pl-1 text-xs"
        >
          <span className="bg-primary text-primary-foreground inline-flex size-6.5 items-center justify-center rounded-full text-tiny font-semibold">
            {INITIALS_OF(email)}
          </span>
          <span>{email}</span>
          <span className="text-muted-foreground">
            <ChevronDown size={13} />
          </span>
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] md:grid-cols-[232px_1fr] md:grid-rows-1">
        <div className="hidden md:block">
          <AccountSidebar locale={locale} />
        </div>
        <div className="md:hidden">
          <AccountMobileNav locale={locale} />
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
