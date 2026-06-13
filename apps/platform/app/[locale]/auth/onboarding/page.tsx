import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Star } from "lucide-react";
import Link from "next/link";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { getRosetta } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";
import { AuthCard } from "../_components/auth-card";
import { METHOD_CATALOG } from "./_components/method-catalog";
import { actionFinishOnboarding } from "./actions";
import {
  COUNT_DONE,
  METHOD_ORDER,
  ONBOARDING_METHOD_PATH,
  type OnboardingMethodId,
  type OnboardingMethodStatus,
} from "./state";
import { getViewerOnboardingState } from "./state.server";

/**
 * Hub sort: recommended-pending → pending → skipped → done. Done sinks to the bottom.
 */
const STATUS_ORDER: Record<OnboardingMethodStatus, number> = {
  pending: 1,
  skipped: 2,
  done: 3,
};

export default async function OnboardingHubPage(props: PageProps<"/[locale]/auth/onboarding">) {
  const { locale } = await props.params;
  const { t } = await getRosetta(LOCALES, locale);
  const methods = t("methods") as typeof LOCALE_ES.methods;
  const state = await getViewerOnboardingState();
  const firstName = state.profile_name_full?.trim().split(/\s+/)[0] || "";
  const done = COUNT_DONE(state.methods);
  const remaining = METHOD_ORDER.length - done;

  // TODO: overkill, AUTH_TWEAKS.OB_RECOMMENDED is always passkey. could be constant.
  const sorted: OnboardingMethodId[] = [...METHOD_ORDER].sort((a, b) => {
    const recA =
      a === AUTH_TWEAKS.OB_RECOMMENDED && state.methods[a] === "pending" ? 0 : STATUS_ORDER[state.methods[a]];
    const recB =
      b === AUTH_TWEAKS.OB_RECOMMENDED && state.methods[b] === "pending" ? 0 : STATUS_ORDER[state.methods[b]];
    return recA - recB;
  });

  return (
    <AuthCard className="max-w-120">
      <div
        className={cn(
          "flex flex-col",
          AUTH_TWEAKS.DENSITY === "compact" ? "gap-3.5" : AUTH_TWEAKS.DENSITY === "comfy" ? "gap-6" : "gap-4",
        )}
        data-density={AUTH_TWEAKS.DENSITY}
      >
        <div className="flex flex-col gap-1.5">
          <div className="text-tiny font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            {t("eyebrow")}
          </div>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-foreground">
            {firstName ? t("heading_with_name", { name: firstName }) : t("heading")}
          </h1>
          <p className="m-0 text-sm/normal leading-normal text-muted-foreground text-pretty">
            {remaining === 0 ? t("body_all_done") : t("body_pending")}
          </p>
        </div>

        {/* <ObProgress methods={state.methods} meter /> */}

        <div className="flex flex-col gap-2">
          {sorted.map((id) => {
            const meta = METHOD_CATALOG[id];
            const status = state.methods[id];
            const isRecommended = id === AUTH_TWEAKS.OB_RECOMMENDED && status === "pending";
            const isDone = status === "done";
            const isSkipped = status === "skipped";
            return (
              <Link
                key={id}
                href={ROUTE(ONBOARDING_METHOD_PATH(id), { locale })}
                className={cn(
                  "grid w-full grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border bg-background px-3.5 py-3 text-left text-foreground no-underline transition-colors hover:bg-accent",
                  isRecommended && "border-foreground/50",
                  isDone && "border-border/50 bg-transparent opacity-60 hover:opacity-100",
                  isSkipped && "border-dashed",
                )}
                data-status={status}
                data-recommended={isRecommended ? "true" : "false"}
              >
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-lg bg-muted text-foreground",
                    (isDone || isRecommended) && "bg-foreground text-background",
                  )}
                >
                  <meta.Icon size={16} />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="inline-flex flex-wrap items-center gap-2">
                    <span className={cn("text-sm font-medium text-foreground", isDone && "text-muted-foreground")}>
                      {methods[id].label}
                    </span>
                    {isRecommended && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-1.25 py-px text-tiny font-semibold uppercase tracking-[0.02em] text-background">
                        <Star size={9} /> {t("badge_recommended")}
                      </span>
                    )}
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full border px-1.25 py-px text-tiny font-semibold uppercase tracking-[0.02em] text-muted-foreground">
                        <Check size={10} /> {t("badge_done")}
                      </span>
                    )}
                    {isSkipped && <span className="text-xs text-muted-foreground">{t("badge_skipped")}</span>}
                  </span>
                  <span className="text-xs leading-[1.45] text-muted-foreground text-pretty">{methods[id].desc}</span>
                </span>
                <span className="inline-flex items-center justify-end self-center">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground",
                      isDone && "bg-transparent text-muted-foreground",
                    )}
                  >
                    {isDone ? t("action_edit") : isSkipped ? t("action_do_now") : t("action_add")}
                    {!isDone && <ArrowRight size={13} />}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <form action={actionFinishOnboarding} className="mt-1 flex flex-col border-t pt-3">
          <Button
            type="submit"
            variant="outline"
            className="h-11 w-full text-sm text-muted-foreground hover:text-foreground"
          >
            <span>{done > 0 ? t("cta_continue") : t("cta_skip_all")}</span>
            <ArrowRight size={15} />
          </Button>
        </form>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  eyebrow: "Onboarding · paso opcional",
  heading: "Asegura tu cuenta",
  heading_with_name: "Asegura tu cuenta, {{name}}",
  body_all_done: "Todo listo. Igual puedes editar cualquiera de tus métodos.",
  body_pending:
    "Agrega más formas de iniciar sesión. Puedes hacerlas en cualquier orden o saltártelas — se quedan disponibles en tu cuenta.",
  badge_recommended: "Recomendado",
  badge_done: "Listo",
  badge_skipped: "Saltado · puedes volver",
  action_edit: "Editar",
  action_do_now: "Hacer ahora",
  action_add: "Agregar",
  cta_continue: "Continuar a la app",
  cta_skip_all: "Saltar todo — lo configuro después",
  methods: {
    passkey: { label: "Passkey", desc: "Entra sin contraseña usando Face ID, Touch ID o una llave de seguridad." },
    password: { label: "Contraseña", desc: "Útil si pierdes acceso a tu dispositivo principal." },
    phone: { label: "Teléfono", desc: "Recibe códigos por SMS o WhatsApp cuando no tengas acceso al correo." },
    email: { label: "Correo", desc: "Para enlaces mágicos, recuperación de cuenta y notificaciones críticas." },
    document: { label: "Documento", desc: "Requerido para contratos, firma electrónica y procesos KYC." },
    profile: {
      label: "Perfil",
      desc: "Cómo te verán tus compañeros de organización. Lo prellenamos con lo que ya sabemos.",
    },
  },
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    eyebrow: "Onboarding · optional step",
    heading: "Secure your account",
    heading_with_name: "Secure your account, {{name}}",
    body_all_done: "All done. You can still edit any of your methods.",
    body_pending:
      "Add more ways to sign in. You can do them in any order or skip them — they stay available in your account.",
    badge_recommended: "Recommended",
    badge_done: "Done",
    badge_skipped: "Skipped · you can come back",
    action_edit: "Edit",
    action_do_now: "Do now",
    action_add: "Add",
    cta_continue: "Continue to app",
    cta_skip_all: "Skip all — I'll set it up later",
    methods: {
      passkey: { label: "Passkey", desc: "Sign in without a password using Face ID, Touch ID or a security key." },
      password: { label: "Password", desc: "Useful if you lose access to your primary device." },
      phone: { label: "Phone", desc: "Receive codes by SMS or WhatsApp when you don't have access to your email." },
      email: { label: "Email", desc: "For magic links, account recovery and critical notifications." },
      document: { label: "Document", desc: "Required for contracts, electronic signatures and KYC processes." },
      profile: {
        label: "Profile",
        desc: "How your organization teammates will see you. We pre-fill with what we already know.",
      },
    },
  } satisfies typeof LOCALE_ES,
  pt: {
    eyebrow: "Onboarding · etapa opcional",
    heading: "Proteja sua conta",
    heading_with_name: "Proteja sua conta, {{name}}",
    body_all_done: "Tudo pronto. Você ainda pode editar qualquer um dos seus métodos.",
    body_pending:
      "Adicione mais formas de entrar. Você pode fazê-las em qualquer ordem ou pulá-las — ficam disponíveis na sua conta.",
    badge_recommended: "Recomendado",
    badge_done: "Pronto",
    badge_skipped: "Pulado · você pode voltar",
    action_edit: "Editar",
    action_do_now: "Fazer agora",
    action_add: "Adicionar",
    cta_continue: "Continuar para o app",
    cta_skip_all: "Pular tudo — configuro depois",
    methods: {
      passkey: { label: "Passkey", desc: "Entre sem senha usando Face ID, Touch ID ou uma chave de segurança." },
      password: { label: "Senha", desc: "Útil se você perder o acesso ao seu dispositivo principal." },
      phone: { label: "Telefone", desc: "Receba códigos por SMS ou WhatsApp quando não tiver acesso ao e-mail." },
      email: { label: "E-mail", desc: "Para links mágicos, recuperação de conta e notificações críticas." },
      document: { label: "Documento", desc: "Necessário para contratos, assinatura eletrônica e processos KYC." },
      profile: {
        label: "Perfil",
        desc: "Como seus colegas de organização vão te ver. Preenchemos com o que já sabemos.",
      },
    },
  } satisfies typeof LOCALE_ES,
};
