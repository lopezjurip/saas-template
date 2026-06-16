"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { ArrowRight, Check, Copy, FileText, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { type DocumentTripletCountry, DocumentTripletFields } from "~/app/auth/_components/document-triplet-fields";
import { useRosetta } from "~/lib/i18n.client";
import { ROUTE, ROUTE_HREF } from "~/lib/route";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionInviteMember } from "../actions";
import { type InviteMemberValues, inviteMemberSchema } from "../schemas";

type InviteChannel = "email" | "phone" | "document";

const CHANNELS: {
  value: InviteChannel;
  labelKey: "channel_email" | "channel_phone" | "channel_document";
  Icon: typeof Mail;
}[] = /*#__PURE__*/ [
  { value: "email", labelKey: "channel_email", Icon: Mail },
  { value: "phone", labelKey: "channel_phone", Icon: Phone },
  { value: "document", labelKey: "channel_document", Icon: FileText },
];

interface Props {
  organization_id: number;
  countries: DocumentTripletCountry[];
  membersHref: Route;
  locale: string;
  tenantSlug: string;
}

export function InviteMemberForm({ organization_id, countries, membersHref, locale, tenantSlug }: Props) {
  function editHrefFor(organization_membership_id: number) {
    return ROUTE("/t/[tenant_slug]/[organization_id]/settings/members/[organization_membership_id]/edit", {
      tenant_slug: tenantSlug,
      organization_id,
      organization_membership_id,
    });
  }
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [documentResult, setDocumentResult] = useState<{ url: string; organization_membership_id: number } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      channel: "email",
      organization_id,
      invitation_email: "",
      invitation_phone: "",
      address_level0_id: "CL",
      profile_identity_document_kind: "nin",
      profile_identity_document_value: "",
    },
  });

  const channel = form.watch("channel");

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const [data, error] = await ErrorSafeAction.unwrap(actionInviteMember(values));
      if (error instanceof ErrorSafeActionServer) {
        setServerError(error.serverError);
        return;
      }
      if (error instanceof ErrorSafeActionValidation) {
        setServerError(t("form_invalid"));
        return;
      }
      if (error) return;
      if (data["channel"] === "document" || data["channel"] === "phone") {
        setDocumentResult({
          url: data["invitation_url"],
          organization_membership_id: data["organization_membership_id"],
        });
        return;
      }
      // email channel: invitation email went out; jump to permissions editor.
      router.push(ROUTE_HREF(editHrefFor(data["organization_membership_id"])));
    });
  });

  if (documentResult) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 rounded-xl border border-emerald-600/30 bg-emerald-500/6 p-4">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
            <Check size={18} strokeWidth={2.25} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <strong className="text-foreground text-sm font-semibold">{t("created_title")}</strong>
            <span className="text-muted-foreground text-xs leading-normal text-pretty">{t("created_desc")}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("share_title")}
          </span>
          <div className="border-border bg-muted/40 flex items-center gap-2 rounded-md border p-1.5 pl-3">
            <span className="text-foreground min-w-0 flex-1 truncate font-mono text-xs">{documentResult.url}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0"
              onClick={async () => {
                await navigator.clipboard.writeText(documentResult.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <Copy size={13} /> {copied ? t("link_copied") : t("copy_link")}
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 px-3 py-2.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <span className="mt-px shrink-0 text-amber-600 dark:text-amber-400">
            <MessageCircle size={14} />
          </span>
          <span className="text-xs leading-normal text-amber-800 text-pretty dark:text-amber-200">
            {t("share_warning")}
          </span>
        </div>

        <div className="border-border flex items-center justify-between gap-3 border-t pt-3.5">
          <Button type="button" variant="ghost" onClick={() => router.push(ROUTE_HREF(membersHref))}>
            {t("back_members")}
          </Button>
          <Button
            type="button"
            onClick={() => router.push(ROUTE_HREF(editHrefFor(documentResult["organization_membership_id"])))}
          >
            <ShieldCheck size={15} /> {t("define_permissions")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border-border bg-background flex flex-col gap-5 rounded-xl border p-5">
      <div className="flex flex-col gap-2">
        <span className="text-foreground text-xs font-medium">{t("channel_title")}</span>
        <div role="tablist" aria-label={t("channel_title")} className="bg-muted grid grid-cols-3 gap-1 rounded-md p-1">
          {CHANNELS.map((tab) => {
            const on = tab.value === channel;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => form.setValue("channel", tab.value)}
                className={cn(
                  "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-[background,color]",
                  on
                    ? "bg-background text-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.1)]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon size={14} /> {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {channel === "email" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invitation_email">{t("email_label")}</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Mail size={15} />
            </span>
            <Input
              id="invitation_email"
              type="email"
              autoComplete="email"
              className="pl-9"
              placeholder={t("email_placeholder")}
              aria-invalid={!!form.formState.errors.invitation_email}
              {...form.register("invitation_email")}
            />
          </div>
          {form.formState.errors.invitation_email && (
            <p className="text-destructive text-xs">{form.formState.errors.invitation_email.message}</p>
          )}
        </div>
      ) : channel === "phone" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invitation_phone">{t("phone_label")}</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
              <Phone size={15} />
            </span>
            <Input
              id="invitation_phone"
              type="tel"
              autoComplete="tel"
              className="pl-9"
              placeholder={t("phone_placeholder")}
              aria-invalid={!!form.formState.errors.invitation_phone}
              {...form.register("invitation_phone")}
            />
          </div>
          {form.formState.errors.invitation_phone && (
            <p className="text-destructive text-xs">{form.formState.errors.invitation_phone.message}</p>
          )}
        </div>
      ) : (
        <DocumentTripletFields form={form} countries={countries} required />
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="border-border flex items-center justify-between gap-3 border-t pt-3.5">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
          <ShieldCheck size={13} /> {t("perms_next")}
        </span>
        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")} <ArrowRight size={15} />
        </Button>
      </div>
    </form>
  );
}

const LOCALE_ES = {
  channel_title: "Canal de invitación",
  channel_email: "Correo",
  channel_document: "Documento",
  channel_phone: "Teléfono",
  email_label: "Correo de la persona",
  email_placeholder: "nombre@empresa.cl",
  phone_label: "Número de teléfono",
  phone_placeholder: "+56 9 1234 5678",
  perms_next: "Permisos en el paso siguiente",
  submit: "Crear invitación",
  submitting: "Enviando…",
  form_invalid: "Formulario inválido",
  created_title: "Invitación creada",
  created_desc: "Generamos un enlace de aceptación. Compártelo manualmente con el invitado.",
  share_title: "Enlace para compartir",
  share_warning: "Por este canal no enviamos aviso automático. Comparte el enlace tú mismo (WhatsApp, mensaje, etc.).",
  copy_link: "Copiar",
  link_copied: "¡Copiado!",
  back_members: "Volver a miembros",
  define_permissions: "Configurar permisos",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    channel_title: "Invitation channel",
    channel_email: "Email",
    channel_document: "Document",
    channel_phone: "Phone",
    email_label: "Person's email",
    email_placeholder: "name@company.com",
    phone_label: "Phone number",
    phone_placeholder: "+56 9 1234 5678",
    perms_next: "Permissions in the next step",
    submit: "Create invitation",
    submitting: "Sending…",
    form_invalid: "Invalid form",
    created_title: "Invitation created",
    created_desc: "We generated an acceptance link. Share it manually with the invitee.",
    share_title: "Link to share",
    share_warning:
      "We don't send an automatic notice on this channel. Share the link yourself (WhatsApp, message, etc.).",
    copy_link: "Copy",
    link_copied: "Copied!",
    back_members: "Back to members",
    define_permissions: "Set permissions",
  } satisfies typeof LOCALE_ES,
  pt: {
    channel_title: "Canal do convite",
    channel_email: "E-mail",
    channel_document: "Documento",
    channel_phone: "Telefone",
    email_label: "E-mail da pessoa",
    email_placeholder: "nome@empresa.com",
    phone_label: "Número de telefone",
    phone_placeholder: "+56 9 1234 5678",
    perms_next: "Permissões na próxima etapa",
    submit: "Criar convite",
    submitting: "Enviando…",
    form_invalid: "Formulário inválido",
    created_title: "Convite criado",
    created_desc: "Geramos um link de aceitação. Compartilhe manualmente com o convidado.",
    share_title: "Link para compartilhar",
    share_warning:
      "Por este canal não enviamos aviso automático. Compartilhe o link você mesmo (WhatsApp, mensagem, etc.).",
    copy_link: "Copiar",
    link_copied: "Copiado!",
    back_members: "Voltar para membros",
    define_permissions: "Configurar permissões",
  } satisfies typeof LOCALE_ES,
};
