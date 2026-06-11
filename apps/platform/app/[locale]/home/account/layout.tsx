import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { INITIALS_OF } from "@packages/utils/string";
import { ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ROUTE } from "~/lib/route";
import { AccountMobileNav, AccountSidebar } from "./_components/sidebar";

export default async function AccountLayout(props: LayoutProps<"/[locale]/home/account">) {
  const { locale } = await props.params;
  const user = await getSupabaseServerUser();
  if (!user) redirect("/[locale]/auth");
  const email = user["email"] ?? "";

  return (
    <div className="bg-background relative flex min-h-svh w-full flex-col">
      <div className="bg-background flex shrink-0 items-center gap-2.5 border-b px-[18px] py-2.5">
        <Link
          href={ROUTE("/[locale]/home", { locale })}
          className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex items-center gap-1.5 rounded-md py-1 pr-2 pl-1.5 text-[12.5px] font-medium no-underline"
        >
          <ArrowLeft size={14} /> <span>Inicio</span>
        </Link>
        <span className="text-muted-foreground text-sm/normal opacity-50">/</span>
        <span className="text-foreground text-sm/normal font-medium">Mi cuenta</span>
        <div className="flex-1" />
        <Link
          href={ROUTE("/[locale]/home/account/profile", { locale })}
          className="text-foreground bg-background hover:bg-accent inline-flex cursor-pointer items-center gap-2 rounded-full border py-1 pr-2 pl-1 text-xs"
        >
          <span className="bg-primary text-primary-foreground inline-flex size-[26px] items-center justify-center rounded-full text-[11px] font-semibold">
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
