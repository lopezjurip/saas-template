import { SINGLE } from "@packages/utils/array";
import { redirect } from "next/navigation";
import { getRosetta } from "~/lib/i18n.server";
import { AuthBackLink } from "../../_components/auth-back-link";
import { AuthCard } from "../../_components/auth-card";
import { AuthHeader } from "../../_components/auth-header";
import { AcceptSignupForm } from "./accept-signup-form";

export default async function AuthDocumentAcceptPage(props: PageProps<"/auth/document/accept">) {
  const sp = await props.searchParams;
  const token = SINGLE(sp["token"]) ?? "";

  if (!token) {
    redirect("/auth");
  }

  const { t } = await getRosetta(LOCALES);

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <div className="flex flex-col gap-4.5">
          <AuthBackLink />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 text-xl/normal font-semibold tracking-tight text-foreground">{t("heading")}</h1>
            <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">{t("body")}</p>
          </div>
          <AcceptSignupForm token={token} />
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  heading: "Tienes una invitación",
  body: "Completa tus datos para crear tu cuenta y unirte. Verificamos con un código de un solo uso.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "You have an invitation",
  body: "Complete your details to create your account and join. We verify with a one-time code.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Tem um convite",
  body: "Complete os seus dados para criar a sua conta e aderir. Verificamos com um código único.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
