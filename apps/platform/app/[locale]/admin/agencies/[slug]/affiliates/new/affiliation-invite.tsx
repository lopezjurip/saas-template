"use client";

import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { ArrowRight, Check, Eye, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionInviteAffiliate } from "~/app/[locale]/a/[agency_slug]/actions";

type Stage = "form" | "sent";

export function AffiliationInvite({
  agencyId,
  agencyName,
  agencyHref,
}: {
  agencyId: string;
  agencyName: string;
  agencyHref: string;
}) {
  const { t } = useRosetta(LOCALES);
  const [stage, setStage] = useState<Stage>("form");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setServerError(null);
    const value = email.trim().toLowerCase();
    if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setServerError(t("email_invalid"));
      return;
    }
    startTransition(async () => {
      const [data, error] = await ErrorSafeAction.unwrap(
        actionInviteAffiliate({ agency_id: agencyId, invitation_email: value }),
      );
      if (error instanceof ErrorSafeActionServer) {
        setServerError(error.serverError);
        return;
      }
      if (error instanceof ErrorSafeActionValidation) {
        setServerError(t("email_invalid"));
        return;
      }
      if (error) return;
      setSentTo(data.email);
      setStage("sent");
    });
  }

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
            {serverError ? (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            ) : null}

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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                  }}
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

            <Button className="h-9 w-full" onClick={submit} disabled={pending}>
              <UserPlus size={16} /> {pending ? t("sending") : t("send")}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="inline-flex size-12 items-center justify-center rounded-full border border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Check size={22} strokeWidth={2.5} />
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-foreground text-[15px] font-semibold tracking-[-0.01em]">{t("sent_title")}</span>
                <span className="text-muted-foreground text-[12.5px] leading-[1.5] [text-wrap:pretty]">
                  {t("sent_desc_prefix")} <strong className="text-foreground font-medium">{sentTo}</strong>.{" "}
                  {t("sent_desc_suffix")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setEmail("");
                  setServerError(null);
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
    "La invitas por correo. Cuando acepte, se une a {{agency}} como afiliada y hereda los accesos de la agencia — siempre de solo lectura.",
  email_label: "Correo de la persona",
  email_hint: "Le enviaremos un enlace para aceptar. Si aún no tiene cuenta, podrá crearla al entrar.",
  email_invalid: "Ingresa un correo válido",
  read_only_note:
    "Los afiliados no son miembros de ninguna organización ni pueden escribir. Heredan únicamente los accesos de lectura que tenga {{agency}}.",
  send: "Enviar invitación",
  sending: "Enviando…",
  sent_title: "Invitación enviada",
  sent_desc_prefix: "Invitamos a",
  sent_desc_suffix: "Quedará afiliada en cuanto acepte desde su portal.",
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
  email_invalid: "Enter a valid email",
  read_only_note:
    "Affiliates are not members of any organization and cannot write. They only inherit the read access that {{agency}} has.",
  send: "Send invitation",
  sending: "Sending…",
  sent_title: "Invitation sent",
  sent_desc_prefix: "We invited",
  sent_desc_suffix: "They'll be affiliated as soon as they accept from their portal.",
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
  email_invalid: "Informe um e-mail válido",
  read_only_note:
    "Os afiliados não são membros de nenhuma organização nem podem escrever. Herdam apenas os acessos de leitura que a {{agency}} tiver.",
  send: "Enviar convite",
  sending: "Enviando…",
  sent_title: "Convite enviado",
  sent_desc_prefix: "Convidamos",
  sent_desc_suffix: "Será afiliada assim que aceitar no portal dela.",
  invite_another: "Afiliar outra",
  done: "Pronto",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
