import { Logo } from "@packages/ui-common/logo";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { SINGLE } from "@packages/utils/array";
import { ArrowRight, Check, X } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getRosetta } from "~/hooks/get-rosetta";
import { assertLocale } from "~/lib/i18n.server";
import { ROUTE } from "~/lib/route";

type AcceptState = "valid" | "loggedout" | "expired" | "claimed" | "rejected";

// Mock invitation — real lookup by token/invite_id lands in the backend pass.
const ORG = "Acme Studio";
const INVITED_BY = "Andrea Gómez";
const DESTINATION = "nora@startup.io";
const VIEWER = { name: "Nora Bravo", initials: "NB" };
const SLUGS = /*#__PURE__*/ ["content_edit", "content_publish", "reports_view"];

export async function generateMetadata(props: PageProps<"/[locale]/home/invites/[invite_id]">): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function AcceptInvitePage(props: PageProps<"/[locale]/home/invites/[invite_id]">) {
  const { locale } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);
  const sp = await props.searchParams;
  const state = (SINGLE(sp["state"]) ?? "valid") as AcceptState;

  const firstName = INVITED_BY.split(" ")[0];
  const homeHref = ROUTE("/[locale]/home", { locale });

  return (
    <div
      className="font-sans relative flex min-h-svh w-full items-center justify-center px-5 py-10"
      style={{
        background: "radial-gradient(ellipse at top, hsl(var(--muted) / 0.6), transparent 60%), hsl(var(--background))",
      }}
    >
      <Logo className="absolute left-6 top-5 text-sm" />

      {state === "rejected" || state === "expired" ? (
        <div className={CARD}>
          <span className="bg-muted text-muted-foreground inline-flex size-12 items-center justify-center rounded-xl">
            <X size={22} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-foreground m-0 text-[19px] font-semibold tracking-[-0.01em]">
              {state === "rejected" ? t("rejected_title") : t("expired_title")}
            </h1>
            <p className="text-muted-foreground m-0 text-[13.5px] leading-[1.55] [text-wrap:pretty]">
              {state === "rejected"
                ? t("rejected_desc", { name: firstName, org: ORG })
                : t("expired_desc", { org: ORG })}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link href={homeHref}>{t("go_home")}</Link>
          </Button>
        </div>
      ) : state === "claimed" ? (
        <div className={CARD}>
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Check size={24} strokeWidth={2.25} />
          </span>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-foreground m-0 text-[19px] font-semibold tracking-[-0.01em]">
              {t("claimed_title", { org: ORG })}
            </h1>
            <p className="text-muted-foreground m-0 text-[13.5px] leading-[1.55] [text-wrap:pretty]">
              {t("claimed_desc")}
            </p>
          </div>
          <Button asChild className="w-full">
            <Link href={homeHref}>
              {t("enter_org", { org: ORG })} <ArrowRight size={16} />
            </Link>
          </Button>
        </div>
      ) : (
        <div className={CARD}>
          <div className="flex items-center gap-3.5">
            <span className="bg-foreground text-background inline-flex size-[52px] shrink-0 items-center justify-center rounded-[14px] text-lg font-semibold tracking-[-0.02em]">
              {ORG.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.06em]">
                {t("invitation")}
              </span>
              <span className="text-foreground truncate text-[15px] font-semibold tracking-[-0.01em]">{ORG}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h1 className="text-foreground m-0 text-[19px] font-semibold tracking-[-0.01em] [text-wrap:balance]">
              {t("invited_title", { name: firstName })}
            </h1>
            <p className="text-muted-foreground m-0 text-sm/normal leading-[1.5] [text-wrap:pretty]">
              {t("invited_desc", { name: INVITED_BY, org: ORG })}
            </p>
          </div>

          <div className="border-border bg-muted/35 flex flex-col gap-2 rounded-lg border px-3.5 py-3">
            <span className="text-muted-foreground text-tiny font-semibold uppercase tracking-[0.07em]">
              {t("perms_title")}
            </span>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              {SLUGS.map((slug) => (
                <li key={slug} className="text-foreground inline-flex items-center gap-2 text-sm/normal">
                  <span className="shrink-0 text-emerald-700 dark:text-emerald-300">
                    <Check size={14} strokeWidth={2.5} />
                  </span>
                  {t(`perm_${slug}` as "perm_content_edit")}
                </li>
              ))}
            </ul>
          </div>

          {state === "loggedout" ? (
            <div className="flex flex-col gap-2.5">
              <p className="text-muted-foreground text-[12.5px] leading-[1.5] [text-wrap:pretty]">
                {t("loggedout_desc", { dest: DESTINATION })}
              </p>
              <Button asChild className="w-full">
                <Link href={ROUTE("/[locale]/auth", { locale })}>
                  {t("continue_accept")} <ArrowRight size={16} />
                </Link>
              </Button>
              <span className="text-muted-foreground text-center text-xs">
                {t("not_you")} <span className="text-foreground underline underline-offset-[3px]">{t("reject")}</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div className="border-border bg-muted/45 flex items-center gap-2.5 rounded-md border px-3 py-2">
                <span className="bg-primary text-primary-foreground inline-flex size-7 items-center justify-center rounded-full text-[11px] font-semibold">
                  {VIEWER["initials"]}
                </span>
                <div className="flex min-w-0 flex-1 flex-col leading-[1.2]">
                  <span className="text-foreground truncate text-[12.5px] font-medium">{VIEWER["name"]}</span>
                  <span className="text-muted-foreground truncate text-xs">{DESTINATION}</span>
                </div>
                <span className="text-muted-foreground shrink-0 text-[11px]">{t("your_session")}</span>
              </div>
              <Button className="w-full">
                <Check size={16} strokeWidth={2.25} /> {t("accept")}
              </Button>
              <Button variant="ghost" className="text-muted-foreground w-full">
                {t("reject")}
              </Button>
            </div>
          )}

          <div className="-mt-1 flex flex-col items-center gap-1">
            <p className="text-muted-foreground/80 text-center text-[11px] leading-[1.45]">{t("expires_14")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

const CARD =
  "w-full max-w-[400px] bg-card text-card-foreground border border-border rounded-2xl shadow-[0_1px_3px_hsl(0_0%_0%/0.04),0_18px_48px_hsl(0_0%_0%/0.1)] p-6 flex flex-col gap-5";

const LOCALE_ES = {
  page_title: "Aceptar invitación",
  invitation: "Invitación",
  invited_title: "{{name}} te invitó a unirte",
  invited_desc: "{{name}} quiere que colabores en {{org}}.",
  perms_title: "Tendrás estos permisos",
  perm_content_edit: "Editar contenido",
  perm_content_publish: "Publicar contenido",
  perm_reports_view: "Ver reportes",
  loggedout_desc: "Inicia sesión o crea tu cuenta con {{dest}} para aceptar. Vinculamos la invitación automáticamente.",
  continue_accept: "Continuar para aceptar",
  not_you: "¿No eras tú?",
  your_session: "Tu sesión",
  accept: "Aceptar invitación",
  reject: "Rechazar",
  expires_14: "El enlace caduca en 14 días",
  go_home: "Ir al inicio",
  rejected_title: "Rechazaste la invitación",
  rejected_desc:
    "Le avisamos a {{name}} que por ahora no te unirás a {{org}}. Si fue un error, pídele un enlace nuevo.",
  expired_title: "Este enlace ya no sirve",
  expired_desc: "La invitación a {{org}} caducó o fue cancelada. Pídele a quien te invitó que te envíe una nueva.",
  claimed_title: "Ya eres parte de {{org}}",
  claimed_desc: "Esta invitación ya fue aceptada. Entra a la organización para empezar a trabajar.",
  enter_org: "Entrar a {{org}}",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Accept invitation",
  invitation: "Invitation",
  invited_title: "{{name}} invited you to join",
  invited_desc: "{{name}} wants you to collaborate on {{org}}.",
  perms_title: "You'll get these permissions",
  perm_content_edit: "Edit content",
  perm_content_publish: "Publish content",
  perm_reports_view: "View reports",
  loggedout_desc: "Sign in or create your account with {{dest}} to accept. We link the invitation automatically.",
  continue_accept: "Continue to accept",
  not_you: "Not you?",
  your_session: "Your session",
  accept: "Accept invitation",
  reject: "Reject",
  expires_14: "The link expires in 14 days",
  go_home: "Go home",
  rejected_title: "You rejected the invitation",
  rejected_desc: "We let {{name}} know you won't join {{org}} for now. If it was a mistake, ask for a new link.",
  expired_title: "This link no longer works",
  expired_desc: "The invitation to {{org}} expired or was cancelled. Ask whoever invited you to send a new one.",
  claimed_title: "You're already part of {{org}}",
  claimed_desc: "This invitation was already accepted. Enter the organization to start working.",
  enter_org: "Enter {{org}}",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Aceitar convite",
  invitation: "Convite",
  invited_title: "{{name}} convidou você para entrar",
  invited_desc: "{{name}} quer que você colabore em {{org}}.",
  perms_title: "Você terá estas permissões",
  perm_content_edit: "Editar conteúdo",
  perm_content_publish: "Publicar conteúdo",
  perm_reports_view: "Ver relatórios",
  loggedout_desc: "Entre ou crie sua conta com {{dest}} para aceitar. Vinculamos o convite automaticamente.",
  continue_accept: "Continuar para aceitar",
  not_you: "Não era você?",
  your_session: "Sua sessão",
  accept: "Aceitar convite",
  reject: "Recusar",
  expires_14: "O link expira em 14 dias",
  go_home: "Ir para o início",
  rejected_title: "Você recusou o convite",
  rejected_desc: "Avisamos {{name}} que por enquanto você não entrará em {{org}}. Se foi engano, peça um link novo.",
  expired_title: "Este link não funciona mais",
  expired_desc: "O convite para {{org}} expirou ou foi cancelado. Peça a quem convidou para enviar um novo.",
  claimed_title: "Você já faz parte de {{org}}",
  claimed_desc: "Este convite já foi aceito. Entre na organização para começar a trabalhar.",
  enter_org: "Entrar em {{org}}",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
