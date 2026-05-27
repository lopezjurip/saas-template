"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  type DocumentTripletCountry,
  DocumentTripletFields,
} from "~/app/[locale]/auth/_components/document-triplet-fields";
import { useRosetta } from "~/hooks/use-rosetta";
import { actionInviteMember } from "../actions";
import { type InviteMemberValues, inviteMemberSchema } from "../schemas";

const LOCALE_ES = {
  title: "¿A quién quieres invitar?",
  description: "Mandaremos la invitación. En el siguiente paso podrás definir los permisos.",
  channel_email: "Por email",
  channel_document: "Por documento",
  email_label: "Correo",
  email_placeholder: "nombre@empresa.cl",
  submit: "Invitar",
  submitting: "Enviando…",
  cancel: "Cancelar",
  form_invalid: "Formulario inválido",
  link_ready: "Link de invitación creado. Compártelo manualmente con el invitado:",
  copy_link: "Copiar link",
  link_copied: "¡Copiado!",
  define_permissions: "Definir permisos",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    title: "Who do you want to invite?",
    description: "We'll send the invitation. In the next step you'll define their permissions.",
    channel_email: "By email",
    channel_document: "By document",
    email_label: "Email",
    email_placeholder: "name@company.com",
    submit: "Invite",
    submitting: "Sending…",
    cancel: "Cancel",
    form_invalid: "Invalid form",
    link_ready: "Invitation link created. Share it manually with the invitee:",
    copy_link: "Copy link",
    link_copied: "Copied!",
    define_permissions: "Set permissions",
  } satisfies typeof LOCALE_ES,
  pt: {
    title: "Quem você quer convidar?",
    description: "Vamos enviar o convite. No próximo passo você define as permissões.",
    channel_email: "Por e-mail",
    channel_document: "Por documento",
    email_label: "E-mail",
    email_placeholder: "nome@empresa.com",
    submit: "Convidar",
    submitting: "Enviando…",
    cancel: "Cancelar",
    form_invalid: "Formulário inválido",
    link_ready: "Link de convite criado. Compartilhe manualmente com o convidado:",
    copy_link: "Copiar link",
    link_copied: "Copiado!",
    define_permissions: "Definir permissões",
  } satisfies typeof LOCALE_ES,
};

interface Props {
  organization_id: number;
  countries: DocumentTripletCountry[];
  membersHref: string;
  editHrefBase: string;
}

export function InviteMemberForm({ organization_id, countries, membersHref, editHrefBase }: Props) {
  const editHrefFor = (membership_id: number) => `${editHrefBase}/${membership_id}/edit`;
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [documentResult, setDocumentResult] = useState<{ url: string; membership_id: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      channel: "email",
      organization_id,
      invitation_email: "",
      address_level0_id: "CL",
      profile_identity_document_kind: "nin",
      profile_identity_document_value: "",
    },
  });

  const channel = form.watch("channel");

  const onSubmit = form.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const res = await actionInviteMember(values);
      if (res?.serverError) {
        setServerError(res.serverError);
        return;
      }
      if (res?.validationErrors) {
        setServerError(t("form_invalid"));
        return;
      }
      if (!res?.data) return;
      if (res.data.channel === "document") {
        setDocumentResult({ url: res.data.invitation_url, membership_id: res.data.membership_id });
        return;
      }
      // email channel: invitation email went out; jump to permissions editor.
      router.push(editHrefFor(res.data.membership_id));
    });
  });

  if (documentResult) {
    return (
      <div className="flex flex-col gap-3">
        <Alert>
          <AlertDescription>{t("link_ready")}</AlertDescription>
        </Alert>
        <div className="bg-muted rounded-md p-2 text-xs break-all">{documentResult.url}</div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={async () => {
              await navigator.clipboard.writeText(documentResult.url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            <Copy className="mr-2 h-4 w-4" />
            {copied ? t("link_copied") : t("copy_link")}
          </Button>
          <Button type="button" className="flex-1" onClick={() => router.push(editHrefFor(documentResult.membership_id))}>
            {t("define_permissions")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h3 className="text-base font-medium">{t("title")}</h3>
      <p className="text-muted-foreground text-sm">{t("description")}</p>

      <div className="flex gap-2">
        <Button
          type="button"
          variant={channel === "email" ? "default" : "outline"}
          className="flex-1"
          onClick={() => form.setValue("channel", "email")}
        >
          {t("channel_email")}
        </Button>
        <Button
          type="button"
          variant={channel === "document" ? "default" : "outline"}
          className="flex-1"
          onClick={() => form.setValue("channel", "document")}
        >
          {t("channel_document")}
        </Button>
      </div>

      {channel === "email" ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="invitation_email">{t("email_label")}</Label>
          <Input
            id="invitation_email"
            type="email"
            autoComplete="email"
            placeholder={t("email_placeholder")}
            aria-invalid={!!form.formState.errors.invitation_email}
            {...form.register("invitation_email")}
          />
          {form.formState.errors.invitation_email && (
            <p className="text-destructive text-xs">{form.formState.errors.invitation_email.message}</p>
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

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" disabled={pending} onClick={() => router.push(membersHref)}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
