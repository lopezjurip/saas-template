import { createSupabaseServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { PasskeysList } from "../passkeys-list";

export default async function SecurityPasskeysPage(props: PageProps<"/home/account/security/passkeys">) {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth");

  const supabase = await createSupabaseServerClient();
  const { data: passkeyData } = await supabase.auth.passkey.list();
  const passkeys = passkeyData ?? [];

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-muted-foreground text-tiny font-semibold tracking-[0.08em] uppercase">
          {t("breadcrumb")}
        </span>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground text-sm/normal leading-relaxed text-pretty">{t("description")}</p>
      </header>

      <div className="flex flex-col gap-3.5">
        <PasskeysList passkeys={passkeys} />

        <Link
          href={ROUTE("/auth/onboarding/passkey")}
          className="bg-muted text-foreground inline-flex w-fit items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap no-underline"
        >
          {passkeys.length > 0 ? t("add_another") : t("add_first")} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Seguridad · Passkeys",
  heading: "Passkeys",
  description: "Entra sin contraseña con la huella, el rostro o el PIN de tu dispositivo.",
  add_first: "Agregar passkey",
  add_another: "Agregar otra passkey",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Security · Passkeys",
  heading: "Passkeys",
  description: "Sign in without a password using your device's fingerprint, face, or PIN.",
  add_first: "Add passkey",
  add_another: "Add another passkey",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Segurança · Passkeys",
  heading: "Passkeys",
  description: "Entre sem senha usando a impressão digital, o rosto ou o PIN do seu dispositivo.",
  add_first: "Adicionar passkey",
  add_another: "Adicionar outra passkey",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
