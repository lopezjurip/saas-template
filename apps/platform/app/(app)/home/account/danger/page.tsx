import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";
import { gql } from "~/generated/graphql";
import { getGraphySession } from "~/lib/graphy/graphy.server";
import { getRosetta } from "~/lib/i18n.server";
import { DeleteAccountDialog } from "./delete-account-dialog";

const DangerPageQuery = gql(`
  query DangerPageQuery {
    viewerOrganizations(filter: { organizationDisabledAt: { is: NULL } }) {
      edges {
        node {
          organizationId
        }
      }
    }
  }
`);

export default async function DangerPage() {
  const user = await getSupabaseServerUser();
  if (!user) redirect("/auth?next=/home/account/danger");

  const graphy = await getGraphySession();
  const { data } = await graphy.query({ query: DangerPageQuery });
  const orgCount = data?.["viewerOrganizations"]?.["edges"].length ?? 0;
  const email = user["email"] ?? "";

  const { t } = await getRosetta(LOCALES);

  const DELETE_IMPACT = [
    {
      text: t("impact_orgs_text"),
      strong: t(orgCount === 1 ? "impact_orgs_strong_one" : "impact_orgs_strong_many", { count: orgCount }),
      tail: t("impact_orgs_tail"),
    },
    { text: t("impact_sessions_text"), strong: t("impact_sessions_strong"), tail: t("impact_sessions_tail") },
    { text: t("impact_email_text"), strong: email, tail: t("impact_email_tail") },
  ];

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-tiny font-semibold uppercase tracking-widest text-muted-foreground">
          {t("breadcrumb")}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("heading")}</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">{t("description")}</p>
      </header>

      <div className="flex flex-col gap-3.5 rounded-xl border border-destructive/50 bg-destructive/4 px-5 py-4 dark:border-[hsl(0_70%_50%/0.45)] dark:bg-[hsl(0_70%_30%/0.1)]">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-destructive dark:text-[hsl(0_70%_70%)]">
            {t("warning_title")}
          </span>
          <span className="text-xs leading-relaxed text-muted-foreground">{t("warning_preamble")}</span>
        </div>
        <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed text-muted-foreground">
          {DELETE_IMPACT.map((item) => (
            <li key={item.strong}>
              {item.text} <strong className="font-medium text-foreground">{item.strong}</strong> {item.tail}
            </li>
          ))}
        </ul>
        <div className="mt-1 flex items-center justify-between gap-3.5 border-t border-destructive/25 pt-3 dark:border-[hsl(0_70%_50%/0.25)]">
          <span className="max-w-[40ch] text-xs leading-relaxed text-muted-foreground text-pretty">
            {t("deactivate_hint")}
          </span>
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Zona de riesgo",
  heading: "Eliminar tu cuenta",
  description:
    "Al eliminar tu cuenta borramos tus datos personales, sesiones y tokens. Lo que hayas creado dentro de una organización sigue siendo de esa organización — habla con su admin si quieres bajarlo antes.",
  warning_title: "Esto no se puede deshacer.",
  warning_preamble: "Antes de continuar, ten en cuenta:",
  // impact items: text · strong · tail
  impact_orgs_text: "Sales de",
  impact_orgs_strong_one: "{{count}} organización",
  impact_orgs_strong_many: "{{count}} organizaciones",
  impact_orgs_tail: "donde tienes acceso.",
  impact_sessions_text: "Las sesiones en",
  impact_sessions_strong: "todos tus dispositivos",
  impact_sessions_tail: "se cierran.",
  impact_email_text: "El correo",
  impact_email_tail: "queda libre para registrarse de nuevo en 30 días.",
  // footer
  deactivate_hint: "¿Solo necesitas un descanso? También puedes desactivar la cuenta temporalmente.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Danger zone",
  heading: "Delete your account",
  description:
    "Deleting your account removes your personal data, sessions, and tokens. What you created inside an organization stays with that organization — talk to its admin if you want to download it first.",
  warning_title: "This cannot be undone.",
  warning_preamble: "Before continuing, keep in mind:",
  impact_orgs_text: "You will leave",
  impact_orgs_strong_one: "{{count}} organization",
  impact_orgs_strong_many: "{{count}} organizations",
  impact_orgs_tail: "you currently have access to.",
  impact_sessions_text: "Sessions on",
  impact_sessions_strong: "all your devices",
  impact_sessions_tail: "are closed.",
  impact_email_text: "Your email",
  impact_email_tail: "becomes available for new registrations after 30 days.",
  deactivate_hint: "Just need a break? You can also deactivate your account temporarily.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Zona de risco",
  heading: "Excluir sua conta",
  description:
    "Ao excluir sua conta, apagamos seus dados pessoais, sessões e tokens. O que você criou dentro de uma organização continua sendo dela — fale com o admin se quiser baixar antes.",
  warning_title: "Isso não pode ser desfeito.",
  warning_preamble: "Antes de continuar, considere:",
  impact_orgs_text: "Você sairá de",
  impact_orgs_strong_one: "{{count}} organização",
  impact_orgs_strong_many: "{{count}} organizações",
  impact_orgs_tail: "às quais tem acesso.",
  impact_sessions_text: "As sessões em",
  impact_sessions_strong: "todos os seus dispositivos",
  impact_sessions_tail: "são encerradas.",
  impact_email_text: "O e-mail",
  impact_email_tail: "fica disponível para novo cadastro após 30 dias.",
  deactivate_hint: "Só precisa de uma pausa? Você também pode desativar a conta temporariamente.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
