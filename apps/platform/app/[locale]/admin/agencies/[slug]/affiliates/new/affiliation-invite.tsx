"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Check, Copy, Eye, Link2, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";

const ACCEPT_LINK = "https://app.humane.cl/auth/accept?token=aff_9f2c8a3b41e7d602";

type Stage = "form" | "sent";

export function AffiliationInvite({
  agencyName,
  agencyHref,
  defaultEmail,
}: {
  agencyName: string;
  agencyHref: string;
  defaultEmail: string;
}) {
  const { t } = useRosetta(LOCALES);
  const [stage, setStage] = useState<Stage>("form");
  const [email, setEmail] = useState(defaultEmail);
  const [copied, setCopied] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col gap-7 px-6 py-8">
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 self-start">
        <Link href={agencyHref}>← {agencyName}</Link>
      </Button>

      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.08em]">
            {t("eyebrow", { agency: agencyName })}
          </span>
          <h1 className="text-foreground m-0 text-[22px] font-semibold tracking-[-0.02em]">{t("title")}</h1>
          <p className="text-muted-foreground m-0 max-w-[60ch] text-[13.5px] leading-[1.55] [text-wrap:pretty]">
            {t("subtitle", { agency: agencyName })}
          </p>
        </header>

        {stage === "form" ? (
          <>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="aff-email">{t("email_label")}</Label>
              <div className="relative">
                <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                  <Mail size={16} />
                </span>
                <Input
                  id="aff-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="persona@firma.cl"
                  className="pl-9"
                />
              </div>
              <p className="text-muted-foreground text-xs leading-[1.5]">{t("email_hint")}</p>
            </div>

            <div className="border-border bg-muted/40 flex items-start gap-2.5 rounded-md border px-3.5 py-3">
              <span className="text-muted-foreground mt-px shrink-0">
                <Eye size={15} />
              </span>
              <span className="text-muted-foreground text-[12px] leading-[1.5] [text-wrap:pretty]">
                {t("read_only_note", { agency: agencyName })}
              </span>
            </div>

            <Button className="h-9 w-full" onClick={() => setStage("sent")}>
              <UserPlus size={16} /> {t("send")}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Check size={22} strokeWidth={2.5} />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-foreground text-[15px] font-semibold tracking-[-0.01em]">{t("sent_title")}</span>
                <span className="text-muted-foreground text-[12.5px] leading-[1.5] [text-wrap:pretty]">
                  {t("sent_desc_prefix")} <strong className="text-foreground font-medium">{email}</strong>.{" "}
                  {t("sent_desc_suffix")}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
                {t("accept_link")}
              </span>
              <div className="border-border bg-muted/40 flex items-center gap-2 rounded-md border px-3 py-2.5">
                <Link2 size={15} className="text-muted-foreground shrink-0" />
                <code className="text-foreground flex-1 truncate font-mono text-[11.5px]">{ACCEPT_LINK}</code>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-[30px] shrink-0"
                  aria-label={t("copy_link")}
                  onClick={() => {
                    navigator.clipboard?.writeText(ACCEPT_LINK).catch(() => {});
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs leading-[1.5]">{t("accept_hint")}</p>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEmail("");
                  setCopied(false);
                  setStage("form");
                }}
              >
                <UserPlus size={15} /> {t("invite_another")}
              </Button>
              <Button asChild className="flex-1">
                <Link href={agencyHref}>
                  {t("done")} <ArrowRight size={15} />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const LOCALE_ES = {
  eyebrow: "{{agency}} · Afiliar",
  title: "Afiliar a una persona",
  subtitle:
    "La invitas por correo. Cuando acepte, se une a {{agency}} como afiliado y hereda los accesos de la agencia — siempre de solo lectura.",
  email_label: "Correo de la persona",
  email_hint: "Le enviaremos un enlace para aceptar. Si aún no tiene cuenta, podrá crearla al entrar.",
  read_only_note:
    "Los afiliados no son miembros de ninguna organización ni pueden escribir. Heredan únicamente los accesos de lectura que tenga {{agency}}.",
  send: "Enviar invitación",
  sent_title: "Invitación enviada",
  sent_desc_prefix: "Enviamos un enlace de aceptación a",
  sent_desc_suffix: "Se afiliará en cuanto acepte.",
  accept_link: "Enlace de aceptación",
  copy_link: "Copiar enlace",
  accept_hint: "Caduca en 14 días. Puedes compartirlo tú mismo si la persona no recibe el correo.",
  invite_another: "Afiliar a otra",
  done: "Listo",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "{{agency}} · Affiliate",
  title: "Affiliate a person",
  subtitle:
    "You invite them by email. When they accept, they join {{agency}} as an affiliate and inherit the agency's access — always read-only.",
  email_label: "Person's email",
  email_hint: "We'll send them a link to accept. If they don't have an account yet, they can create one on the way in.",
  read_only_note:
    "Affiliates are not members of any organization and cannot write. They only inherit the read access that {{agency}} has.",
  send: "Send invitation",
  sent_title: "Invitation sent",
  sent_desc_prefix: "We sent an acceptance link to",
  sent_desc_suffix: "They'll be affiliated as soon as they accept.",
  accept_link: "Acceptance link",
  copy_link: "Copy link",
  accept_hint: "Expires in 14 days. You can share it yourself if the person doesn't receive the email.",
  invite_another: "Affiliate another",
  done: "Done",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "{{agency}} · Afiliar",
  title: "Afiliar uma pessoa",
  subtitle:
    "Você a convida por e-mail. Quando aceitar, ela entra na {{agency}} como afiliada e herda os acessos da agência — sempre somente leitura.",
  email_label: "E-mail da pessoa",
  email_hint: "Enviaremos um link para aceitar. Se ainda não tiver conta, poderá criá-la ao entrar.",
  read_only_note:
    "Os afiliados não são membros de nenhuma organização nem podem escrever. Herdam apenas os acessos de leitura que a {{agency}} tiver.",
  send: "Enviar convite",
  sent_title: "Convite enviado",
  sent_desc_prefix: "Enviamos um link de aceitação para",
  sent_desc_suffix: "Será afiliada assim que aceitar.",
  accept_link: "Link de aceitação",
  copy_link: "Copiar link",
  accept_hint: "Expira em 14 dias. Você pode compartilhá-lo se a pessoa não receber o e-mail.",
  invite_another: "Afiliar outra",
  done: "Pronto",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
