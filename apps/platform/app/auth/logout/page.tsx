import { getSupabaseClientUser } from "@packages/supabase/client.browser";
import { ButtonSpinner } from "@packages/ui-common/button-spinner";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { INITIALS_OF } from "@packages/utils/string";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { getViewerProfileRedirect } from "~/hooks/get-viewer-profile";
import { getRosetta, getServerLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
import { signOutForm } from "./actions";

export default async function AuthLogoutPage() {
  const locale = await getServerLocale();
  const {
    data: { profile },
  } = await getViewerProfileRedirect();
  const user = await getSupabaseClientUser();

  const name_full = profile["profileNameFull"];
  const email = user["email"];
  const initials = INITIALS_OF(name_full || email || "User");

  const { t } = await getRosetta(LOCALES, locale);

  return (
    <AuthCard className="max-w-104">
      <div className="flex flex-col gap-4.5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut size={22} />
          </span>
          <div>
            <h1 className="m-0 text-xl/normal font-semibold tracking-tight text-foreground">{t("heading")}</h1>
            <p className="mt-1.5 mb-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{t("body")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-md border bg-muted/45 px-3 py-2.5">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-sm/normal font-medium text-background">
            {initials || "?"}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            {name_full && <div className="truncate text-sm font-medium text-foreground">{name_full}</div>}
            <div className="truncate text-xs text-muted-foreground">{email}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <form action={signOutForm}>
            <ButtonSpinner
              variant="destructive"
              pendingChildren={
                <>
                  <LogOut size={16} />
                  <span>{t("signing_out")}</span>
                </>
              }
              className="h-10 w-full"
            >
              <LogOut size={16} />
              <span>{t("sign_out")}</span>
            </ButtonSpinner>
          </form>
          <Button asChild variant="ghost" className="h-10 w-full text-muted-foreground">
            <Link href={ROUTE("/home")}>{t("cancel")}</Link>
          </Button>
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  heading: "¿Cerrar sesión?",
  body: "Tendrás que volver a identificarte para entrar a tus organizaciones.",
  sign_out: "Cerrar sesión",
  signing_out: "Cerrando sesión…",
  cancel: "Cancelar",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "Sign out?",
  body: "You'll need to identify yourself again to access your organizations.",
  sign_out: "Sign out",
  signing_out: "Signing out…",
  cancel: "Cancel",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Terminar sessão?",
  body: "Precisará identificar-se novamente para aceder às suas organizações.",
  sign_out: "Terminar sessão",
  signing_out: "A terminar sessão…",
  cancel: "Cancelar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
