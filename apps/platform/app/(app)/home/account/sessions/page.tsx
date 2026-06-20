import { getSupabaseServerSession } from "@packages/supabase/client.server";
import { SUPABASE_JWT_DECODE_PAYLOAD } from "@packages/supabase/jwt";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { SessionsSection, type SessionsSectionSessionFragmentType } from "./sessions-section";

const SessionsSectionPageQuery = gql(`
  query SessionsSectionPageQuery {
    viewerSessions {
      edges {
        node {
          ...SessionsSectionSessionFragment
        }
      }
    }
  }
`);

export default async function SessionsPage(props: PageProps<"/home/account/sessions">) {
  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: SessionsSectionPageQuery });
  const serverSession = await getSupabaseServerSession();
  const payload = serverSession?.["access_token"] ? SUPABASE_JWT_DECODE_PAYLOAD(serverSession["access_token"]) : null;
  const sessions: SessionsSectionSessionFragmentType[] =
    data?.["viewerSessions"]?.["edges"].map((edge) => edge["node"]) || [];

  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-180 flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-tiny font-semibold uppercase tracking-widest text-muted-foreground">
          {t("breadcrumb")}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("heading")}</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">{t("description")}</p>
      </header>
      <SessionsSection sessions={sessions} currentSessionId={payload?.["session_id"]} />
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Seguridad · Dispositivos",
  heading: "Dispositivos y sesiones",
  description:
    "Todos los lugares donde tu cuenta tiene sesión abierta. Si ves algo que no reconoces, ciérralo aquí mismo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Security · Devices",
  heading: "Devices & sessions",
  description: "Every place your account is signed in. If you see something you don't recognize, close it here.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Segurança · Dispositivos",
  heading: "Dispositivos e sessões",
  description: "Todos os lugares onde sua conta está com sessão aberta. Se ver algo que não reconhece, encerre aqui.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
