import { getRosetta } from "~/hooks/get-rosetta";
import { TokensManager } from "./tokens-manager";

export default async function TokensPage() {
  const { t } = await getRosetta(LOCALES);

  return (
    <div className="flex max-w-[720px] flex-col gap-4.5">
      <header className="flex flex-col gap-1">
        <span className="text-tiny font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {t("breadcrumb")}
        </span>
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">{t("heading")}</h1>
        <p className="text-pretty text-sm/normal leading-normal text-muted-foreground">{t("description")}</p>
      </header>
      <TokensManager />
      <p className="text-[12.5px] leading-relaxed text-muted-foreground text-pretty">{t("footnote")}</p>
    </div>
  );
}

const LOCALE_ES = {
  breadcrumb: "Desarrollo · API",
  heading: "Tokens personales",
  description:
    "Genera tokens para automatizar tareas o conectar con la API. Heredan tus permisos en cada organización — trátalos como contraseñas.",
  footnote: "¿Olvidaste guardar el secreto? Los tokens solo se muestran una vez al crearlos. Revoca y crea uno nuevo.",
};

const LOCALE_EN: typeof LOCALE_ES = {
  breadcrumb: "Development · API",
  heading: "Personal tokens",
  description:
    "Generate tokens to automate tasks or connect to the API. They inherit your permissions in each organization — treat them like passwords.",
  footnote: "Forgot to save the secret? Tokens are only shown once when created. Revoke and create a new one.",
};

const LOCALE_PT: typeof LOCALE_ES = {
  breadcrumb: "Desenvolvimento · API",
  heading: "Tokens pessoais",
  description:
    "Gere tokens para automatizar tarefas ou conectar à API. Herdam suas permissões em cada organização — trate-os como senhas.",
  footnote: "Esqueceu de salvar o segredo? Os tokens só são exibidos uma vez ao criá-los. Revogue e crie um novo.",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
